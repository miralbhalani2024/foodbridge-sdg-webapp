/**
 * donationController.js — the CRUD logic for food donations.
 *
 *  CRUD → HTTP method mapping (REST):
 *   Create  → POST   /api/donations
 *   Read    → GET    /api/donations   and   GET /api/donations/:id
 *   Update  → PUT    /api/donations/:id
 *   Delete  → DELETE /api/donations/:id
 *  Plus two "action" endpoints for the workflow:
 *           → PATCH  /api/donations/:id/claim    (NGO claims food)
 *           → PATCH  /api/donations/:id/pickup   (mark as collected)
 */
const Donation = require('../models/Donation');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../middleware/auth');
const { impactFromKg } = require('../utils/impact');

const POPULATE_DONOR = { path: 'donor', select: 'name organization city phone' };
const POPULATE_NGO = { path: 'claimedBy', select: 'name organization city phone' };

// Any listing still 'available' after its expiry time becomes 'expired'
const expireOldListings = () =>
  Donation.updateMany({ status: 'available', expiresAt: { $lt: new Date() } }, { status: 'expired' });

const isOwner = (donation, user) => donation.donor._id.toString() === user._id.toString();

// GET /api/donations?status=available&city=Vadodara&category=cooked&search=rice
exports.getDonations = asyncHandler(async (req, res) => {
  await expireOldListings();

  const { status, city, category, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (city) filter.city = new RegExp(`^${city.trim()}$`, 'i'); // case-insensitive exact match
  if (search) filter.title = new RegExp(search.trim(), 'i'); // case-insensitive "contains"

  const donations = await Donation.find(filter)
    .populate(POPULATE_DONOR)
    .populate(POPULATE_NGO)
    .sort({ createdAt: -1 }); // newest first

  res.json({ success: true, count: donations.length, donations });
});

// GET /api/donations/mine  → donor: what I listed | ngo: what I claimed
exports.getMyDonations = asyncHandler(async (req, res) => {
  await expireOldListings();
  const filter = req.user.role === 'ngo' ? { claimedBy: req.user._id } : { donor: req.user._id };
  const donations = await Donation.find(filter).populate(POPULATE_DONOR).populate(POPULATE_NGO).sort({ createdAt: -1 });

  // personal impact = only food that actually reached people (picked up)
  const pickedKg = donations.filter((d) => d.status === 'picked_up').reduce((sum, d) => sum + d.quantityKg, 0);
  res.json({ success: true, count: donations.length, impact: impactFromKg(pickedKg), donations });
});

// GET /api/donations/:id
exports.getDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id).populate(POPULATE_DONOR).populate(POPULATE_NGO);
  if (!donation) throw httpError(404, 'Donation not found');
  res.json({ success: true, donation });
});

// POST /api/donations   (donor only)
exports.createDonation = asyncHandler(async (req, res) => {
  const { title, description, category, quantityKg, expiresAt, pickupAddress, city } = req.body;

  if (expiresAt && new Date(expiresAt) <= new Date()) throw httpError(400, 'Expiry time must be in the future');

  const donation = await Donation.create({
    title,
    description,
    category,
    quantityKg,
    expiresAt,
    pickupAddress,
    city: city || req.user.city,
    donor: req.user._id, // donor comes from the token, NOT from the request body (security)
  });
  res.status(201).json({ success: true, donation });
});

// PUT /api/donations/:id   (owner only, and only while still available)
exports.updateDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id).populate(POPULATE_DONOR);
  if (!donation) throw httpError(404, 'Donation not found');
  if (!isOwner(donation, req.user)) throw httpError(403, 'You can only edit your own listings');
  if (donation.status !== 'available') throw httpError(400, `Cannot edit a listing that is '${donation.status}'`);

  // whitelist the fields that are allowed to change
  ['title', 'description', 'category', 'quantityKg', 'expiresAt', 'pickupAddress', 'city'].forEach((f) => {
    if (req.body[f] !== undefined) donation[f] = req.body[f];
  });
  await donation.save(); // save() runs schema validation again
  res.json({ success: true, donation });
});

// DELETE /api/donations/:id   (owner or admin)
exports.deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id).populate(POPULATE_DONOR);
  if (!donation) throw httpError(404, 'Donation not found');
  if (!isOwner(donation, req.user) && req.user.role !== 'admin') {
    throw httpError(403, 'You can only delete your own listings');
  }
  await donation.deleteOne();
  res.json({ success: true, message: 'Donation deleted' });
});

// PATCH /api/donations/:id/claim   (ngo only)
exports.claimDonation = asyncHandler(async (req, res) => {
  // ATOMIC update: the filter only matches if it is STILL available and not expired.
  // So if two NGOs click "Claim" at the same moment, only one of them succeeds.
  const donation = await Donation.findOneAndUpdate(
    { _id: req.params.id, status: 'available', expiresAt: { $gt: new Date() } },
    { status: 'claimed', claimedBy: req.user._id, claimedAt: new Date() },
    { new: true } // return the updated document
  )
    .populate(POPULATE_DONOR)
    .populate(POPULATE_NGO);

  if (!donation) throw httpError(409, 'This donation is no longer available'); // 409 Conflict
  res.json({ success: true, message: 'Claimed! Please collect it before it expires.', donation });
});

// PATCH /api/donations/:id/pickup   (the NGO who claimed it, or the donor)
exports.markPickedUp = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id).populate(POPULATE_DONOR);
  if (!donation) throw httpError(404, 'Donation not found');
  if (donation.status !== 'claimed') throw httpError(400, 'Only a claimed donation can be marked as picked up');

  const isClaimer = donation.claimedBy && donation.claimedBy.toString() === req.user._id.toString();
  if (!isClaimer && !isOwner(donation, req.user)) throw httpError(403, 'Not allowed');

  donation.status = 'picked_up';
  donation.pickedUpAt = new Date();
  await donation.save();
  await donation.populate(POPULATE_NGO);
  res.json({ success: true, message: 'Marked as picked up — food rescued! 🎉', donation });
});

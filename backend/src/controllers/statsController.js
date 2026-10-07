/**
 * statsController.js — public SDG impact numbers, calculated with
 * MongoDB AGGREGATION PIPELINES ($match → $group → $sort), i.e. the database
 * does the counting/summing instead of loading every document into Node.
 */
const Donation = require('../models/Donation');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { impactFromKg } = require('../utils/impact');

// GET /api/stats
exports.getStats = asyncHandler(async (req, res) => {
  // 1) count + total kg grouped by status
  const byStatus = await Donation.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, kg: { $sum: '$quantityKg' } } },
  ]);

  // 2) rescued (picked up) kg grouped by category
  const byCategory = await Donation.aggregate([
    { $match: { status: 'picked_up' } },
    { $group: { _id: '$category', kg: { $sum: '$quantityKg' } } },
    { $sort: { kg: -1 } },
  ]);

  // 3) top cities by rescued food
  const topCities = await Donation.aggregate([
    { $match: { status: 'picked_up' } },
    { $group: { _id: '$city', kg: { $sum: '$quantityKg' }, count: { $sum: 1 } } },
    { $sort: { kg: -1 } },
    { $limit: 5 },
  ]);

  const [donors, ngos] = await Promise.all([
    User.countDocuments({ role: 'donor' }),
    User.countDocuments({ role: 'ngo' }),
  ]);

  // turn [{_id:'available', count:3, kg:12}, ...] into { available: {count, kg}, ... }
  const status = { available: { count: 0, kg: 0 }, claimed: { count: 0, kg: 0 }, picked_up: { count: 0, kg: 0 }, expired: { count: 0, kg: 0 } };
  byStatus.forEach((s) => { status[s._id] = { count: s.count, kg: s.kg }; });

  const totalListings = Object.values(status).reduce((sum, s) => sum + s.count, 0);
  const rescueRate = totalListings ? Math.round((status.picked_up.count / totalListings) * 100) : 0;

  res.json({
    success: true,
    impact: impactFromKg(status.picked_up.kg), // { kg, meals, co2SavedKg }
    status,
    rescueRate,
    community: { donors, ngos },
    byCategory: byCategory.map((c) => ({ category: c._id, kg: Math.round(c.kg * 10) / 10 })),
    topCities: topCities.map((c) => ({ city: c._id, kg: Math.round(c.kg * 10) / 10, count: c.count })),
  });
});

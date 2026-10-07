/**
 * Donation model — one listing of surplus food.
 *
 * Life-cycle (status):  available ──claim──▶ claimed ──pickup──▶ picked_up
 *                           │
 *                           └── (expiry time passes) ──▶ expired
 */
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'bakery', 'fruits-vegetables'],
      required: [true, 'Category is required'],
    },
    quantityKg: { type: Number, required: [true, 'Quantity is required'], min: [0.5, 'Minimum 0.5 kg'] },
    expiresAt: { type: Date, required: [true, 'Expiry time is required'] },
    pickupAddress: { type: String, required: [true, 'Pickup address is required'], trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    status: {
      type: String,
      enum: ['available', 'claimed', 'picked_up', 'expired'],
      default: 'available',
    },
    // ref:'User' creates a relationship → we can use .populate('donor') to get the user details
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    claimedAt: Date,
    pickedUpAt: Date,
  },
  { timestamps: true }
);

// Index → makes the most common search (by status + city) faster
donationSchema.index({ status: 1, city: 1 });

module.exports = mongoose.model('Donation', donationSchema);

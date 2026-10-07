/**
 * seed.js — fills the database with SAMPLE data so the demo looks real.
 * Run:  npm run seed   (from the backend folder)   — WARNING: clears old data first.
 *
 * Demo logins (password for all: password123)
 *   donor@foodbridge.in   → Hotel / restaurant (donor)
 *   ngo@foodbridge.in     → NGO (claims food)
 *   admin@foodbridge.in   → Admin
 */
require('dotenv').config({ quiet: true });
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodbridge';
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Donation = require('./models/Donation');

const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

const run = async () => {
  await connectDB();
  await Donation.deleteMany({});
  await User.deleteMany({});

  // User.create() (not insertMany) so the pre-save hook hashes the passwords
  const [donor, donor2, ngo, ngo2] = await User.create([
    { name: 'Ravi Patel', email: 'donor@foodbridge.in', password: 'password123', role: 'donor', organization: 'Hotel Surya Palace', city: 'Vadodara', phone: '9876500001' },
    { name: 'Meera Shah', email: 'donor2@foodbridge.in', password: 'password123', role: 'donor', organization: 'Annapurna Caterers', city: 'Ahmedabad', phone: '9876500002' },
    { name: 'Asha Foundation', email: 'ngo@foodbridge.in', password: 'password123', role: 'ngo', organization: 'Asha Food Bank', city: 'Vadodara', phone: '9876500003' },
    { name: 'Roti Seva', email: 'ngo2@foodbridge.in', password: 'password123', role: 'ngo', organization: 'Roti Seva Trust', city: 'Ahmedabad', phone: '9876500004' },
    { name: 'Admin', email: 'admin@foodbridge.in', password: 'password123', role: 'admin', city: 'Vadodara' },
  ]);

  await Donation.create([
    // available
    { title: 'Veg biryani & dal (wedding surplus)', description: 'Freshly cooked, packed in foil trays. Serves ~60.', category: 'cooked', quantityKg: 25, expiresAt: hoursFromNow(5), pickupAddress: 'Surya Palace, Sayajigunj', city: 'Vadodara', donor: donor._id },
    { title: 'Bread loaves and buns', description: 'Baked this morning.', category: 'bakery', quantityKg: 8, expiresAt: hoursFromNow(20), pickupAddress: 'Alkapuri Main Road', city: 'Vadodara', donor: donor._id },
    { title: 'Seasonal vegetables (mixed)', description: 'Slightly imperfect but fresh — tomatoes, potatoes, onions.', category: 'fruits-vegetables', quantityKg: 40, expiresAt: hoursFromNow(48), pickupAddress: 'Navrangpura Market', city: 'Ahmedabad', donor: donor2._id },
    { title: 'Packaged biscuits & juice boxes', description: 'Sealed, 2 months before best-before date.', category: 'packaged', quantityKg: 15, expiresAt: hoursFromNow(72), pickupAddress: 'CG Road', city: 'Ahmedabad', donor: donor2._id },
    // claimed
    { title: 'Rice & chole (lunch buffet)', category: 'cooked', quantityKg: 18, expiresAt: hoursFromNow(3), pickupAddress: 'Surya Palace, Sayajigunj', city: 'Vadodara', donor: donor._id, status: 'claimed', claimedBy: ngo._id, claimedAt: new Date() },
    // picked up (these count in the impact numbers)
    { title: 'Roti & sabzi (dinner surplus)', category: 'cooked', quantityKg: 30, expiresAt: hoursFromNow(-20), pickupAddress: 'Surya Palace', city: 'Vadodara', donor: donor._id, status: 'picked_up', claimedBy: ngo._id, claimedAt: hoursFromNow(-26), pickedUpAt: hoursFromNow(-25) },
    { title: 'Wheat flour & rice sacks', category: 'raw', quantityKg: 50, expiresAt: hoursFromNow(-48), pickupAddress: 'Navrangpura', city: 'Ahmedabad', donor: donor2._id, status: 'picked_up', claimedBy: ngo2._id, claimedAt: hoursFromNow(-60), pickedUpAt: hoursFromNow(-55) },
    { title: 'Bananas & apples', category: 'fruits-vegetables', quantityKg: 22, expiresAt: hoursFromNow(-30), pickupAddress: 'Alkapuri', city: 'Vadodara', donor: donor._id, status: 'picked_up', claimedBy: ngo._id, claimedAt: hoursFromNow(-40), pickedUpAt: hoursFromNow(-38) },
    { title: 'Cakes & pastries', category: 'bakery', quantityKg: 6, expiresAt: hoursFromNow(-10), pickupAddress: 'CG Road', city: 'Ahmedabad', donor: donor2._id, status: 'picked_up', claimedBy: ngo2._id, claimedAt: hoursFromNow(-14), pickedUpAt: hoursFromNow(-13) },
    // expired (wasted — nobody claimed it in time)
    { title: 'Paneer curry', category: 'cooked', quantityKg: 5, expiresAt: hoursFromNow(-2), pickupAddress: 'Sayajigunj', city: 'Vadodara', donor: donor._id, status: 'expired' },
  ]);

  console.log('🌱 Seed complete: 5 users, 10 donations');
  console.log('   Login with donor@foodbridge.in / ngo@foodbridge.in / admin@foodbridge.in — password: password123');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

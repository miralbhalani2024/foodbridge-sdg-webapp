/**
 * User model — every person using FoodBridge.
 *  role 'donor' → restaurants, hostels, caterers, households that have surplus food
 *  role 'ngo'   → NGOs / food banks / volunteers who collect and distribute it
 *  role 'admin' → can moderate (delete) any listing
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    // select:false → password is NEVER returned in queries unless explicitly asked for
    password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters'], select: false },
    role: { type: String, enum: ['donor', 'ngo', 'admin'], default: 'donor' },
    organization: { type: String, trim: true },
    city: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

// Mongoose "pre-save hook": hash the password before storing it.
// We NEVER store plain-text passwords. bcrypt adds a random salt and hashes 10 rounds.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return; // don't re-hash an already hashed password
  this.password = await bcrypt.hash(this.password, 10);
});

// Instance method: compare a typed password with the stored hash
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

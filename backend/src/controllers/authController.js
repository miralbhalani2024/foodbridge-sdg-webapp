/**
 * authController.js — register, login, and "who am I".
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../middleware/auth');

// Creates a signed JWT containing only the user's id
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  organization: user.organization,
  city: user.city,
});

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, organization, city, phone } = req.body;

  // Public sign-up may only create donor or ngo accounts (never admin)
  const safeRole = ['donor', 'ngo'].includes(role) ? role : 'donor';

  const user = await User.create({ name, email, password, role: safeRole, organization, city, phone });
  res.status(201).json({ success: true, token: signToken(user._id), user: userResponse(user) }); // 201 Created
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');

  // +password → include the password field (it is select:false in the schema)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw httpError(401, 'Invalid email or password'); // same message for both → doesn't leak which one was wrong
  }
  res.json({ success: true, token: signToken(user._id), user: userResponse(user) });
});

// GET /api/auth/me  (protected)
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: userResponse(req.user) });
});

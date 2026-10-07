/**
 * auth.js — AUTHENTICATION & AUTHORIZATION middleware.
 *
 *  Authentication = "Who are you?"     → protect() verifies the JWT token.
 *  Authorization  = "What may you do?" → authorize('ngo') checks the user's role.
 *
 * The client sends the token in the header:  Authorization: Bearer <token>
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) throw httpError(401, 'Not logged in — token missing');

  let decoded;
  try {
    // verify() checks the signature with our secret AND that the token hasn't expired
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    throw httpError(401, 'Invalid or expired token — please log in again');
  }

  req.user = await User.findById(decoded.id); // attach the logged-in user to the request
  if (!req.user) throw httpError(401, 'User no longer exists');
  next();
});

// Usage: router.post('/', protect, authorize('donor'), createDonation)
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(httpError(403, `Role '${req.user.role}' is not allowed to do this`)); // 403 Forbidden
  }
  next();
};

module.exports = { protect, authorize, httpError };

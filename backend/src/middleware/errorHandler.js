/**
 * errorHandler.js — central error handling.
 * Express recognises an ERROR middleware because it has 4 parameters: (err, req, res, next).
 */

// Runs when no route matched → 404 Not Found
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// Converts any error into a clean JSON response with a proper HTTP status code
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose validation failed (e.g. required field missing) → 400 Bad Request
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  // Invalid MongoDB ObjectId in URL → 400
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  // Duplicate unique field (e.g. email already registered) → 409 Conflict
  if (err.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(err.keyValue).join(', ')} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    // show stack trace only while developing
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };

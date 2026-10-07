/**
 * asyncHandler — wraps an async route function so that if it throws
 * (or a Promise rejects), the error is passed to next() → errorHandler.
 * Without this, every controller would need its own try/catch block.
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

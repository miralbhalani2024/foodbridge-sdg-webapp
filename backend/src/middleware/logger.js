/**
 * logger.js — a CUSTOM middleware.
 * A middleware is a function (req, res, next) that runs between the request
 * arriving and the response being sent. Calling next() passes control onward.
 */
const logger = (req, res, next) => {
  const start = Date.now();
  // 'finish' fires once the response has been sent, so we know the status code
  res.on('finish', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start} ms)`);
    }
  });
  next();
};

module.exports = logger;

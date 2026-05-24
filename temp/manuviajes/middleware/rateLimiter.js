// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // limit each IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
module.exports = limiter;

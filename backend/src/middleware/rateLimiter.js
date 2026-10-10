const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, error: 'TOO_MANY_LOGIN_ATTEMPTS' },
});
module.exports = { loginLimiter };

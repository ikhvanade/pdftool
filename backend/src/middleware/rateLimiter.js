const rateLimit = require('express-rate-limit');

// 10 percobaan login per 15 menit per IP. Cukup ketat buat cegah brute force
// tapi gak terlalu ganggu user asli yang salah ketik password sesekali.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'TOO_MANY_LOGIN_ATTEMPTS' },
});

module.exports = { loginLimiter };

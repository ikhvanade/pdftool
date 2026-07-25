const pool = require('../config/db');
const env = require('../config/env');
const { ok } = require('../utils/response');

// GET /api/guest/quota - dipanggil frontend buat nampilin badge "Sisa X/5 pemakaian"
async function getQuota(req, res, next) {
  try {
    if (req.user) {
      return ok(res, { unlimited: true });
    }

    const guestToken = req.signedCookies ? req.signedCookies['guest_token'] : null;
    if (!guestToken) {
      return ok(res, { unlimited: false, used: 0, limit: env.guestQuotaLimit, remaining: env.guestQuotaLimit });
    }

    const [rows] = await pool.execute(
      'SELECT usage_count FROM guest_usage WHERE guest_token = ?',
      [guestToken]
    );
    const used = rows[0] ? rows[0].usage_count : 0;

    return ok(res, {
      unlimited: false,
      used,
      limit: env.guestQuotaLimit,
      remaining: Math.max(env.guestQuotaLimit - used, 0),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuota };

const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const env = require('../config/env');

const COOKIE_NAME = 'guest_token';
const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;

async function guestQuotaCheck(req, res, next) {
  try {
    if (req.user) {
      req.incrementGuestUsage = async () => {};
      return next();
    }

    let guestToken = req.signedCookies ? req.signedCookies[COOKIE_NAME] : null;

    if (!guestToken) {
      guestToken = uuidv4();
      await pool.execute('INSERT INTO guest_usage (guest_token, usage_count) VALUES (?, 0)', [guestToken]);
      res.cookie(COOKIE_NAME, guestToken, {
        httpOnly: true, signed: true, secure: env.nodeEnv === 'production',
        sameSite: 'lax', maxAge: COOKIE_MAX_AGE_MS,
      });
    }

    const [rows] = await pool.execute('SELECT usage_count FROM guest_usage WHERE guest_token = ?', [guestToken]);

    if (rows.length === 0) {
      await pool.execute('INSERT INTO guest_usage (guest_token, usage_count) VALUES (?, 0)', [guestToken]);
      req.guestUsageCount = 0;
    } else {
      req.guestUsageCount = rows[0].usage_count;
    }

    if (req.guestUsageCount >= env.guestQuotaLimit) {
      return res.status(403).json({ success: false, error: 'GUEST_QUOTA_EXCEEDED' });
    }

    req.guestToken = guestToken;
    req.incrementGuestUsage = async () => {
      await pool.execute(
        'UPDATE guest_usage SET usage_count = usage_count + 1, last_used_at = NOW() WHERE guest_token = ?',
        [guestToken]
      );
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = guestQuotaCheck;

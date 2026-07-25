const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const env = require('../config/env');

const COOKIE_NAME = 'guest_token';
const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365; // 1 tahun, cukup panjang buat "lifetime" quota

/**
 * Middleware wajib dipasang SETELAH `attachUserIfPresent`.
 *
 * Alur (sesuai spek CLAUDE.md):
 * 1. Kalau req.user ada (JWT valid) -> skip semua, next() langsung, unlimited.
 * 2. Kalau tidak ada -> cek signed cookie guest_token.
 *    - Belum ada -> generate uuid baru, set signed httpOnly cookie, insert row (usage_count=0).
 *    - Sudah ada -> ambil usage_count dari DB.
 * 3. Kalau usage_count >= limit -> 403 GUEST_QUOTA_EXCEEDED.
 * 4. Kalau lolos -> next() jalan dulu. Controller WAJIB manggil `req.incrementGuestUsage()`
 *    SETELAH proses berhasil (bukan di sini), sesuai aturan "increment cuma kalau proses sukses".
 */
async function guestQuotaCheck(req, res, next) {
  try {
    if (req.user) {
      req.incrementGuestUsage = async () => {}; // no-op buat logged-in user
      return next();
    }

    let guestToken = req.signedCookies ? req.signedCookies[COOKIE_NAME] : null;

    if (!guestToken) {
      guestToken = uuidv4();
      await pool.execute(
        'INSERT INTO guest_usage (guest_token, usage_count) VALUES (?, 0)',
        [guestToken]
      );
      res.cookie(COOKIE_NAME, guestToken, {
        httpOnly: true,
        signed: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE_MS,
      });
    }

    const [rows] = await pool.execute(
      'SELECT usage_count FROM guest_usage WHERE guest_token = ?',
      [guestToken]
    );

    // Edge case: cookie ada tapi row-nya somehow ke-delete manual dari DB -> treat sebagai baru
    if (rows.length === 0) {
      await pool.execute(
        'INSERT INTO guest_usage (guest_token, usage_count) VALUES (?, 0)',
        [guestToken]
      );
      req.guestUsageCount = 0;
    } else {
      req.guestUsageCount = rows[0].usage_count;
    }

    if (req.guestUsageCount >= env.guestQuotaLimit) {
      return res.status(403).json({ success: false, error: 'GUEST_QUOTA_EXCEEDED' });
    }

    req.guestToken = guestToken;

    // Atomic increment (hindari race condition read-then-write) - dipanggil manual
    // oleh controller setelah proses beneran sukses.
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

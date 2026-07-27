const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Middleware ini TIDAK menolak request kalau JWT gak ada - dia cuma
// nge-attach req.user kalau JWT valid. Buat endpoint yang WAJIB login,
// pake `requireAuth` di bawah. Buat endpoint yang boleh guest ATAU login
// (pdf/qr processing), pake `attachUserIfPresent` lalu `guestQuotaCheck`.

function getTokenFromHeader(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

function attachUserIfPresent(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { id: payload.sub, username: payload.username };
  } catch (err) {
    // Token invalid/expired -> treat sebagai guest, jangan throw,
    // biar tetep bisa lanjut sebagai guest (dan kena quota check).
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }
  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'TOKEN_INVALID_OR_EXPIRED' });
  }
}

// Dipake buat endpoint yang butuh tau "siapa guest ini" (buat ownership check)
// TAPI TIDAK BOLEH nge-block/nge-enforce quota - misal cek status job atau
// download hasil kerjaan sendiri. Beda dengan guestQuotaCheck yang enforce limit.
function identifyGuestToken(req, res, next) {
  req.guestToken = (req.signedCookies && req.signedCookies['guest_token']) || null;
  next();
}

module.exports = { attachUserIfPresent, requireAuth, identifyGuestToken };

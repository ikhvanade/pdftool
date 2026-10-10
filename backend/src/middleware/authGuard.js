const jwt = require('jsonwebtoken');
const env = require('../config/env');

function getTokenFromHeader(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

function attachUserIfPresent(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) { req.user = null; return next(); }
  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { id: payload.sub, username: payload.username };
  } catch (err) {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'TOKEN_INVALID_OR_EXPIRED' });
  }
}

function identifyGuestToken(req, res, next) {
  req.guestToken = (req.signedCookies && req.signedCookies['guest_token']) || null;
  next();
}

module.exports = { attachUserIfPresent, requireAuth, identifyGuestToken };

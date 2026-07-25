const express = require('express');
const authController = require('../controllers/auth.controller');
const { loginLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/login', loginLimiter, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));

// TIDAK ADA router.post('/register', ...) - JANGAN DITAMBAHIN.
// Sesuai CLAUDE.md rule #8 & PRD.md non-goals. Kalau butuh nambah user,
// pake: npm run create-user

module.exports = router;

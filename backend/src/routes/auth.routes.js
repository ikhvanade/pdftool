const express = require('express');
const authController = require('../controllers/auth.controller');
const { loginLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/authGuard');
const uploadAvatar = require('../config/uploadAvatar');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/login', loginLimiter, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.post('/change-password', requireAuth, asyncHandler(authController.changePassword));
router.put('/profile', requireAuth, asyncHandler(authController.updateProfile));
router.put('/theme', requireAuth, asyncHandler(authController.updateTheme));
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), asyncHandler(authController.updateAvatar));

// TIDAK ADA router.post('/register', ...) - JANGAN DITAMBAHIN.

module.exports = router;

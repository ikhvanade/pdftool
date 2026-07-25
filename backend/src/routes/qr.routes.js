const express = require('express');
const qrController = require('../controllers/qr.controller');
const guestQuotaCheck = require('../middleware/guestQuotaCheck');
const { attachUserIfPresent } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(attachUserIfPresent, guestQuotaCheck);

router.post('/generate', asyncHandler(qrController.generate));

module.exports = router;

const express = require('express');
const qrController = require('../controllers/qr.controller');
const guestQuotaCheck = require('../middleware/guestQuotaCheck');
const { attachUserIfPresent } = require('../middleware/authGuard');
const uploadImage = require('../config/uploadImage');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(attachUserIfPresent, guestQuotaCheck);

router.post('/generate', asyncHandler(qrController.generate));
router.post('/generate-from-image', uploadImage.single('image'), asyncHandler(qrController.generateFromImage));

module.exports = router;

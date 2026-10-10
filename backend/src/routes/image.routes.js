const express = require('express');
const imageController = require('../controllers/image.controller');
const uploadImageTool = require('../config/uploadImageTool');
const guestQuotaCheck = require('../middleware/guestQuotaCheck');
const { attachUserIfPresent, identifyGuestToken } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(attachUserIfPresent);

// Sesuai CLAUDE.md rule #9 - /api/image/* WAJIB lewat guestQuotaCheck juga.
router.post('/compress', guestQuotaCheck, uploadImageTool.array('files', 20), asyncHandler(imageController.compress));
router.post('/resize', guestQuotaCheck, uploadImageTool.array('files', 20), asyncHandler(imageController.resize));
router.post('/convert', guestQuotaCheck, uploadImageTool.array('files', 20), asyncHandler(imageController.convert));

router.get('/jobs/:id', identifyGuestToken, asyncHandler(imageController.getJobStatus));
router.get('/download/:id', identifyGuestToken, asyncHandler(imageController.downloadJob));

module.exports = router;

const express = require('express');
const pdfController = require('../controllers/pdf.controller');
const upload = require('../config/upload');
const guestQuotaCheck = require('../middleware/guestQuotaCheck');
const { attachUserIfPresent, identifyGuestToken } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(attachUserIfPresent);

router.post('/compress', guestQuotaCheck, upload.single('file'), asyncHandler(pdfController.compress));
router.post('/convert', guestQuotaCheck, upload.single('file'), asyncHandler(pdfController.convert));
router.post('/protect', guestQuotaCheck, upload.single('file'), asyncHandler(pdfController.protect));
router.post('/to-word', guestQuotaCheck, upload.single('file'), asyncHandler(pdfController.toWord));

router.get('/jobs/:id', identifyGuestToken, asyncHandler(pdfController.getJobStatus));
router.get('/download/:id', identifyGuestToken, asyncHandler(pdfController.downloadJob));

module.exports = router;

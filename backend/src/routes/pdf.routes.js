const express = require('express');
const pdfController = require('../controllers/pdf.controller');
const upload = require('../config/upload');
const guestQuotaCheck = require('../middleware/guestQuotaCheck');
const { attachUserIfPresent } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Semua endpoint /api/pdf/* wajib lewat attachUserIfPresent -> guestQuotaCheck
// sesuai rule #9 CLAUDE.md.
router.use(attachUserIfPresent, guestQuotaCheck);

router.post('/compress', upload.single('file'), asyncHandler(pdfController.compress));
router.post('/convert', upload.single('file'), asyncHandler(pdfController.convert));
router.get('/jobs/:id', asyncHandler(pdfController.getJobStatus));

// Merge/split/watermark/preview TIDAK ada endpoint backend - itu client-side
// (pdf-lib/pdfjs di browser) sesuai arsitektur di PRD.md §6.2. Kalau nanti mau
// backend-side juga, tetap wajib kena guestQuotaCheck yang sama.

module.exports = router;

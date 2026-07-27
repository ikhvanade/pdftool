const express = require('express');
const pdfController = require('../controllers/pdf.controller');
const upload = require('../config/upload');
const guestQuotaCheck = require('../middleware/guestQuotaCheck');
const { attachUserIfPresent, identifyGuestToken } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(attachUserIfPresent);

// Endpoint yang MEMBUAT job baru (proses berat) -> wajib kena guestQuotaCheck
// penuh, sesuai rule #9 CLAUDE.md.
router.post('/compress', guestQuotaCheck, upload.single('file'), asyncHandler(pdfController.compress));
router.post('/convert', guestQuotaCheck, upload.single('file'), asyncHandler(pdfController.convert));
router.post('/protect', guestQuotaCheck, upload.single('file'), asyncHandler(pdfController.protect));

// Endpoint status/download BUKAN "pemakaian baru" - cuma ngecek/ngambil hasil
// dari job yang UDAH kehitung kuotanya pas create. Makanya gak pake
// guestQuotaCheck (yang bisa nge-block), cuma identifyGuestToken buat
// ownership check di controller.
router.get('/jobs/:id', identifyGuestToken, asyncHandler(pdfController.getJobStatus));
router.get('/download/:id', identifyGuestToken, asyncHandler(pdfController.downloadJob));

// Merge/split/watermark/preview TIDAK ada endpoint backend - itu client-side
// (pdf-lib/pdfjs di browser) sesuai arsitektur di PRD.md §6.2.

module.exports = router;

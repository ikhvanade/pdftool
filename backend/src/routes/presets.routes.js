const express = require('express');
const presetsController = require('../controllers/presets.controller');
const { requireAuth } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth); // presets cuma buat user login

router.get('/', asyncHandler(presetsController.list));
router.post('/', asyncHandler(presetsController.create));

module.exports = router;

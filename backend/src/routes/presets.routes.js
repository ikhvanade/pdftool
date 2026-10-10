const express = require('express');
const presetsController = require('../controllers/presets.controller');
const { requireAuth } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireAuth);
router.get('/', asyncHandler(presetsController.list));
router.post('/', asyncHandler(presetsController.create));
module.exports = router;

const express = require('express');
const guestController = require('../controllers/guest.controller');
const { attachUserIfPresent } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/quota', attachUserIfPresent, asyncHandler(guestController.getQuota));

module.exports = router;

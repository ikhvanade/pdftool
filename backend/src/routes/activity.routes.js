const express = require('express');
const activityController = require('../controllers/activity.controller');
const { requireAuth } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/log', requireAuth, asyncHandler(activityController.logActivity));

module.exports = router;

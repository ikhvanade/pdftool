const express = require('express');
const historyController = require('../controllers/history.controller');
const { requireAuth } = require('../middleware/authGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireAuth);
router.get('/', asyncHandler(historyController.list));
router.delete('/:id', asyncHandler(historyController.remove));
module.exports = router;

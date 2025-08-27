const express = require('express');
const { protect } = require('../middleware/auth');
const {
  spinDailySpinner,
  getSpinnerStatus,
  getSpinnerHistory,
} = require('../controllers/spinnerController');

const router = express.Router();

// All spinner routes are protected
router.use(protect);

router.post('/spin', spinDailySpinner);
router.get('/status', getSpinnerStatus);
router.get('/history', getSpinnerHistory);

module.exports = router;

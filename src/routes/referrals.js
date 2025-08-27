const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getReferralInfo,
  getReferralsList,
  getReferralStats,
  validateReferralCode,
  getReferralLeaderboard,
  getReferralRewards,
  getReferredUsers,
} = require('../controllers/referralController');

const router = express.Router();

// Validation rules
const validateReferralCodeValidation = [
  body('referralCode')
    .notEmpty()
    .withMessage('Referral code is required')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Referral code must be between 3 and 20 characters'),
];

// Public routes
router.post('/validate', validateReferralCodeValidation, validate, validateReferralCode);
router.get('/leaderboard', getReferralLeaderboard);

// Protected routes
router.get('/info', protect, getReferralInfo);
router.get('/list', protect, getReferralsList);
router.get('/stats', protect, getReferralStats);
router.get('/rewards', protect, getReferralRewards);
router.get('/referred-users', protect, getReferredUsers);

module.exports = router;

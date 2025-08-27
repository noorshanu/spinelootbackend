const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  connectWallet,
  getProfile,
  updateProfile,
  getPointsHistory,
  getCompletedTasks,
} = require('../controllers/authController');

const router = express.Router();

// Validation rules
const connectWalletValidation = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isLength({ min: 32, max: 50 })
    .withMessage('Invalid wallet address format'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('referralCode')
    .optional()
    .trim()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null/undefined/empty values
      }
      if (value.length < 3 || value.length > 20) {
        throw new Error('Referral code must be between 3 and 20 characters');
      }
      return true;
    })
    .withMessage('Referral code must be between 3 and 20 characters'),
];

const updateProfileValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

// Routes
router.post('/connect-wallet', connectWalletValidation, validate, connectWallet);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.get('/points-history', protect, getPointsHistory);
router.get('/completed-tasks', protect, getCompletedTasks);

module.exports = router;

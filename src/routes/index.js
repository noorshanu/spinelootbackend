const express = require('express');
const authRoutes = require('./auth');
const taskRoutes = require('./tasks');
const referralRoutes = require('./referrals');
const spinnerRoutes = require('./spinner');

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/referrals', referralRoutes);
router.use('/spinner', spinnerRoutes);

module.exports = router;

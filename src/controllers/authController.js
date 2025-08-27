const User = require('../models/User');
const Referral = require('../models/Referral');

// @desc    Connect wallet and authenticate user
// @route   POST /api/auth/connect-wallet
// @access  Public
const connectWallet = async (req, res, next) => {
  try {
    const { walletAddress, referralCode, displayName, email } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Wallet address is required',
      });
    }

    // Check if user already exists
    let user = await User.findByWalletAddress(walletAddress);

    if (user) {
      // User exists, update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = user.generateAuthToken();

      return res.json({
        status: 'success',
        message: 'Wallet connected successfully',
        data: {
          user: {
            id: user._id,
            walletAddress: user.walletAddress,
            displayName: user.displayName,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            totalPoints: user.totalPoints,
            currentTier: user.currentTier,
            referralCode: user.referralCode,
            referralCount: user.referralCount,
            totalReferralEarnings: user.totalReferralEarnings,
          },
          token,
        },
      });
    }

    // Create new user
    user = new User({
      walletAddress: walletAddress.toLowerCase(),
      displayName,
      email,
    });

    // Generate referral code after user creation
    user.referralCode = user.generateReferralCode();
    await user.save();

    // Handle referral if provided
    if (referralCode) {
      await handleReferral(user, referralCode, req);
    }

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          displayName: user.displayName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          totalPoints: user.totalPoints,
          currentTier: user.currentTier,
          referralCode: user.referralCode,
          referralCount: user.referralCount,
          totalReferralEarnings: user.totalReferralEarnings,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle referral logic
// @access  Private
const handleReferral = async (newUser, referralCode, req) => {
  try {
    // Find referrer by referral code
    const referrer = await User.findByReferralCode(referralCode);
    
    if (!referrer || referrer._id.equals(newUser._id)) {
      return; // Invalid referral code or self-referral
    }

    // Create referral record
    const referral = await Referral.createReferral(
      referrer._id,
      newUser._id,
      referralCode,
      'link',
      {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referrer'),
      }
    );

    // Update user with referral info
    newUser.referredBy = referrer._id;
    await newUser.save();

    // Add bonus points to referred user
    await newUser.addPoints(50, 'referral', `Welcome bonus for using referral code ${referralCode}`);

    // Add referral bonus to referrer
    await referrer.addReferral(newUser._id, newUser.walletAddress);

    // Activate the referral
    await referral.activate();

  } catch (error) {
    console.error('Error handling referral:', error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          displayName: user.displayName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          totalPoints: user.totalPoints,
          currentTier: user.currentTier,
          referralCode: user.referralCode,
          referralCount: user.referralCount,
          totalReferralEarnings: user.totalReferralEarnings,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { displayName, email, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (displayName) user.displayName = displayName;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          displayName: user.displayName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          totalPoints: user.totalPoints,
          currentTier: user.currentTier,
          referralCode: user.referralCode,
          referralCount: user.referralCount,
          totalReferralEarnings: user.totalReferralEarnings,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user points history
// @route   GET /api/auth/points-history
// @access  Private
const getPointsHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = await User.findById(req.user.id);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pointsHistory = user.pointsHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(startIndex, endIndex);

    const total = user.pointsHistory.length;

    res.json({
      status: 'success',
      data: {
        pointsHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: endIndex < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user completed tasks
// @route   GET /api/auth/completed-tasks
// @access  Private
const getCompletedTasks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      status: 'success',
      data: {
        completedTasks: user.completedTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  connectWallet,
  getProfile,
  updateProfile,
  getPointsHistory,
  getCompletedTasks,
};

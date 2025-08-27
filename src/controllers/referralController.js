const Referral = require('../models/Referral');
const User = require('../models/User');

// @desc    Get user's referral information
// @route   GET /api/referrals/info
// @access  Private
const getReferralInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      status: 'success',
      data: {
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        totalReferralEarnings: user.totalReferralEarnings,
        referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ref/${user.referralCode}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's referrals list
// @route   GET /api/referrals/list
// @access  Private
const getReferralsList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const referrals = await Referral.getReferralsByUser(req.user.id, status);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReferrals = referrals.slice(startIndex, endIndex);

    res.json({
      status: 'success',
      data: {
        referrals: paginatedReferrals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: referrals.length,
          totalPages: Math.ceil(referrals.length / limit),
          hasNextPage: endIndex < referrals.length,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get referral statistics
// @route   GET /api/referrals/stats
// @access  Private
const getReferralStats = async (req, res, next) => {
  try {
    const stats = await Referral.getReferralStats(req.user.id);
    const user = await User.findById(req.user.id);

    // Process stats
    const statsMap = {};
    stats.forEach(stat => {
      statsMap[stat._id] = {
        count: stat.count,
        totalEarnings: stat.totalEarnings,
      };
    });

    const referralStats = {
      total: (statsMap.pending?.count || 0) + (statsMap.active?.count || 0) + (statsMap.completed?.count || 0),
      pending: statsMap.pending?.count || 0,
      active: statsMap.active?.count || 0,
      completed: statsMap.completed?.count || 0,
      totalEarnings: user.totalReferralEarnings,
      thisMonth: await getThisMonthReferrals(req.user.id),
    };

    res.json({
      status: 'success',
      data: {
        stats: referralStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get this month's referrals
// @access  Private
const getThisMonthReferrals = async (userId) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const referrals = await Referral.find({
    referrer: userId,
    createdAt: { $gte: startOfMonth },
  });

  return referrals.length;
};

// @desc    Validate referral code
// @route   POST /api/referrals/validate
// @access  Public
const validateReferralCode = async (req, res, next) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Referral code is required',
      });
    }

    const referrer = await User.findByReferralCode(referralCode);

    if (!referrer) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid referral code',
      });
    }

    res.json({
      status: 'success',
      data: {
        valid: true,
        referrer: {
          displayName: referrer.displayName,
          walletAddress: referrer.walletDisplay,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get referral leaderboard
// @route   GET /api/referrals/leaderboard
// @access  Public
const getReferralLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const leaderboard = await User.aggregate([
      {
        $match: {
          referralCount: { $gt: 0 },
        },
      },
      {
        $project: {
          displayName: 1,
          walletAddress: 1,
          referralCount: 1,
          totalReferralEarnings: 1,
          avatar: 1,
        },
      },
      {
        $sort: { referralCount: -1, totalReferralEarnings: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    const total = await User.countDocuments({ referralCount: { $gt: 0 } });

    res.json({
      status: 'success',
      data: {
        leaderboard,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's referral rewards
// @route   GET /api/referrals/rewards
// @access  Private
const getReferralRewards = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const rewards = {
      currentTier: user.currentTier,
      referralCount: user.referralCount,
      totalEarnings: user.totalReferralEarnings,
      nextMilestone: getNextMilestone(user.referralCount),
      rewardsHistory: user.pointsHistory
        .filter(p => p.source === 'referral')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10),
    };

    res.json({
      status: 'success',
      data: {
        rewards,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get next milestone
// @access  Private
const getNextMilestone = (currentCount) => {
  const milestones = [5, 10, 25, 50, 100];
  const nextMilestone = milestones.find(m => m > currentCount);
  
  if (!nextMilestone) {
    return null;
  }

  return {
    count: nextMilestone,
    points: nextMilestone * 10, // Bonus points for milestone
    remaining: nextMilestone - currentCount,
  };
};

// @desc    Get referred users list
// @route   GET /api/referrals/referred-users
// @access  Private
const getReferredUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('referredUsers.userId', 'walletAddress displayName createdAt');
    
    const referredUsers = user.referredUsers.map(ref => ({
      id: ref.userId._id,
      walletAddress: ref.walletAddress,
      displayName: ref.userId.displayName,
      joinedAt: ref.joinedAt,
      earnedPoints: ref.earnedPoints,
    }));

    res.json({
      status: 'success',
      data: {
        referredUsers,
        totalReferred: user.referralCount,
        totalEarnings: user.totalReferralEarnings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReferralInfo,
  getReferralsList,
  getReferralStats,
  validateReferralCode,
  getReferralLeaderboard,
  getReferralRewards,
  getReferredUsers,
};

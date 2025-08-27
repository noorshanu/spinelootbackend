const User = require('../models/User');

// @desc    Spin the daily spinner
// @route   POST /api/spinner/spin
// @access  Private
const spinDailySpinner = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user can spin today
    const canSpin = await checkSpinEligibility(user, today);
    if (!canSpin.eligible) {
      return res.status(400).json({
        status: 'error',
        message: canSpin.reason,
      });
    }

    // Generate spin result
    const spinResult = generateSpinResult();

    // Update user's spinner data
    user.lastSpinnerSpin = new Date();
    user.spinnerSpinsToday += 1;
    await user.addPoints(spinResult.points, 'daily_spinner', `Daily spinner: ${spinResult.description}`);

    // Update user's tier based on new points
    user.updateTier();
    await user.save();

    res.json({
      status: 'success',
      message: 'Spin completed successfully',
      data: {
        spinResult,
        totalPoints: user.totalPoints,
        spinsToday: user.spinnerSpinsToday,
        canSpinAgain: user.spinnerSpinsToday < 3, // Max 3 spins per day
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check spin eligibility
// @access  Private
const checkSpinEligibility = async (user, today) => {
  // Check if user has already spun 3 times today
  if (user.spinnerSpinsToday >= 3) {
    return {
      eligible: false,
      reason: 'You have already spun 3 times today. Come back tomorrow!',
    };
  }

  // Check if it's a new day (reset spinner count)
  if (user.lastSpinnerSpin && user.lastSpinnerSpin < today) {
    user.spinnerSpinsToday = 0;
    await user.save();
  }

  return { eligible: true };
};

// @desc    Generate spin result
// @access  Private
const generateSpinResult = () => {
  const rewards = [
    { points: 100, description: 'COSMIC JACKPOT!', probability: 0.05 },
    { points: 50, description: 'Stellar Win', probability: 0.1 },
    { points: 25, description: 'Galaxy Win', probability: 0.15 },
    { points: 15, description: 'Space Win', probability: 0.3 },
    { points: 10, description: 'Planet Win', probability: 0.4 },
  ];

  const random = Math.random();
  let cumulativeProbability = 0;

  for (const reward of rewards) {
    cumulativeProbability += reward.probability;
    if (random <= cumulativeProbability) {
      return {
        points: reward.points,
        description: reward.description,
        type: 'points',
      };
    }
  }

  // Fallback to small reward
  return {
    points: 10,
    description: 'Planet Win',
    type: 'points',
  };
};

// @desc    Get spinner status
// @route   GET /api/spinner/status
// @access  Private
const getSpinnerStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if it's a new day (reset spinner count)
    if (user.lastSpinnerSpin && user.lastSpinnerSpin < today) {
      user.spinnerSpinsToday = 0;
      await user.save();
    }

    const canSpin = await checkSpinEligibility(user, today);

    res.json({
      status: 'success',
      data: {
        spinsToday: user.spinnerSpinsToday,
        maxSpinsPerDay: 3,
        canSpin: canSpin.eligible,
        reason: canSpin.reason,
        lastSpin: user.lastSpinnerSpin,
        nextReset: getNextResetTime(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get next reset time
// @access  Private
const getNextResetTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

// @desc    Get spinner history
// @route   GET /api/spinner/history
// @access  Private
const getSpinnerHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = await User.findById(req.user.id);

    const spinnerHistory = user.pointsHistory
      .filter(p => p.source === 'daily_spinner')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedHistory = spinnerHistory.slice(startIndex, endIndex);

    res.json({
      status: 'success',
      data: {
        history: paginatedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: spinnerHistory.length,
          totalPages: Math.ceil(spinnerHistory.length / limit),
          hasNextPage: endIndex < spinnerHistory.length,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  spinDailySpinner,
  getSpinnerStatus,
  getSpinnerHistory,
};

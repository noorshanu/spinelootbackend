const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Wallet-based authentication
  walletAddress: {
    type: String,
    required: [true, 'Wallet address is required'],
    trim: true,
    lowercase: true,
  },
  // Optional email for notifications
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email',
    ],
  },
  // Display name (optional)
  displayName: {
    type: String,
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters'],
  },
  // Profile picture URL
  avatar: {
    type: String,
    default: '',
  },
  // User role
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  // Last login timestamp
  lastLogin: {
    type: Date,
  },
  // Referral system
  referralCode: {
    type: String,
    required: false, // Optional, will be generated if not provided
    sparse: true, // Allow null/undefined values
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  referralCount: {
    type: Number,
    default: 0,
  },
  totalReferralEarnings: {
    type: Number,
    default: 0,
  },
  referredUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    walletAddress: String,
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    earnedPoints: {
      type: Number,
      default: 100, // 100 points per referral
    },
  }],
  // Points system
  totalPoints: {
    type: Number,
    default: 0,
  },
  pointsHistory: [{
    amount: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
      enum: ['task', 'referral', 'daily_spinner', 'admin'],
    },
    description: {
      type: String,
      required: true,
    },
    taskId: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  // Task completion tracking
  completedTasks: [{
    taskId: {
      type: String,
      required: true,
    },
    completions: {
      type: Number,
      default: 0,
    },
    lastCompleted: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  }],
  // Daily spinner tracking
  lastSpinnerSpin: {
    type: Date,
  },
  spinnerSpinsToday: {
    type: Number,
    default: 0,
  },
  // Tier system
  currentTier: {
    type: String,
    enum: ['Newcomer', 'Space Explorer', 'Cosmic Creator'],
    default: 'Newcomer',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for wallet address display (shortened)
userSchema.virtual('walletDisplay').get(function() {
  if (!this.walletAddress) return '';
  return `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.displayName || this.walletDisplay;
});

// Indexes for better query performance
userSchema.index({ walletAddress: 1 }, { unique: true });
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ referralCode: 1 }, { sparse: true });
userSchema.index({ referredBy: 1 });
userSchema.index({ totalPoints: -1 });

// Pre-save middleware to generate referral code if not exists
userSchema.pre('save', async function(next) {
  try {
    if (!this.referralCode && this.walletAddress) {
      this.referralCode = this.generateReferralCode();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to generate referral code (using wallet address)
userSchema.methods.generateReferralCode = function() {
  // Use wallet address as referral code (shortened)
  if (!this.walletAddress) {
    console.error('No wallet address available for referral code generation');
    return 'DEFAULT';
  }
  return this.walletAddress.slice(0, 8).toUpperCase();
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      walletAddress: this.walletAddress, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Instance method to add points
userSchema.methods.addPoints = function(amount, source, description, taskId = null) {
  this.totalPoints += amount;
  this.pointsHistory.push({
    amount,
    source,
    description,
    taskId,
    timestamp: new Date(),
  });
  
  // Update tier based on points
  this.updateTier();
  
  return this.save();
};

// Instance method to update tier
userSchema.methods.updateTier = function() {
  if (this.totalPoints >= 60) {
    this.currentTier = 'Cosmic Creator';
  } else if (this.totalPoints >= 30) {
    this.currentTier = 'Space Explorer';
  } else {
    this.currentTier = 'Newcomer';
  }
};

// Instance method to complete task
userSchema.methods.completeTask = function(taskId, points, description) {
  const existingTask = this.completedTasks.find(task => task.taskId === taskId);
  
  if (existingTask) {
    existingTask.completions += 1;
    existingTask.lastCompleted = new Date();
    // Mark as completed if reached max completions
    if (existingTask.completions >= this.getTaskMaxCompletions(taskId)) {
      existingTask.completed = true;
    }
  } else {
    this.completedTasks.push({
      taskId,
      completions: 1,
      lastCompleted: new Date(),
      completed: false,
    });
  }
  
  // Add points
  this.addPoints(points, 'task', description, taskId);
  
  return this.save();
};

// Helper method to get task max completions (this would need to be implemented)
userSchema.methods.getTaskMaxCompletions = function(taskId) {
  // This is a placeholder - in a real implementation, you'd fetch from Task model
  // For now, we'll use default values based on task type
  const taskDefaults = {
    'follow': 1,
    'like_rt': 1,
    'comment': 1,
    'quote_tweet': 5,
    'original_tweet': 5,
    'x_space': 2,
    'referral_bonus': 999,
    'daily_spinner': 3,
  };
  return taskDefaults[taskId] || 1;
};

// Instance method to add referral
userSchema.methods.addReferral = function(referredUserId, referredWalletAddress) {
  this.referralCount += 1;
  this.totalReferralEarnings += 100; // 100 points per referral
  
  // Add to referred users list
  this.referredUsers.push({
    userId: referredUserId,
    walletAddress: referredWalletAddress,
    joinedAt: new Date(),
    earnedPoints: 100,
  });
  
  this.addPoints(100, 'referral', `Referral bonus for user ${referredWalletAddress}`);
  return this.save();
};

// Static method to find user by wallet address
userSchema.statics.findByWalletAddress = function(walletAddress) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

// Static method to find user by referral code
userSchema.statics.findByReferralCode = function(referralCode) {
  return this.findOne({ referralCode: referralCode.toUpperCase() });
};

module.exports = mongoose.model('User', userSchema);

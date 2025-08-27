const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referralCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending',
  },
  referrerEarnings: {
    type: Number,
    default: 100, // 100 points for referrer
  },
  referredBonus: {
    type: Number,
    default: 50, // 50 points for referred user
  },
  referrerPaid: {
    type: Boolean,
    default: false,
  },
  referredPaid: {
    type: Boolean,
    default: false,
  },
  activationDate: {
    type: Date,
  },
  completionDate: {
    type: Date,
  },
  source: {
    type: String,
    enum: ['link', 'manual', 'code'],
    default: 'link',
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
referralSchema.index({ referrer: 1 });
referralSchema.index({ referred: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ createdAt: -1 });

// Ensure unique referral relationship
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

// Static method to get referrals by user
referralSchema.statics.getReferralsByUser = function(userId, status = null) {
  const query = { referrer: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('referred', 'walletAddress displayName avatar createdAt')
    .sort({ createdAt: -1 });
};

// Static method to get referral stats
referralSchema.statics.getReferralStats = function(userId) {
  return this.aggregate([
    { $match: { referrer: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalEarnings: { $sum: '$referrerEarnings' },
      },
    },
  ]);
};

// Static method to create referral
referralSchema.statics.createReferral = function(referrerId, referredId, referralCode, source = 'link', metadata = {}) {
  return this.create({
    referrer: referrerId,
    referred: referredId,
    referralCode,
    source,
    metadata,
  });
};

// Instance method to activate referral
referralSchema.methods.activate = function() {
  this.status = 'active';
  this.activationDate = new Date();
  return this.save();
};

// Instance method to complete referral
referralSchema.methods.complete = function() {
  this.status = 'completed';
  this.completionDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Referral', referralSchema);

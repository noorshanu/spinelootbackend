const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 0,
  },
  maxCompletions: {
    type: Number,
    required: true,
    min: 1,
  },
  type: {
    type: String,
    enum: ['once', 'daily', 'limited'],
    default: 'once',
  },
  action: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    enum: ['social', 'engagement', 'referral', 'special'],
    default: 'social',
  },
  requirements: {
    type: [String],
    default: [],
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for better query performance
taskSchema.index({ taskId: 1 }, { unique: true });
taskSchema.index({ isActive: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ order: 1 });

// Static method to get active tasks
taskSchema.statics.getActiveTasks = function() {
  return this.find({ 
    isActive: true,
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gt: new Date() } }
    ]
  }).sort({ order: 1 });
};

// Static method to get task by ID
taskSchema.statics.getTaskById = function(taskId) {
  return this.findOne({ taskId, isActive: true });
};

module.exports = mongoose.model('Task', taskSchema);

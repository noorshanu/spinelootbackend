const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all active tasks
// @route   GET /api/tasks
// @access  Public
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.getActiveTasks();

    res.json({
      status: 'success',
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:taskId
// @access  Public
const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    res.json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a task
// @route   POST /api/tasks/:taskId/complete
// @access  Private
const completeTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user.id);

    // Get task details
    const task = await Task.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    // Check if user can complete this task
    const canComplete = await checkTaskCompletionEligibility(user, task);
    if (!canComplete.eligible) {
      return res.status(400).json({
        status: 'error',
        message: canComplete.reason,
      });
    }

    // Complete the task
    await user.completeTask(taskId, task.points, task.title);

    // Refresh user data to get updated completions
    await user.refresh();

    const updatedTask = user.completedTasks.find(t => t.taskId === taskId);

    // Update user's tier based on new points
    user.updateTier();
    await user.save();

    res.json({
      status: 'success',
      message: 'Task completed successfully',
      data: {
        pointsEarned: task.points,
        totalPoints: user.totalPoints,
        taskCompletion: {
          taskId,
          completions: updatedTask?.completions || 1,
          completed: updatedTask?.completed || false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check task completion eligibility
// @access  Private
const checkTaskCompletionEligibility = async (user, task) => {
  const userTask = user.completedTasks.find(t => t.taskId === task.taskId);

  // Check if task is already completed (for once tasks)
  if (task.type === 'once' && userTask && userTask.completed) {
    return {
      eligible: false,
      reason: 'This task can only be completed once',
    };
  }

  // Check if user has reached max completions
  if (userTask && userTask.completions >= task.maxCompletions) {
    return {
      eligible: false,
      reason: 'Maximum completions reached for this task',
    };
  }

  // Check daily task limits
  if (task.type === 'daily') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (userTask && userTask.lastCompleted && new Date(userTask.lastCompleted) >= today) {
      // For daily tasks, check if user has completed max times today
      const completionsToday = userTask.completions % task.maxCompletions;
      if (completionsToday >= task.maxCompletions) {
        return {
          eligible: false,
          reason: 'Daily limit reached for this task',
        };
      }
    }
  }

  return { eligible: true };
};

// @desc    Get user's task progress
// @route   GET /api/tasks/progress
// @access  Private
const getTaskProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const tasks = await Task.getActiveTasks();

    const taskProgress = tasks.map(task => {
      const userTask = user.completedTasks.find(t => t.taskId === task.taskId);
      const completions = userTask ? userTask.completions : 0;
      const completed = userTask ? userTask.completed : false;
      const canComplete = checkTaskCompletionEligibility(user, task).eligible;

      return {
        taskId: task.taskId,
        title: task.title,
        description: task.description,
        points: task.points,
        maxCompletions: task.maxCompletions,
        type: task.type,
        action: task.action,
        link: task.link,
        completions,
        completed,
        lastCompleted: userTask?.lastCompleted,
        canComplete,
      };
    });

    res.json({
      status: 'success',
      data: {
        taskProgress,
        totalPoints: user.totalPoints,
        currentTier: user.currentTier,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const tasks = await Task.getActiveTasks();

    const stats = {
      totalTasks: tasks.length,
      completedTasks: user.completedTasks.filter(t => t.completed).length,
      totalPoints: user.totalPoints,
      currentTier: user.currentTier,
      pointsFromTasks: user.pointsHistory
        .filter(p => p.source === 'task')
        .reduce((sum, p) => sum + p.amount, 0),
      pointsFromReferrals: user.pointsHistory
        .filter(p => p.source === 'referral')
        .reduce((sum, p) => sum + p.amount, 0),
      pointsFromSpinner: user.pointsHistory
        .filter(p => p.source === 'daily_spinner')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    res.json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  completeTask,
  getTaskProgress,
  getTaskStats,
};

const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getTasks,
  getTaskById,
  completeTask,
  getTaskProgress,
  getTaskStats,
} = require('../controllers/taskController');

const router = express.Router();

// Public routes
router.get('/', getTasks);

// Protected routes - specific routes first
router.get('/progress', protect, getTaskProgress);
router.get('/stats', protect, getTaskStats);

// Parameter routes last
router.get('/:taskId', getTaskById);
router.post('/:taskId/complete', protect, completeTask);

module.exports = router;

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import { requirePermission, requireRole } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get current user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshTokens')
    .lean();

  res.json({
    success: true,
    data: user
  });
}));

// Update current user profile
router.put('/profile', [
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('profile.location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('profile.website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('profile.preferences.language')
    .optional()
    .isIn(['en', 'hi'])
    .withMessage('Invalid language'),
  body('profile.preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Invalid theme')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const updates = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  await user.logActivity('profile_updated', 'user', user._id, updates, req);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
}));

// Change password
router.put('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  
  // Deactivate all refresh tokens for security
  user.refreshTokens.forEach(rt => rt.isActive = false);
  
  await user.save();
  await user.logActivity('password_changed', 'user', user._id, {}, req);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// Get all users (admin only)
router.get('/', requireRole(['admin']), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ max: 200 }).withMessage('Search query too long'),
  query('role').optional().isIn(['admin', 'editor', 'viewer', 'user']).withMessage('Invalid role'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const {
    page = 1,
    limit = 20,
    search,
    role,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshTokens')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNext = parseInt(page) < totalPages;
  const hasPrev = parseInt(page) > 1;

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNext,
        hasPrev
      }
    }
  });
}));

// Get user by ID (admin only)
router.get('/:id', requireRole(['admin']), [
  param('id').isMongoId().withMessage('Invalid user ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const user = await User.findById(req.params.id)
    .select('-password -refreshTokens')
    .lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
}));

// Update user (admin only)
router.put('/:id', requireRole(['admin']), [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'viewer', 'user'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const updates = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  await req.user.logActivity('user_updated', 'user', user._id, updates, req);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
}));

// Delete user (admin only)
router.delete('/:id', requireRole(['admin']), [
  param('id').isMongoId().withMessage('Invalid user ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  // Prevent self-deletion
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete your own account'
    });
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  await req.user.logActivity('user_deleted', 'user', user._id, { deletedUser: user.username }, req);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// Get user statistics (admin only)
router.get('/stats/overview', requireRole(['admin']), asyncHandler(async (req, res) => {
  const stats = await User.getStatistics();
  
  // Get additional stats
  const [recentUsers, roleDistribution, activityStats] = await Promise.all([
    User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('username profile.firstName profile.lastName createdAt')
      .lean(),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    User.aggregate([
      {
        $match: {
          lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      overview: stats,
      recentUsers,
      roleDistribution,
      activityStats
    }
  });
}));

export default router;
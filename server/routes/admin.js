import express from 'express';
import { query, body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import Analytics from '../models/Analytics.js';
import { requireRole } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get system statistics
router.get('/system-stats', requireRole(['admin']), asyncHandler(async (req, res) => {
  const [userStats, schemeStats, analyticsStats] = await Promise.all([
    User.getStatistics(),
    Scheme.getStatistics(),
    Analytics.getDashboardStats(30)
  ]);

  // Get system health metrics
  const systemHealth = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };

  res.json({
    success: true,
    data: {
      users: userStats,
      schemes: schemeStats,
      analytics: analyticsStats,
      system: systemHealth,
      timestamp: new Date().toISOString()
    }
  });
}));

// Get audit logs
router.get('/audit-logs', requireRole(['admin']), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('action').optional().isLength({ max: 100 }).withMessage('Action filter too long'),
  query('resource').optional().isLength({ max: 100 }).withMessage('Resource filter too long'),
  query('userId').optional().isMongoId().withMessage('Invalid user ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
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
    limit = 50,
    action,
    resource,
    userId,
    startDate,
    endDate,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = req.query;

  // Build aggregation pipeline
  const pipeline = [];

  // Match stage
  const matchConditions = {};
  
  if (action) {
    matchConditions.action = { $regex: action, $options: 'i' };
  }
  
  if (resource) {
    matchConditions.resource = resource;
  }
  
  if (userId) {
    matchConditions.userId = userId;
  }
  
  if (startDate || endDate) {
    matchConditions.timestamp = {};
    if (startDate) matchConditions.timestamp.$gte = new Date(startDate);
    if (endDate) matchConditions.timestamp.$lte = new Date(endDate);
  }

  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  // Lookup user information
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
      pipeline: [
        { $project: { username: 1, 'profile.firstName': 1, 'profile.lastName': 1 } }
      ]
    }
  });

  // Unwind user array
  pipeline.push({
    $unwind: {
      path: '$user',
      preserveNullAndEmptyArrays: true
    }
  });

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  pipeline.push({ $sort: sort });

  // Get total count
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await Analytics.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  const logs = await Analytics.aggregate(pipeline);

  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNext = parseInt(page) < totalPages;
  const hasPrev = parseInt(page) > 1;

  res.json({
    success: true,
    data: {
      logs,
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

// Get system settings
router.get('/settings', requireRole(['admin']), [
  query('category').optional().isLength({ max: 50 }).withMessage('Category too long')
], asyncHandler(async (req, res) => {
  const { category } = req.query;

  // For now, return default settings
  // In a real app, these would be stored in database
  const settings = {
    general: {
      siteName: 'MyScheme',
      siteDescription: 'Government Schemes Platform',
      contactEmail: 'support@myscheme.gov.in',
      maintenanceMode: false,
      registrationEnabled: true
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      lockoutDuration: 300,
      twoFactorEnabled: false
    },
    email: {
      smtpEnabled: true,
      fromEmail: 'noreply@myscheme.gov.in',
      fromName: 'MyScheme Platform'
    },
    analytics: {
      googleAnalyticsId: '',
      trackingEnabled: true,
      dataRetentionDays: 730
    },
    api: {
      rateLimitEnabled: true,
      rateLimitWindow: 900000,
      rateLimitMax: 100
    }
  };

  const result = category ? { [category]: settings[category] } : settings;

  res.json({
    success: true,
    data: result
  });
}));

// Update system setting
router.put('/settings/:key', requireRole(['admin']), [
  body('value').notEmpty().withMessage('Value is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { key } = req.params;
  const { value } = req.body;

  // In a real app, this would update the database
  // For now, just log the change
  logger.info(`System setting updated: ${key} = ${JSON.stringify(value)}`, {
    updatedBy: req.user.username,
    userId: req.user._id
  });

  await req.user.logActivity('setting_updated', 'system', key, { key, value }, req);

  res.json({
    success: true,
    message: 'Setting updated successfully',
    data: { key, value }
  });
}));

// Export data
router.post('/export', requireRole(['admin']), [
  body('type')
    .isIn(['users', 'schemes', 'analytics', 'audit-logs'])
    .withMessage('Invalid export type'),
  body('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Invalid export format'),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { type, format = 'json', filters = {} } = req.body;

  let data;
  let filename;

  switch (type) {
    case 'users':
      data = await User.find(filters)
        .select('-password -refreshTokens')
        .lean();
      filename = `users_export_${Date.now()}.${format}`;
      break;

    case 'schemes':
      data = await Scheme.find(filters)
        .populate('createdBy', 'username')
        .populate('updatedBy', 'username')
        .lean();
      filename = `schemes_export_${Date.now()}.${format}`;
      break;

    case 'analytics':
      data = await Analytics.find(filters)
        .sort({ timestamp: -1 })
        .limit(10000) // Limit to prevent memory issues
        .lean();
      filename = `analytics_export_${Date.now()}.${format}`;
      break;

    case 'audit-logs':
      data = await Analytics.find({ type: 'user_action', ...filters })
        .sort({ timestamp: -1 })
        .limit(10000)
        .lean();
      filename = `audit_logs_export_${Date.now()}.${format}`;
      break;

    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid export type'
      });
  }

  // Log export activity
  await req.user.logActivity('data_exported', 'system', type, { 
    type, 
    format, 
    recordCount: data.length 
  }, req);

  if (format === 'csv') {
    // Convert to CSV (simplified)
    const csv = convertToCSV(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
      success: true,
      data: {
        exportType: type,
        exportDate: new Date().toISOString(),
        recordCount: data.length,
        records: data
      }
    });
  }
}));

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

// Bulk operations
router.post('/bulk-operations', requireRole(['admin']), [
  body('operation')
    .isIn(['activate', 'deactivate', 'delete', 'update-role'])
    .withMessage('Invalid operation'),
  body('targets')
    .isArray({ min: 1 })
    .withMessage('Targets must be a non-empty array'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { operation, targets, data = {} } = req.body;
  const results = [];

  for (const targetId of targets) {
    try {
      let result;
      
      switch (operation) {
        case 'activate':
          result = await User.findByIdAndUpdate(
            targetId,
            { isActive: true },
            { new: true }
          );
          break;
          
        case 'deactivate':
          result = await User.findByIdAndUpdate(
            targetId,
            { isActive: false },
            { new: true }
          );
          break;
          
        case 'delete':
          // Prevent self-deletion
          if (targetId === req.user._id.toString()) {
            results.push({ id: targetId, success: false, error: 'Cannot delete own account' });
            continue;
          }
          result = await User.findByIdAndDelete(targetId);
          break;
          
        case 'update-role':
          if (!data.role) {
            results.push({ id: targetId, success: false, error: 'Role is required' });
            continue;
          }
          result = await User.findByIdAndUpdate(
            targetId,
            { role: data.role },
            { new: true }
          );
          break;
      }
      
      if (result) {
        results.push({ id: targetId, success: true, data: result });
      } else {
        results.push({ id: targetId, success: false, error: 'Target not found' });
      }
      
    } catch (error) {
      results.push({ id: targetId, success: false, error: error.message });
    }
  }

  // Log bulk operation
  await req.user.logActivity('bulk_operation', 'system', operation, {
    operation,
    targetCount: targets.length,
    successCount: results.filter(r => r.success).length
  }, req);

  res.json({
    success: true,
    message: 'Bulk operation completed',
    data: {
      operation,
      totalTargets: targets.length,
      successCount: results.filter(r => r.success).length,
      results
    }
  });
}));

export default router;
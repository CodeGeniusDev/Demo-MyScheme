import express from 'express';
import { query, body, validationResult } from 'express-validator';
import Analytics from '../models/Analytics.js';
import { requirePermission } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Track analytics event
router.post('/track', [
  body('type')
    .isIn(['page_view', 'search', 'scheme_view', 'application_start', 'user_action'])
    .withMessage('Invalid event type'),
  body('page').optional().isLength({ max: 200 }).withMessage('Page URL too long'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { type, page, metadata = {} } = req.body;
  
  // Extract device information
  const userAgent = req.get('User-Agent') || '';
  const device = {
    type: getDeviceType(userAgent),
    browser: getBrowser(userAgent),
    os: getOS(userAgent)
  };

  const analyticsData = {
    type,
    page,
    userId: req.user?._id,
    sessionId: req.sessionID || generateSessionId(),
    ip: req.ip,
    userAgent,
    referer: req.get('Referer'),
    device,
    eventData: metadata
  };

  // Track based on event type
  switch (type) {
    case 'page_view':
      await Analytics.trackPageView(analyticsData);
      break;
    case 'search':
      await Analytics.trackSearch({
        ...analyticsData,
        query: metadata.query,
        filters: metadata.filters,
        resultsCount: metadata.resultsCount
      });
      break;
    case 'scheme_view':
      await Analytics.trackSchemeView({
        ...analyticsData,
        schemeId: metadata.schemeId,
        timeOnPage: metadata.timeOnPage,
        scrollDepth: metadata.scrollDepth
      });
      break;
    default:
      await Analytics.create(analyticsData);
  }

  res.json({
    success: true,
    message: 'Event tracked successfully'
  });
}));

// Get dashboard analytics
router.get('/dashboard', requirePermission('analytics.read'), [
  query('dateRange').optional().isInt({ min: 1, max: 365 }).withMessage('Date range must be between 1 and 365 days')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { dateRange = 30 } = req.query;
  
  const [
    dashboardStats,
    timeSeriesData,
    deviceStats,
    popularSearches
  ] = await Promise.all([
    Analytics.getDashboardStats(parseInt(dateRange)),
    Analytics.getTimeSeriesData('all', parseInt(dateRange), 'day'),
    Analytics.getDeviceStats(parseInt(dateRange)),
    Analytics.getPopularSearches(10, parseInt(dateRange))
  ]);

  // Format time series data
  const formattedTimeSeriesData = timeSeriesData.map(item => ({
    date: formatDate(item._id),
    views: item.count || 0,
    searches: 0 // This would need separate query for searches
  }));

  res.json({
    success: true,
    data: {
      overview: dashboardStats,
      timeSeriesData: formattedTimeSeriesData,
      deviceStats,
      popularSearches,
      dateRange: parseInt(dateRange)
    }
  });
}));

// Get live analytics
router.get('/live', requirePermission('analytics.read'), asyncHandler(async (req, res) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    liveStats,
    recentActivity,
    activePages
  ] = await Promise.all([
    Analytics.getDashboardStats(1), // Last 24 hours
    Analytics.find({
      timestamp: { $gte: oneHourAgo }
    })
    .sort({ timestamp: -1 })
    .limit(50)
    .populate('userId', 'username profile.firstName profile.lastName')
    .lean(),
    Analytics.aggregate([
      {
        $match: {
          type: 'page_view',
          timestamp: { $gte: oneHourAgo }
        }
      },
      {
        $group: {
          _id: '$page',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          page: '$_id',
          views: '$count',
          uniqueUsers: { $size: '$uniqueUsers' },
          _id: 0
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ])
  ]);

  res.json({
    success: true,
    data: {
      stats: liveStats,
      recentActivity,
      activePages,
      timestamp: now.toISOString()
    }
  });
}));

// Get popular searches
router.get('/popular-searches', requirePermission('analytics.read'), [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('dateRange').optional().isInt({ min: 1, max: 365 }).withMessage('Date range must be between 1 and 365 days')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { limit = 20, dateRange = 30 } = req.query;
  
  const popularSearches = await Analytics.getPopularSearches(
    parseInt(limit),
    parseInt(dateRange)
  );

  res.json({
    success: true,
    data: popularSearches
  });
}));

// Get device statistics
router.get('/device-stats', requirePermission('analytics.read'), [
  query('dateRange').optional().isInt({ min: 1, max: 365 }).withMessage('Date range must be between 1 and 365 days')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { dateRange = 30 } = req.query;
  
  const deviceStats = await Analytics.getDeviceStats(parseInt(dateRange));

  res.json({
    success: true,
    data: deviceStats
  });
}));

// Get time series data
router.get('/time-series', requirePermission('analytics.read'), [
  query('type').optional().isIn(['all', 'page_view', 'search', 'scheme_view']).withMessage('Invalid type'),
  query('interval').optional().isIn(['hour', 'day', 'week', 'month']).withMessage('Invalid interval'),
  query('dateRange').optional().isInt({ min: 1, max: 365 }).withMessage('Date range must be between 1 and 365 days')
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
    type = 'all', 
    interval = 'day', 
    dateRange = 30 
  } = req.query;
  
  const timeSeriesData = await Analytics.getTimeSeriesData(
    type,
    parseInt(dateRange),
    interval
  );

  // Format the data for frontend consumption
  const formattedData = timeSeriesData.map(item => ({
    date: formatDate(item._id, interval),
    count: item.count,
    ...item._id
  }));

  res.json({
    success: true,
    data: {
      series: formattedData,
      type,
      interval,
      dateRange: parseInt(dateRange)
    }
  });
}));

// Helper functions
function getDeviceType(userAgent) {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad/.test(userAgent)) return 'tablet';
    return 'mobile';
  }
  return 'desktop';
}

function getBrowser(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOS(userAgent) {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateObj, interval = 'day') {
  if (typeof dateObj === 'string') return dateObj;
  
  const { year, month, day, hour, week } = dateObj;
  
  switch (interval) {
    case 'hour':
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:00`;
    case 'day':
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    case 'week':
      return `${year}-W${String(week).padStart(2, '0')}`;
    case 'month':
      return `${year}-${String(month).padStart(2, '0')}`;
    default:
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}

export default router;
import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['page_view', 'search', 'scheme_view', 'application_start', 'user_action'],
    required: true
  },
  
  // Page/Resource Information
  page: {
    type: String,
    trim: true
  },
  resource: {
    type: String,
    trim: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceModel'
  },
  resourceModel: {
    type: String,
    enum: ['Scheme', 'User', 'Content']
  },
  
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true
  },
  
  // Request Information
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  referer: {
    type: String,
    trim: true
  },
  
  // Geographic Information
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Device Information
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    browser: String,
    os: String,
    screenResolution: String
  },
  
  // Event-specific Data
  eventData: {
    searchQuery: String,
    searchFilters: mongoose.Schema.Types.Mixed,
    searchResults: Number,
    timeOnPage: Number,
    scrollDepth: Number,
    clickPosition: {
      x: Number,
      y: Number
    },
    formData: mongoose.Schema.Types.Mixed,
    errorMessage: String
  },
  
  // Performance Metrics
  performance: {
    loadTime: Number,
    renderTime: Number,
    networkSpeed: String
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Processed flag for batch analytics
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ resourceId: 1, type: 1 });
analyticsSchema.index({ 'eventData.searchQuery': 1 });
analyticsSchema.index({ processed: 1 });

// TTL index to automatically delete old analytics data (keep for 2 years)
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

// Static method to track page view
analyticsSchema.statics.trackPageView = function(data) {
  return this.create({
    type: 'page_view',
    page: data.page,
    userId: data.userId,
    sessionId: data.sessionId,
    ip: data.ip,
    userAgent: data.userAgent,
    referer: data.referer,
    device: data.device,
    location: data.location,
    performance: data.performance
  });
};

// Static method to track search
analyticsSchema.statics.trackSearch = function(data) {
  return this.create({
    type: 'search',
    userId: data.userId,
    sessionId: data.sessionId,
    ip: data.ip,
    userAgent: data.userAgent,
    eventData: {
      searchQuery: data.query,
      searchFilters: data.filters,
      searchResults: data.resultsCount
    },
    device: data.device,
    location: data.location
  });
};

// Static method to track scheme view
analyticsSchema.statics.trackSchemeView = function(data) {
  return this.create({
    type: 'scheme_view',
    resource: 'scheme',
    resourceId: data.schemeId,
    resourceModel: 'Scheme',
    userId: data.userId,
    sessionId: data.sessionId,
    ip: data.ip,
    userAgent: data.userAgent,
    referer: data.referer,
    eventData: {
      timeOnPage: data.timeOnPage,
      scrollDepth: data.scrollDepth
    },
    device: data.device,
    location: data.location
  });
};

// Static method to get dashboard analytics
analyticsSchema.statics.getDashboardStats = async function(dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  const stats = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        pageViews: {
          $sum: { $cond: [{ $eq: ['$type', 'page_view'] }, 1, 0] }
        },
        searches: {
          $sum: { $cond: [{ $eq: ['$type', 'search'] }, 1, 0] }
        },
        schemeViews: {
          $sum: { $cond: [{ $eq: ['$type', 'scheme_view'] }, 1, 0] }
        },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        totalEvents: 1,
        pageViews: 1,
        searches: 1,
        schemeViews: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        uniqueSessions: { $size: '$uniqueSessions' }
      }
    }
  ]);
  
  return stats[0] || {
    totalEvents: 0,
    pageViews: 0,
    searches: 0,
    schemeViews: 0,
    uniqueUsers: 0,
    uniqueSessions: 0
  };
};

// Static method to get popular searches
analyticsSchema.statics.getPopularSearches = function(limit = 10, dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        type: 'search',
        timestamp: { $gte: startDate },
        'eventData.searchQuery': { $exists: true, $ne: '' }
      }
    },
    {
      $group: {
        _id: '$eventData.searchQuery',
        count: { $sum: 1 },
        avgResults: { $avg: '$eventData.searchResults' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        query: '$_id',
        count: 1,
        avgResults: { $round: ['$avgResults', 0] },
        _id: 0
      }
    }
  ]);
};

// Static method to get device statistics
analyticsSchema.statics.getDeviceStats = function(dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$device.type',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        device: '$_id',
        count: 1,
        _id: 0
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get time-series data
analyticsSchema.statics.getTimeSeriesData = function(type, dateRange = 30, interval = 'day') {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  let groupBy;
  switch (interval) {
    case 'hour':
      groupBy = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' },
        hour: { $hour: '$timestamp' }
      };
      break;
    case 'day':
      groupBy = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' }
      };
      break;
    case 'week':
      groupBy = {
        year: { $year: '$timestamp' },
        week: { $week: '$timestamp' }
      };
      break;
    case 'month':
      groupBy = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' }
      };
      break;
    default:
      groupBy = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' }
      };
  }
  
  const matchCondition = {
    timestamp: { $gte: startDate }
  };
  
  if (type && type !== 'all') {
    matchCondition.type = type;
  }
  
  return this.aggregate([
    {
      $match: matchCondition
    },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

export default mongoose.model('Analytics', analyticsSchema);
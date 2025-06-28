import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  schemeType: {
    type: String,
    enum: ['state', 'central'],
    required: true
  },
  
  // Basic Information
  title: {
    en: { type: String, required: true, trim: true },
    hi: { type: String, trim: true }
  },
  description: {
    en: { type: String, required: true, trim: true },
    hi: { type: String, trim: true }
  },
  fullDescription: {
    en: { type: String, required: true },
    hi: { type: String }
  },
  
  // Classification
  state: {
    type: String,
    required: true,
    trim: true
  },
  ministry: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Eligibility Criteria
  eligibility: {
    gender: [{
      type: String,
      enum: ['Male', 'Female', 'Other', 'All']
    }],
    ageGroup: [{
      type: String,
      enum: ['0-5', '6-14', '15-18', '18-25', '26-35', '36-50', '50-60', '60+', 'All']
    }],
    caste: [{
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'All']
    }],
    residence: [{
      type: String,
      enum: ['Rural', 'Urban', 'All']
    }],
    minority: [{
      type: String,
      enum: ['Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'All']
    }],
    differentlyAbled: {
      type: Boolean,
      default: false
    },
    maritalStatus: [{
      type: String,
      enum: ['Single', 'Married', 'Widowed', 'Divorced', 'All']
    }],
    disabilityPercentage: [{
      type: String,
      enum: ['Not Applicable', '40% and above', '50% and above', '70% and above']
    }],
    belowPovertyLine: {
      type: Boolean,
      default: false
    },
    economicDistress: {
      type: Boolean,
      default: false
    },
    governmentEmployee: {
      type: Boolean,
      default: false
    },
    employmentStatus: [{
      type: String,
      enum: ['Employed', 'Unemployed', 'Self-employed', 'Student', 'Retired', 'All']
    }],
    student: {
      type: Boolean,
      default: false
    },
    occupation: [{
      type: String,
      trim: true
    }]
  },
  
  // Benefits
  benefits: {
    financial: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true }
    },
    nonFinancial: {
      en: [{ type: String, trim: true }],
      hi: [{ type: String, trim: true }]
    },
    benefitType: [{
      type: String,
      enum: [
        'Financial Assistance', 'Scholarship', 'Grant', 'Loan', 'Subsidy',
        'Training', 'Healthcare', 'Housing', 'Employment', 'Pension'
      ]
    }],
    dbtScheme: {
      type: Boolean,
      default: false
    }
  },
  
  // Application Process
  applicationProcess: {
    mode: [{
      type: String,
      enum: ['Online', 'Offline', 'Both']
    }],
    steps: {
      en: [{ type: String, trim: true }],
      hi: [{ type: String, trim: true }]
    },
    documentsRequired: {
      en: [{ type: String, trim: true }],
      hi: [{ type: String, trim: true }]
    },
    timeline: {
      type: String,
      trim: true
    },
    fees: {
      type: String,
      trim: true,
      default: 'Free'
    },
    applicationUrl: {
      type: String,
      trim: true
    }
  },
  
  // Additional Information
  faqs: [{
    question: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, trim: true }
    },
    answer: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, trim: true }
    }
  }],
  
  sources: [{
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['official', 'news', 'document'],
      default: 'official'
    }
  }],
  
  // SEO & Metadata
  seo: {
    metaTitle: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true }
    },
    metaDescription: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true }
    },
    keywords: [{ type: String, trim: true }],
    ogImage: { type: String, trim: true }
  },
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    lastViewed: { type: Date },
    popularityScore: { type: Number, default: 0 },
    monthlyViews: [{
      month: { type: String, required: true },
      year: { type: Number, required: true },
      views: { type: Number, default: 0 }
    }]
  },
  
  // Timestamps and Audit
  publishedAt: { type: Date },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Version Control
  version: { type: Number, default: 1 },
  changeLog: [{
    version: Number,
    changes: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
schemeSchema.index({ slug: 1 });
schemeSchema.index({ status: 1 });
schemeSchema.index({ schemeType: 1 });
schemeSchema.index({ state: 1 });
schemeSchema.index({ category: 1 });
schemeSchema.index({ tags: 1 });
schemeSchema.index({ 'title.en': 'text', 'description.en': 'text', tags: 'text' });
schemeSchema.index({ createdAt: -1 });
schemeSchema.index({ 'analytics.views': -1 });
schemeSchema.index({ 'analytics.popularityScore': -1 });

// Virtual for URL
schemeSchema.virtual('url').get(function() {
  return `/scheme/${this.slug}`;
});

// Virtual for reading time
schemeSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const words = this.fullDescription.en.split(' ').length;
  return Math.ceil(words / wordsPerMinute);
});

// Pre-save middleware to generate slug
schemeSchema.pre('save', function(next) {
  if (this.isModified('title.en') && !this.slug) {
    this.slug = this.title.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Pre-save middleware to update version
schemeSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Method to increment views
schemeSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  
  // Update monthly views
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const monthlyView = this.analytics.monthlyViews.find(mv => 
    mv.month === monthKey.split('-')[1] && mv.year === parseInt(monthKey.split('-')[0])
  );
  
  if (monthlyView) {
    monthlyView.views += 1;
  } else {
    this.analytics.monthlyViews.push({
      month: monthKey.split('-')[1],
      year: parseInt(monthKey.split('-')[0]),
      views: 1
    });
  }
  
  // Calculate popularity score
  this.calculatePopularityScore();
  
  return this.save();
};

// Method to calculate popularity score
schemeSchema.methods.calculatePopularityScore = function() {
  const viewsWeight = 0.4;
  const applicationsWeight = 0.6;
  const timeDecay = 0.1;
  
  const daysSinceCreated = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.exp(-timeDecay * daysSinceCreated / 365);
  
  this.analytics.popularityScore = 
    (this.analytics.views * viewsWeight + this.analytics.applications * applicationsWeight) * decayFactor;
};

// Static method to get trending schemes
schemeSchema.statics.getTrending = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'analytics.popularityScore': -1 })
    .limit(limit)
    .populate('createdBy', 'username profile.firstName profile.lastName');
};

// Static method to search schemes
schemeSchema.statics.search = function(query, filters = {}) {
  const searchQuery = { status: 'published' };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Apply filters
  if (filters.state && filters.state !== 'All States') {
    searchQuery.state = filters.state;
  }
  
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  if (filters.schemeType) {
    searchQuery.schemeType = filters.schemeType;
  }
  
  if (filters.gender && filters.gender !== 'All') {
    searchQuery['eligibility.gender'] = { $in: [filters.gender, 'All'] };
  }
  
  if (filters.ageGroup && filters.ageGroup !== 'All Ages') {
    searchQuery['eligibility.ageGroup'] = { $in: [filters.ageGroup, 'All'] };
  }
  
  return this.find(searchQuery)
    .populate('createdBy', 'username profile.firstName profile.lastName')
    .sort(query ? { score: { $meta: 'textScore' } } : { 'analytics.popularityScore': -1 });
};

// Static method to get statistics
schemeSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSchemes: { $sum: 1 },
        publishedSchemes: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        draftSchemes: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        centralSchemes: {
          $sum: { $cond: [{ $eq: ['$schemeType', 'central'] }, 1, 0] }
        },
        stateSchemes: {
          $sum: { $cond: [{ $eq: ['$schemeType', 'state'] }, 1, 0] }
        },
        totalViews: { $sum: '$analytics.views' },
        totalApplications: { $sum: '$analytics.applications' }
      }
    }
  ]);
  
  return stats[0] || {
    totalSchemes: 0,
    publishedSchemes: 0,
    draftSchemes: 0,
    centralSchemes: 0,
    stateSchemes: 0,
    totalViews: 0,
    totalApplications: 0
  };
};

export default mongoose.model('Scheme', schemeSchema);
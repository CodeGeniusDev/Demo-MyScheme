import express from 'express';
import { query, param, validationResult } from 'express-validator';
import Scheme from '../models/Scheme.js';
import Analytics from '../models/Analytics.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all schemes with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ max: 200 }).withMessage('Search query too long'),
  query('state').optional().isLength({ max: 100 }).withMessage('State name too long'),
  query('category').optional().isLength({ max: 100 }).withMessage('Category name too long'),
  query('schemeType').optional().isIn(['state', 'central']).withMessage('Invalid scheme type'),
  query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  query('sortBy').optional().isIn(['relevance', 'newest', 'oldest', 'popular', 'views']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
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
      state,
      category,
      schemeType,
      status = 'published',
      sortBy = 'popular',
      gender,
      ageGroup,
      caste,
      residence,
      minority,
      differentlyAbled,
      benefitType,
      dbtScheme,
      language = 'en'
    } = req.query;

    // Build query
    const query = { status };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (state && state !== 'All States') {
      query.state = state;
    }

    if (category) {
      query.category = category;
    }

    if (schemeType) {
      query.schemeType = schemeType;
    }

    if (gender && gender !== 'All') {
      query['eligibility.gender'] = { $in: [gender, 'All'] };
    }

    if (ageGroup && ageGroup !== 'All Ages') {
      query['eligibility.ageGroup'] = { $in: [ageGroup, 'All'] };
    }

    if (caste && caste !== 'All') {
      query['eligibility.caste'] = { $in: [caste, 'All'] };
    }

    if (residence && residence !== 'All') {
      query['eligibility.residence'] = { $in: [residence, 'All'] };
    }

    if (minority && minority !== 'All') {
      query['eligibility.minority'] = { $in: [minority, 'All'] };
    }

    if (differentlyAbled === 'Yes') {
      query['eligibility.differentlyAbled'] = true;
    } else if (differentlyAbled === 'No') {
      query['eligibility.differentlyAbled'] = false;
    }

    if (benefitType) {
      query['benefits.benefitType'] = benefitType;
    }

    if (dbtScheme === 'Yes') {
      query['benefits.dbtScheme'] = true;
    } else if (dbtScheme === 'No') {
      query['benefits.dbtScheme'] = false;
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { 'analytics.popularityScore': -1 };
        break;
      case 'views':
        sort = { 'analytics.views': -1 };
        break;
      case 'relevance':
      default:
        if (search) {
          sort = { score: { $meta: 'textScore' } };
        } else {
          sort = { 'analytics.popularityScore': -1 };
        }
        break;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [schemes, total] = await Promise.all([
      Scheme.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'username profile.firstName profile.lastName')
        .populate('updatedBy', 'username profile.firstName profile.lastName')
        .lean(),
      Scheme.countDocuments(query)
    ]);

    // Track search analytics
    if (search && req.user) {
      try {
        await Analytics.trackSearch({
          query: search,
          filters: { state, category, schemeType, gender, ageGroup },
          resultsCount: total,
          userId: req.user._id,
          sessionId: req.sessionID || 'anonymous',
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      } catch (analyticsError) {
        logger.error('Failed to track search analytics:', analyticsError);
      }
    }

    // Transform schemes based on language preference
    const transformedSchemes = schemes.map(scheme => ({
      ...scheme,
      title: scheme.title[language] || scheme.title.en,
      description: scheme.description[language] || scheme.description.en,
      fullDescription: scheme.fullDescription[language] || scheme.fullDescription.en,
      benefits: {
        ...scheme.benefits,
        financial: scheme.benefits.financial[language] || scheme.benefits.financial.en,
        nonFinancial: scheme.benefits.nonFinancial[language] || scheme.benefits.nonFinancial.en
      },
      applicationProcess: {
        ...scheme.applicationProcess,
        steps: scheme.applicationProcess.steps[language] || scheme.applicationProcess.steps.en,
        documentsRequired: scheme.applicationProcess.documentsRequired[language] || scheme.applicationProcess.documentsRequired.en
      },
      faqs: scheme.faqs.map(faq => ({
        question: faq.question[language] || faq.question.en,
        answer: faq.answer[language] || faq.answer.en
      }))
    }));

    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        schemes: transformedSchemes,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
          hasNext,
          hasPrev
        },
        filters: {
          search,
          state,
          category,
          schemeType,
          status,
          sortBy
        }
      }
    });

  } catch (error) {
    logger.error('Get schemes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get scheme by ID or slug
router.get('/:identifier', [
  param('identifier').notEmpty().withMessage('Scheme identifier is required'),
  query('language').optional().isIn(['en', 'hi']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { identifier } = req.params;
    const { language = 'en' } = req.query;

    // Find scheme by ID or slug
    const query = identifier.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: identifier }
      : { slug: identifier };

    const scheme = await Scheme.findOne(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('updatedBy', 'username profile.firstName profile.lastName')
      .lean();

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found'
      });
    }

    // Check if user has permission to view draft schemes
    if (scheme.status !== 'published' && (!req.user || !req.user.hasPermission('schemes.read'))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Increment view count (async, don't wait)
    if (scheme.status === 'published') {
      Scheme.findByIdAndUpdate(scheme._id, {
        $inc: { 'analytics.views': 1 },
        $set: { 'analytics.lastViewed': new Date() }
      }).exec().catch(err => logger.error('Failed to increment views:', err));

      // Track analytics
      if (req.user) {
        Analytics.trackSchemeView({
          schemeId: scheme._id,
          userId: req.user._id,
          sessionId: req.sessionID || 'anonymous',
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          referer: req.get('Referer')
        }).catch(err => logger.error('Failed to track scheme view:', err));
      }
    }

    // Transform scheme based on language preference
    const transformedScheme = {
      ...scheme,
      title: scheme.title[language] || scheme.title.en,
      description: scheme.description[language] || scheme.description.en,
      fullDescription: scheme.fullDescription[language] || scheme.fullDescription.en,
      benefits: {
        ...scheme.benefits,
        financial: scheme.benefits.financial[language] || scheme.benefits.financial.en,
        nonFinancial: scheme.benefits.nonFinancial[language] || scheme.benefits.nonFinancial.en
      },
      applicationProcess: {
        ...scheme.applicationProcess,
        steps: scheme.applicationProcess.steps[language] || scheme.applicationProcess.steps.en,
        documentsRequired: scheme.applicationProcess.documentsRequired[language] || scheme.applicationProcess.documentsRequired.en
      },
      faqs: scheme.faqs.map(faq => ({
        question: faq.question[language] || faq.question.en,
        answer: faq.answer[language] || faq.answer.en
      })),
      seo: {
        ...scheme.seo,
        metaTitle: scheme.seo.metaTitle[language] || scheme.seo.metaTitle.en,
        metaDescription: scheme.seo.metaDescription[language] || scheme.seo.metaDescription.en
      }
    };

    res.json({
      success: true,
      data: transformedScheme
    });

  } catch (error) {
    logger.error('Get scheme error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get trending schemes
router.get('/trending/list', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('language').optional().isIn(['en', 'hi']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { limit = 10, language = 'en' } = req.query;

    const schemes = await Scheme.find({ status: 'published' })
      .sort({ 'analytics.popularityScore': -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .lean();

    // Transform schemes based on language preference
    const transformedSchemes = schemes.map(scheme => ({
      ...scheme,
      title: scheme.title[language] || scheme.title.en,
      description: scheme.description[language] || scheme.description.en,
      benefits: {
        ...scheme.benefits,
        financial: scheme.benefits.financial[language] || scheme.benefits.financial.en
      }
    }));

    res.json({
      success: true,
      data: transformedSchemes
    });

  } catch (error) {
    logger.error('Get trending schemes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get scheme statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Scheme.getStatistics();
    
    // Get additional analytics
    const [categoryStats, stateStats, recentSchemes] = await Promise.all([
      Scheme.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Scheme.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Scheme.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug createdAt analytics.views')
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        overview: stats,
        categoryDistribution: categoryStats,
        stateDistribution: stateStats,
        recentSchemes
      }
    });

  } catch (error) {
    logger.error('Get scheme statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
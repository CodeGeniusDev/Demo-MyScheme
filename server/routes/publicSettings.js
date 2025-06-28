import express from 'express';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get public site settings (theme, etc.)
router.get('/', asyncHandler(async (req, res) => {
  // Return default theme settings that can be publicly accessed
  const publicSettings = {
    defaultTheme: 'system',
    primaryColor: '#16a34a',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#f9fafb',
    textColor: '#111827',
    borderColor: '#e5e7eb',
    fontFamily: 'Inter',
    fontSize: '16',
    fontWeight: '400',
    lineHeight: '1.5',
    borderRadius: '8',
    spacing: '16',
    maxWidth: '1200',
    headerHeight: '64',
    shadowIntensity: 'medium',
    animationSpeed: 'normal',
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    data: publicSettings
  });
}));

export default router;
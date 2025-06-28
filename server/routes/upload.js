import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { type } = req.body;
    const typeDir = path.join(uploadsDir, type || 'misc');
    
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const { type } = req.body;
  
  // Define allowed file types based on upload type
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    avatar: ['image/jpeg', 'image/png', 'image/gif']
  };
  
  const allowed = allowedTypes[type] || allowedTypes.image;
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowed.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Single file upload
router.post('/single', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  const { type = 'misc' } = req.body;
  
  // Generate file URL
  const fileUrl = `/uploads/${type}/${req.file.filename}`;
  
  // Log upload activity
  if (req.user) {
    await req.user.logActivity('file_uploaded', 'file', req.file.filename, {
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      uploadType: type
    }, req);
  }

  logger.info('File uploaded successfully', {
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype,
    uploadedBy: req.user?.username || 'anonymous'
  });

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      type: req.file.mimetype
    }
  });
}));

// Multiple files upload
router.post('/multiple', upload.array('files', 5), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded'
    });
  }

  const { type = 'misc' } = req.body;
  
  const uploadedFiles = req.files.map(file => {
    const fileUrl = `/uploads/${type}/${file.filename}`;
    
    return {
      filename: file.filename,
      originalName: file.originalname,
      url: fileUrl,
      size: file.size,
      type: file.mimetype
    };
  });

  // Log upload activity
  if (req.user) {
    await req.user.logActivity('files_uploaded', 'file', 'multiple', {
      fileCount: req.files.length,
      totalSize: req.files.reduce((sum, file) => sum + file.size, 0),
      uploadType: type
    }, req);
  }

  logger.info('Multiple files uploaded successfully', {
    fileCount: req.files.length,
    totalSize: req.files.reduce((sum, file) => sum + file.size, 0),
    uploadedBy: req.user?.username || 'anonymous'
  });

  res.json({
    success: true,
    message: `${req.files.length} files uploaded successfully`,
    data: {
      files: uploadedFiles,
      count: req.files.length
    }
  });
}));

// Delete file
router.delete('/:type/:filename', asyncHandler(async (req, res) => {
  const { type, filename } = req.params;
  
  // Validate filename to prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid filename'
    });
  }

  const filePath = path.join(uploadsDir, type, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  try {
    // Delete the file
    fs.unlinkSync(filePath);
    
    // Log deletion activity
    if (req.user) {
      await req.user.logActivity('file_deleted', 'file', filename, {
        type,
        filename
      }, req);
    }

    logger.info('File deleted successfully', {
      filename,
      type,
      deletedBy: req.user?.username || 'anonymous'
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    logger.error('Failed to delete file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
}));

// Get file info
router.get('/info/:type/:filename', asyncHandler(async (req, res) => {
  const { type, filename } = req.params;
  
  // Validate filename
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid filename'
    });
  }

  const filePath = path.join(uploadsDir, type, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  try {
    const stats = fs.statSync(filePath);
    const fileUrl = `/uploads/${type}/${filename}`;
    
    res.json({
      success: true,
      data: {
        filename,
        url: fileUrl,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        type
      }
    });
    
  } catch (error) {
    logger.error('Failed to get file info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get file information'
    });
  }
}));

// List files
router.get('/list/:type?', asyncHandler(async (req, res) => {
  const { type = '' } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const targetDir = type ? path.join(uploadsDir, type) : uploadsDir;
  
  if (!fs.existsSync(targetDir)) {
    return res.json({
      success: true,
      data: {
        files: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        }
      }
    });
  }

  try {
    const files = fs.readdirSync(targetDir, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => {
        const filePath = path.join(targetDir, dirent.name);
        const stats = fs.statSync(filePath);
        const fileUrl = type 
          ? `/uploads/${type}/${dirent.name}`
          : `/uploads/${dirent.name}`;
        
        return {
          filename: dirent.name,
          url: fileUrl,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          type: type || 'misc'
        };
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    // Pagination
    const total = files.length;
    const totalPages = Math.ceil(total / parseInt(limit));
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedFiles = files.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to list files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list files'
    });
  }
}));

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        error: 'Too many files. Maximum is 5 files.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
});

export default router;
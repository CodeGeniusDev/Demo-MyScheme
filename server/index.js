import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import schemeRoutes from './routes/schemes.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Import socket handlers
import { setupSocketHandlers } from './socket/handlers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myscheme';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.get('X-Request-ID')
  });
  next();
});

// Database connection with graceful fallback
let dbConnected = false;

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000, // Give up initial connection after 10s
    });
    
    logger.info('Connected to MongoDB');
    dbConnected = true;
  } catch (error) {
    logger.warn('MongoDB connection failed, running in demo mode:', error.message);
    logger.info('To connect to a database, please:');
    logger.info('1. Set up MongoDB Atlas (cloud) or another MongoDB service');
    logger.info('2. Update MONGODB_URI in your .env file');
    logger.info('3. Restart the server');
    dbConnected = false;
  }
}

// Attempt database connection
await connectToDatabase();

// Socket.IO setup
setupSocketHandlers(io);

// Make io available to routes
app.set('io', io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: io.engine.clientsCount
  });
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: dbConnected,
    message: dbConnected 
      ? 'Database connected successfully' 
      : 'Database not connected - running in demo mode. Please configure MONGODB_URI in your environment variables.'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on database connection rejections in demo mode
  if (reason && reason.name !== 'MongooseServerSelectionError') {
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    if (dbConnected) {
      mongoose.connection.close(false, () => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!dbConnected) {
    logger.info('Running in demo mode - database features may be limited');
  }
});

export default app;
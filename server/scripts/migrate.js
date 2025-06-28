import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myscheme';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('Connected to MongoDB');

    // Create indexes
    await createIndexes();
    
    // Run data migrations
    await runDataMigrations();
    
    logger.info('All migrations completed successfully');
    process.exit(0);
    
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  logger.info('Creating database indexes...');
  
  const db = mongoose.connection.db;
  
  // Users collection indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1 });
  await db.collection('users').createIndex({ isActive: 1 });
  await db.collection('users').createIndex({ createdAt: -1 });
  await db.collection('users').createIndex({ lastLogin: -1 });
  
  // Schemes collection indexes
  await db.collection('schemes').createIndex({ slug: 1 }, { unique: true });
  await db.collection('schemes').createIndex({ status: 1 });
  await db.collection('schemes').createIndex({ schemeType: 1 });
  await db.collection('schemes').createIndex({ state: 1 });
  await db.collection('schemes').createIndex({ category: 1 });
  await db.collection('schemes').createIndex({ tags: 1 });
  await db.collection('schemes').createIndex({ 
    'title.en': 'text', 
    'description.en': 'text', 
    tags: 'text' 
  });
  await db.collection('schemes').createIndex({ createdAt: -1 });
  await db.collection('schemes').createIndex({ 'analytics.views': -1 });
  await db.collection('schemes').createIndex({ 'analytics.popularityScore': -1 });
  
  // Analytics collection indexes
  await db.collection('analytics').createIndex({ type: 1, timestamp: -1 });
  await db.collection('analytics').createIndex({ userId: 1, timestamp: -1 });
  await db.collection('analytics').createIndex({ sessionId: 1 });
  await db.collection('analytics').createIndex({ resourceId: 1, type: 1 });
  await db.collection('analytics').createIndex({ 'eventData.searchQuery': 1 });
  await db.collection('analytics').createIndex({ processed: 1 });
  
  // TTL index for analytics (2 years)
  await db.collection('analytics').createIndex(
    { timestamp: 1 }, 
    { expireAfterSeconds: 63072000 }
  );
  
  logger.info('Database indexes created successfully');
}

async function runDataMigrations() {
  logger.info('Running data migrations...');
  
  // Add any data migration logic here
  // For example, updating existing documents, adding new fields, etc.
  
  logger.info('Data migrations completed');
}

// Run migrations
runMigrations();
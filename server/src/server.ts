import app from './app.js';
import database from './config/database.js';
import { connectRedis, disconnectRedis, isConnected } from './config/redis.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';
import { startAllWorkers } from './workers/code-execution.worker.js';

const PORT = env.PORT;

async function startServer() {
  try {
    // Connect to database
    await database.connect();

    // Connect to Redis (optional - will continue if Redis is not available)
    try {
      await connectRedis();
      
      // Start workers if Redis is connected
      if (isConnected()) {
        startAllWorkers();
        logger.info('✅ Code execution workers started');
      }
    } catch (error) {
      logger.warn('Redis connection failed. Queue and cache features will be disabled:', error);
      logger.warn('Server will continue without Redis. Set REDIS_URL in .env to enable queues and caching.');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 CORS enabled for: ${env.CORS_ORIGIN}`);
      if (isConnected()) {
        logger.info(`✅ Redis connected`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  if (isConnected()) {
    await disconnectRedis();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.disconnect();
  if (isConnected()) {
    await disconnectRedis();
  }
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();


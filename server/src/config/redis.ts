/**
 * Redis Configuration
 * 
 * Simple Redis connection using ioredis (similar to StackExchange.Redis pattern)
 */

import Redis from 'ioredis';
import { env } from './env.js';
import logger from '../utils/logger.js';

// Parse Redis configuration (similar to StackExchange.Redis ConfigurationOptions)
function parseRedisConfig() {
  // Option 1: Use REDIS_URL if provided (single connection string)
  if (env.REDIS_URL) {
    const redisUrl = env.REDIS_URL;
    
    // If URL format: redis://user:password@host:port or rediss:// (SSL)
    if (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) {
      // ioredis handles both redis:// and rediss:// URLs directly
      // rediss:// automatically enables TLS/SSL
      return redisUrl;
    }
  }

  // Option 2: Use individual components (like StackExchange.Redis ConfigurationOptions)
  // EndPoints: { {host, port} }
  // User: "default"
  // Password: "password"
  if (env.REDIS_HOST && env.REDIS_PORT) {
    const config: {
      host: string;
      port: number;
      username?: string;
      password?: string;
      tls?: any;
    } = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    };

    // Add username if provided
    if (env.REDIS_USER) {
      config.username = env.REDIS_USER;
    }

    // Add password if provided
    if (env.REDIS_PASSWORD) {
      config.password = env.REDIS_PASSWORD;
    }

    // Enable TLS if using Redis Cloud (typically uses SSL)
    // Only enable if explicitly using SSL port (6380) or if host indicates SSL
    // For port 15535 (non-SSL) or other standard ports, don't enable TLS
    const isCloudHost = env.REDIS_HOST.includes('cloud.redislabs.com') || env.REDIS_HOST.includes('redis.cloud');
    const isSSLPort = env.REDIS_PORT === 6380 || env.REDIS_PORT === 6381;
    
    // Only enable TLS if it's a cloud host AND using SSL port, or if REDIS_URL uses rediss://
    if (isCloudHost && isSSLPort) {
      config.tls = {
        rejectUnauthorized: true,
      };
    }

    return config;
  }

  // Default to localhost if nothing specified
  return {
    host: 'localhost',
    port: 6379,
  };
}

// Create Redis connection (similar to ConnectionMultiplexer.Connect)
const redisConfig = parseRedisConfig();

// Determine if we need TLS based on config
let tlsConfig: any = undefined;
if (typeof redisConfig === 'string') {
  // For URL strings, ioredis automatically handles rediss:// for SSL
  // Don't set TLS option when using URL string - let ioredis handle it
  tlsConfig = undefined;
} else if (redisConfig.tls) {
  // TLS was already set in parseRedisConfig for cloud hosts
  tlsConfig = redisConfig.tls;
}

// Create Redis connection with proper SSL/TLS support for Redis Cloud
export const redis = new Redis(redisConfig as any, {
  retryStrategy: (times: number) => {
    if (times > 10) {
      logger.error('Redis reconnection failed after 10 attempts');
      return null; // Stop retrying
    }
    // Exponential backoff: 50ms, 100ms, 200ms, etc.
    return Math.min(times * 50, 1000);
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true, // Don't connect immediately
  // Only set TLS if explicitly configured (not for URL strings - ioredis handles rediss:// automatically)
  tls: tlsConfig,
});

// Event handlers
redis.on('connect', () => {
  logger.info('Redis connecting...');
});

redis.on('ready', () => {
  logger.info('✅ Redis connected and ready');
});

redis.on('error', (error: Error) => {
  logger.error('Redis error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('reconnecting', (delay: number) => {
  logger.warn(`Redis reconnecting in ${delay}ms...`);
});

// Get database instance (similar to muxer.GetDatabase())
export function getDatabase(): Redis {
  return redis;
}

// Connect to Redis
export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
    logger.info('✅ Redis connected successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

// Disconnect from Redis
export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
    logger.info('Redis disconnected');
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
    throw error;
  }
}

// Check connection status
export function isConnected(): boolean {
  return redis.status === 'ready';
}

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    if (redis.status !== 'ready') {
      return false;
    }
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis connection test failed:', error);
    return false;
  }
}

// Export default for backward compatibility
export default {
  getClient: () => redis,
  connect: connectRedis,
  disconnect: disconnectRedis,
  getConnectionStatus: isConnected,
  testConnection,
};

/**
 * Cache Service
 * 
 * Handles caching using Redis for:
 * - Question data
 * - Execution results
 * - User progress
 * - Language runtime configs
 */

import { getDatabase } from '../config/redis.js';
import logger from '../utils/logger.js';
import { createHash } from 'crypto';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

class CacheService {
  /**
   * Generate cache key
   */
  private generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`;
  }

  /**
   * Generate hash for code (for result caching)
   */
  private hashCode(code: string, language: string, questionId?: string): string {
    const content = `${code}:${language}:${questionId || ''}`;
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = getDatabase();
      const value = await db.get(key);
      
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    try {
      const db = getDatabase();
      const serialized = JSON.stringify(value);
      
      if (options?.ttl) {
        await db.setex(key, options.ttl, serialized);
      } else {
        await db.set(key, serialized);
      }

      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const db = getDatabase();
      await db.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const db = getDatabase();
      const keys = await db.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      return await db.del(...keys);
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const db = getDatabase();
      const result = await db.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  // ========== Question Cache ==========

  /**
   * Get question from cache
   */
  async getQuestion(questionId: string): Promise<any | null> {
    const key = this.generateKey('question', questionId);
    return this.get(key);
  }

  /**
   * Cache question data
   * TTL: 1 hour (3600 seconds)
   */
  async cacheQuestion(questionId: string, questionData: any): Promise<boolean> {
    const key = this.generateKey('question', questionId);
    return this.set(key, questionData, { ttl: 3600 });
  }

  /**
   * Invalidate question cache
   */
  async invalidateQuestion(questionId: string): Promise<boolean> {
    const key = this.generateKey('question', questionId);
    return this.delete(key);
  }

  // ========== Execution Result Cache ==========

  /**
   * Get execution result from cache
   */
  async getExecutionResult(code: string, language: string, questionId?: string): Promise<any | null> {
    const hash = this.hashCode(code, language, questionId);
    const key = this.generateKey('result', hash);
    return this.get(key);
  }

  /**
   * Cache execution result
   * TTL: 30 minutes (1800 seconds)
   */
  async cacheExecutionResult(
    code: string,
    language: string,
    result: any,
    questionId?: string
  ): Promise<boolean> {
    const hash = this.hashCode(code, language, questionId);
    const key = this.generateKey('result', hash);
    return this.set(key, result, { ttl: 1800 });
  }

  // ========== User Progress Cache ==========

  /**
   * Get user progress from cache
   */
  async getUserProgress(userId: string, questionId: string): Promise<any | null> {
    const key = this.generateKey('progress', `${userId}:${questionId}`);
    return this.get(key);
  }

  /**
   * Cache user progress
   * TTL: 5 minutes (300 seconds)
   */
  async cacheUserProgress(userId: string, questionId: string, progress: any): Promise<boolean> {
    const key = this.generateKey('progress', `${userId}:${questionId}`);
    return this.set(key, progress, { ttl: 300 });
  }

  /**
   * Invalidate user progress cache
   */
  async invalidateUserProgress(userId: string, questionId?: string): Promise<boolean> {
    if (questionId) {
      const key = this.generateKey('progress', `${userId}:${questionId}`);
      return this.delete(key);
    } else {
      // Invalidate all progress for user
      const pattern = this.generateKey('progress', `${userId}:*`);
      const deleted = await this.deleteByPattern(pattern);
      return deleted > 0;
    }
  }

  // ========== Language Runtime Cache ==========

  /**
   * Get language runtime config from cache
   */
  async getLanguageRuntime(language: string): Promise<any | null> {
    const key = this.generateKey('runtime', language.toLowerCase());
    return this.get(key);
  }

  /**
   * Cache language runtime config
   * TTL: 24 hours (86400 seconds)
   */
  async cacheLanguageRuntime(language: string, config: any): Promise<boolean> {
    const key = this.generateKey('runtime', language.toLowerCase());
    return this.set(key, config, { ttl: 86400 });
  }

  // ========== Cache Statistics ==========

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
  }> {
    try {
      const db = getDatabase();
      const info = await db.info('memory');
      const keys = await db.dbsize();

      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'unknown';

      return {
        totalKeys: keys,
        memoryUsage,
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'unknown',
      };
    }
  }
}

export default new CacheService();


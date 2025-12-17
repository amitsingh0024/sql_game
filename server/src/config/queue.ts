/**
 * Bull Queue Configuration
 * 
 * Sets up Bull queues for code execution
 */

import Queue from 'bull';
import { env } from './env.js';
import { getDatabase } from './redis.js';
import logger from '../utils/logger.js';

// Queue instances (one per language)
const queues: Map<string, Queue.Queue> = new Map();

/**
 * Get or create a queue for a specific language
 */
export function getQueue(language: string): Queue.Queue {
  const normalizedLang = language.toUpperCase();
  
  if (queues.has(normalizedLang)) {
    return queues.get(normalizedLang)!;
  }

  // Create new queue
  const queueName = `code-execution:${normalizedLang.toLowerCase()}`;
  
  // Use the same Redis connection (ioredis instance)
  // Bull can use the Redis instance directly or connection string
  const queue = new Queue(queueName, {
    createClient: (type) => {
      // Return the same Redis instance for all connection types
      return getDatabase();
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // 2s, 4s, 8s
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 1000, // Keep max 1000 completed jobs
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    },
    settings: {
      maxStalledCount: 1,
      retryProcessDelay: 5000,
    },
  });

  // Queue event handlers
  queue.on('error', (error) => {
    logger.error(`Queue ${queueName} error:`, error);
  });

  queue.on('waiting', (jobId) => {
    logger.debug(`Job ${jobId} is waiting in queue ${queueName}`);
  });

  queue.on('active', (job) => {
    logger.info(`Job ${job.id} started processing in queue ${queueName}`);
  });

  queue.on('completed', (job, result) => {
    logger.info(`Job ${job.id} completed in queue ${queueName}`);
  });

  queue.on('failed', (job, error) => {
    logger.error(`Job ${job.id} failed in queue ${queueName}:`, error);
  });

  queue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} stalled in queue ${queueName}`);
  });

  queues.set(normalizedLang, queue);
  logger.info(`✅ Created queue: ${queueName}`);

  return queue;
}

/**
 * Get all queues
 */
export function getAllQueues(): Map<string, Queue.Queue> {
  return new Map(queues);
}

/**
 * Close all queues
 */
export async function closeAllQueues(): Promise<void> {
  const closePromises = Array.from(queues.values()).map(queue => queue.close());
  await Promise.all(closePromises);
  queues.clear();
  logger.info('All queues closed');
}

/**
 * Get queue statistics
 */
export async function getQueueStats(language: string): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = getQueue(language);
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}


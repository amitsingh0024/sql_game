/**
 * Code Execution Worker
 * 
 * Processes code execution jobs from Bull queues
 * This should run as a separate process or in a worker thread
 */

import { getQueue } from '../config/queue.js';
import executionService from '../services/execution.service.js';
import cacheService from '../services/cache.service.js';
import engineRegistry from '../engines/EngineRegistry.js';
import logger from '../utils/logger.js';
import { isConnected } from '../config/redis.js';

// Concurrency limits per language
const CONCURRENCY_LIMITS: Record<string, number> = {
  SQL: 20,
  'C++': 3,
  JAVASCRIPT: 10,
  PYTHON: 5,
  JAVA: 3,
  AI: 2,
  ML: 2,
};

/**
 * Start processing jobs for a specific language
 */
export function startWorker(language: string): void {
  const normalizedLang = language.toUpperCase();
  const queue = getQueue(normalizedLang);
  const concurrency = CONCURRENCY_LIMITS[normalizedLang] || 5;

  logger.info(`Starting worker for ${normalizedLang} with concurrency ${concurrency}`);

  queue.process(concurrency, async (job) => {
    const { code, language: lang, questionId, input, timeout, userId } = job.data;

    logger.info(`Processing job ${job.id} for ${lang}`, { userId, questionId });

    try {
      // Check cache first (if Redis is available)
      if (isConnected()) {
        const cachedResult = await cacheService.getExecutionResult(code, lang, questionId);
        if (cachedResult) {
          logger.info(`Job ${job.id}: Returning cached result`);
          return cachedResult;
        }
      }

      // Execute code
      const result = await executionService.executeCode(
        {
          code,
          language: lang,
          questionId,
          input,
          timeout,
        },
        userId
      );

      // Cache result (if Redis is available)
      if (isConnected() && result.success) {
        await cacheService.cacheExecutionResult(code, lang, result, questionId);
      }

      logger.info(`Job ${job.id} completed successfully`);
      return result;
    } catch (error: any) {
      logger.error(`Job ${job.id} failed:`, error);
      throw error;
    }
  });
}

/**
 * Start workers for all registered languages
 */
export function startAllWorkers(): void {
  const languages = engineRegistry.getLanguages();
  
  logger.info(`Starting workers for languages: ${languages.join(', ')}`);

  for (const language of languages) {
    startWorker(language);
  }

  logger.info('✅ All workers started');
}

/**
 * Stop all workers
 */
export async function stopAllWorkers(): Promise<void> {
  const { closeAllQueues } = await import('../config/queue.js');
  await closeAllQueues();
  logger.info('All workers stopped');
}


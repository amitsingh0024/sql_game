/**
 * Queue Execution Service
 * 
 * Handles code execution through Bull queues
 * Provides async execution with job tracking
 */

import { getQueue } from '../config/queue.js';
import executionService from './execution.service.js';
import cacheService from './cache.service.js';
import { ExecuteCodeRequest, ExecuteCodeResponse } from './execution.service.js';
import logger from '../utils/logger.js';
import { isConnected } from '../config/redis.js';

export interface JobData extends ExecuteCodeRequest {
  userId?: string;
  priority?: number;
}

export interface JobResult extends ExecuteCodeResponse {
  jobId: string;
}

/**
 * Add code execution job to queue
 */
export async function addExecutionJob(data: JobData): Promise<string> {
  const { code, language, questionId } = data;

  // Check cache first for duplicate submissions
  if (isConnected()) {
    const cachedResult = await cacheService.getExecutionResult(code, language, questionId);
    if (cachedResult) {
      logger.info('Returning cached execution result');
      // Return immediately with cached result (but still create job for tracking)
      // In a real scenario, you might want to return cached result directly
    }
  }

  // Get queue for language
  const queue = getQueue(language);

  // Set priority based on user tier (default: 3 for regular users)
  const priority = data.priority || 3;

  // Add job to queue
  const job = await queue.add(
    {
      code,
      language,
      questionId: questionId,
      input: data.input,
      timeout: data.timeout,
      userId: data.userId,
    },
    {
      priority,
      jobId: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
  );

  logger.info(`Added execution job ${job.id} to queue for language ${language}`);

  return job.id!;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string, language: string): Promise<{
  id: string;
  state: string;
  progress?: number;
  result?: ExecuteCodeResponse;
  error?: string;
}> {
  const queue = getQueue(language);
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const state = await job.getState();
  const result: any = {
    id: job.id!,
    state,
  };

  if (state === 'completed') {
    result.result = job.returnvalue;
  } else if (state === 'failed') {
    result.error = job.failedReason;
  }

  return result;
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string, language: string): Promise<boolean> {
  const queue = getQueue(language);
  const job = await queue.getJob(jobId);

  if (!job) {
    return false;
  }

  await job.remove();
  return true;
}

/**
 * Get queue statistics
 */
export async function getQueueStatistics(language: string) {
  const { getQueueStats } = await import('../config/queue.js');
  return getQueueStats(language);
}


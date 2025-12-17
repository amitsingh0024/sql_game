/**
 * Base Engine Abstract Class
 * 
 * Provides common functionality for all code execution engines
 */

import { ICodeEngine, ExecutionResult, ExecutionOptions, EngineMetadata, ResourceUsage } from '../types.js';
import logger from '../../utils/logger.js';

export abstract class BaseEngine implements ICodeEngine {
  protected startTime: number = 0;
  protected endTime: number = 0;
  protected resourceUsage: ResourceUsage = {
    cpuTime: 0,
    memoryUsed: 0,
    executionTime: 0,
  };

  abstract getMetadata(): EngineMetadata;
  abstract validate(code: string): Promise<boolean>;
  abstract execute(code: string, options?: ExecutionOptions): Promise<ExecutionResult>;
  abstract compareResult(result: ExecutionResult, expectedOutput: string): boolean;

  /**
   * Start execution timer
   */
  protected startTimer(): void {
    this.startTime = Date.now();
  }

  /**
   * End execution timer and calculate duration
   */
  protected endTimer(): number {
    this.endTime = Date.now();
    this.resourceUsage.executionTime = this.endTime - this.startTime;
    return this.resourceUsage.executionTime;
  }

  /**
   * Check if execution timeout has been exceeded
   */
  protected checkTimeout(startTime: number, timeout: number): void {
    const elapsed = Date.now() - startTime;
    if (elapsed > timeout) {
      throw new Error(`Execution timeout: exceeded ${timeout}ms`);
    }
  }

  /**
   * Normalize output for comparison (trim whitespace, normalize line endings)
   */
  protected normalizeOutput(output: string): string {
    return output.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  /**
   * Compare outputs with normalization
   */
  protected compareOutputs(actual: string, expected: string): boolean {
    const normalizedActual = this.normalizeOutput(actual);
    const normalizedExpected = this.normalizeOutput(expected);
    return normalizedActual === normalizedExpected;
  }

  /**
   * Create error result
   */
  protected createErrorResult(error: string, executionTime: number): ExecutionResult {
    return {
      success: false,
      output: '',
      error,
      executionTime,
      exitCode: 1,
    };
  }

  /**
   * Create success result
   */
  protected createSuccessResult(output: string, executionTime: number): ExecutionResult {
    return {
      success: true,
      output: this.normalizeOutput(output),
      executionTime,
      exitCode: 0,
    };
  }

  /**
   * Log execution details
   */
  protected logExecution(language: string, success: boolean, executionTime: number): void {
    logger.info(`[${language} Engine] Execution ${success ? 'succeeded' : 'failed'} in ${executionTime}ms`);
  }

  /**
   * Get resource usage
   */
  getResourceUsage(): ResourceUsage {
    return { ...this.resourceUsage };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Override in subclasses if needed
    this.resourceUsage = {
      cpuTime: 0,
      memoryUsed: 0,
      executionTime: 0,
    };
  }
}


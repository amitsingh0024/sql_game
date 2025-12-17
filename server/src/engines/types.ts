/**
 * Engine Types and Interfaces
 * 
 * Defines common types and interfaces for all code execution engines
 */

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number; // in milliseconds
  memoryUsage?: number; // in bytes
  exitCode?: number;
}

export interface ExecutionOptions {
  timeout?: number; // in milliseconds, default 30000
  maxMemory?: number; // in bytes
  input?: string; // input data for the code
  expectedOutput?: string; // expected output for comparison
}

export interface EngineMetadata {
  language: string;
  version: string;
  supportedExtensions: string[];
  maxExecutionTime: number;
  maxMemory: number;
}

export interface ResourceUsage {
  cpuTime: number; // in milliseconds
  memoryUsed: number; // in bytes
  executionTime: number; // in milliseconds
}

/**
 * Base interface that all engines must implement
 */
export interface ICodeEngine {
  /**
   * Get engine metadata
   */
  getMetadata(): EngineMetadata;

  /**
   * Validate code before execution
   * @param code - Code to validate
   * @returns true if valid, throws error if invalid
   */
  validate(code: string): Promise<boolean>;

  /**
   * Execute code
   * @param code - Code to execute
   * @param options - Execution options
   * @returns Execution result
   */
  execute(code: string, options?: ExecutionOptions): Promise<ExecutionResult>;

  /**
   * Compare execution result with expected output
   * @param result - Execution result
   * @param expectedOutput - Expected output
   * @returns true if matches, false otherwise
   */
  compareResult(result: ExecutionResult, expectedOutput: string): boolean;

  /**
   * Clean up resources after execution
   */
  cleanup?(): Promise<void>;

  /**
   * Get resource usage statistics
   */
  getResourceUsage?(): ResourceUsage;
}


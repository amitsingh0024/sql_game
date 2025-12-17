/**
 * JavaScript Execution Engine
 * 
 * Executes JavaScript code using Node.js VM module in a sandboxed environment
 */

import { BaseEngine } from '../base/BaseEngine.js';
import { ExecutionResult, ExecutionOptions, EngineMetadata } from '../types.js';
import { createContext, runInContext, Script } from 'vm';
import { ValidationError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

export class JsEngine extends BaseEngine {
  private readonly metadata: EngineMetadata = {
    language: 'JAVASCRIPT',
    version: '1.0.0',
    supportedExtensions: ['.js', '.mjs'],
    maxExecutionTime: 5000, // 5 seconds for JavaScript
    maxMemory: 50 * 1024 * 1024, // 50MB
  };

  getMetadata(): EngineMetadata {
    return this.metadata;
  }

  /**
   * Validate JavaScript code
   * - Check for dangerous operations
   * - Basic syntax validation
   */
  async validate(code: string): Promise<boolean> {
    if (!code || typeof code !== 'string') {
      throw new ValidationError('JavaScript code must be a non-empty string');
    }

    const trimmedCode = code.trim();
    if (trimmedCode.length === 0) {
      throw new ValidationError('JavaScript code cannot be empty');
    }

    // Check for dangerous operations
    const dangerousPatterns = [
      /require\s*\(\s*['"]fs['"]/i,
      /require\s*\(\s*['"]child_process['"]/i,
      /require\s*\(\s*['"]os['"]/i,
      /require\s*\(\s*['"]net['"]/i,
      /require\s*\(\s*['"]http['"]/i,
      /require\s*\(\s*['"]https['"]/i,
      /require\s*\(\s*['"]dns['"]/i,
      /require\s*\(\s*['"]crypto['"]/i,
      /require\s*\(\s*['"]path['"]/i,
      /require\s*\(\s*['"]process['"]/i,
      /eval\s*\(/i,
      /Function\s*\(/i,
      /new\s+Function\s*\(/i,
      /process\./i,
      /global\./i,
      /globalThis\./i,
      /__dirname/i,
      /__filename/i,
      /import\s+.*\s+from\s+['"]fs['"]/i,
      /import\s+.*\s+from\s+['"]child_process['"]/i,
      /import\s+.*\s+from\s+['"]os['"]/i,
      /import\s+.*\s+from\s+['"]net['"]/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new ValidationError('Dangerous operation detected. File system, network, and system operations are not allowed.');
      }
    }

    // Try to parse the code to check for syntax errors
    try {
      new Script(code);
    } catch (error: any) {
      throw new ValidationError(`JavaScript syntax error: ${error.message}`);
    }

    return true;
  }

  /**
   * Execute JavaScript code in sandboxed VM
   */
  async execute(code: string, options?: ExecutionOptions): Promise<ExecutionResult> {
    this.startTimer();

    const timeout = options?.timeout || this.metadata.maxExecutionTime;
    const startTime = Date.now();

    try {
      // Validate code first
      await this.validate(code);

      // Create sandboxed context
      const sandbox = this.createSandbox();
      const context = createContext(sandbox);

      // Capture console output
      let output = '';

      // Override console methods to capture output
      sandbox.console = {
        log: (...args: any[]) => {
          output += args.map(arg => this.formatOutput(arg)).join(' ') + '\n';
        },
        error: (...args: any[]) => {
          output += args.map(arg => this.formatOutput(arg)).join(' ') + '\n';
        },
        warn: (...args: any[]) => {
          output += args.map(arg => this.formatOutput(arg)).join(' ') + '\n';
        },
        info: (...args: any[]) => {
          output += args.map(arg => this.formatOutput(arg)).join(' ') + '\n';
        },
      };

      // Create script with timeout
      const script = new Script(code, {
        timeout: timeout,
        displayErrors: true,
      });

      // Execute script
      let result: any;
      try {
        result = runInContext(code, context, {
          timeout: timeout,
          displayErrors: true,
        });
      } catch (error: any) {
        // Check if it's a timeout
        if (error.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
          const executionTime = this.endTimer();
          this.logExecution('JavaScript', false, executionTime);
          return this.createErrorResult('Execution timeout', executionTime);
        }

        // Runtime error
        const executionTime = this.endTimer();
        this.logExecution('JavaScript', false, executionTime);
        return this.createErrorResult(`Runtime error: ${error.message}`, executionTime);
      }

      // If code returns a value, add it to output
      if (result !== undefined && result !== null) {
        output += this.formatOutput(result);
      }

      const executionTime = this.endTimer();
      this.logExecution('JavaScript', true, executionTime);

      return this.createSuccessResult(output.trim(), executionTime);
    } catch (error: any) {
      const executionTime = this.endTimer();
      const errorMessage = error.message || 'JavaScript execution failed';
      this.logExecution('JavaScript', false, executionTime);

      return this.createErrorResult(errorMessage, executionTime);
    }
  }

  /**
   * Compare execution results
   */
  compareResult(result: ExecutionResult, expectedOutput: string): boolean {
    if (!result.success) {
      return false;
    }

    return this.compareOutputs(result.output, expectedOutput);
  }

  /**
   * Create sandboxed context with safe globals
   */
  private createSandbox(): any {
    return {
      // Safe Math functions
      Math: Math,
      
      // Safe Date functions
      Date: Date,
      
      // Safe String functions
      String: String,
      Number: Number,
      Boolean: Boolean,
      Array: Array,
      Object: Object,
      RegExp: RegExp,
      JSON: JSON,
      
      // Safe console (will be overridden)
      console: console,
      
      // Safe setTimeout/setInterval (with limits)
      setTimeout: (fn: Function, delay: number) => {
        if (delay > 1000) delay = 1000; // Max 1 second
        return setTimeout(fn, delay);
      },
      setInterval: (fn: Function, delay: number) => {
        if (delay > 1000) delay = 1000; // Max 1 second
        return setInterval(fn, delay);
      },
      clearTimeout: clearTimeout,
      clearInterval: clearInterval,
      
      // Safe isNaN, isFinite
      isNaN: isNaN,
      isFinite: isFinite,
      parseInt: parseInt,
      parseFloat: parseFloat,
      
      // Safe encode/decode
      encodeURI: encodeURI,
      decodeURI: decodeURI,
      encodeURIComponent: encodeURIComponent,
      decodeURIComponent: decodeURIComponent,
      
      // Error constructors
      Error: Error,
      TypeError: TypeError,
      ReferenceError: ReferenceError,
      SyntaxError: SyntaxError,
      RangeError: RangeError,
      
      // Prevent access to dangerous globals
      process: undefined,
      global: undefined,
      globalThis: undefined,
      require: undefined,
      module: undefined,
      exports: undefined,
      __dirname: undefined,
      __filename: undefined,
    };
  }

  /**
   * Format output value for display
   */
  private formatOutput(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    
    return String(value);
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await super.cleanup();
    // VM contexts are automatically garbage collected
  }
}


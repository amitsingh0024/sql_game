/**
 * C++ Execution Engine
 * 
 * Compiles and executes C++ code in a sandboxed environment
 */

import { BaseEngine } from '../base/BaseEngine.js';
import { ExecutionResult, ExecutionOptions, EngineMetadata } from '../types.js';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { platform } from 'os';
import logger from '../../utils/logger.js';
import { ValidationError } from '../../utils/errors.js';

const execAsync = promisify(exec);

export class CppEngine extends BaseEngine {
  private readonly metadata: EngineMetadata = {
    language: 'C++',
    version: '1.0.0',
    supportedExtensions: ['.cpp', '.cxx', '.cc'],
    maxExecutionTime: 10000, // 10 seconds for C++
    maxMemory: 100 * 1024 * 1024, // 100MB
  };

  private tempDir: string;
  private readonly compiler: string;
  private readonly compilerFlags: string[];
  private readonly isWindows: boolean;

  constructor() {
    super();
    // Use system temp directory or create a dedicated one
    this.tempDir = process.env.TEMP_DIR || join(process.cwd(), 'temp', 'cpp');
    this.isWindows = platform() === 'win32';
    
    // Determine compiler based on platform
    if (this.isWindows) {
      // On Windows, try to use g++ from MinGW or clang++
      this.compiler = 'g++'; // or 'clang++'
      this.compilerFlags = [
        '-std=c++17',
        '-Wall',
        '-Wextra',
        '-O2',
      ];
    } else {
      // On Unix-like systems
      this.compiler = 'g++';
      this.compilerFlags = [
        '-std=c++17',
        '-Wall',
        '-Wextra',
        '-O2',
      ];
    }
  }

  getMetadata(): EngineMetadata {
    return this.metadata;
  }

  /**
   * Validate C++ code
   * - Check for dangerous operations
   * - Basic syntax validation
   */
  async validate(code: string): Promise<boolean> {
    if (!code || typeof code !== 'string') {
      throw new ValidationError('C++ code must be a non-empty string');
    }

    const trimmedCode = code.trim();
    if (trimmedCode.length === 0) {
      throw new ValidationError('C++ code cannot be empty');
    }

    // Check for dangerous operations
    const dangerousPatterns = [
      /#include\s*<sys\/syscall\.h>/i,
      /#include\s*<unistd\.h>/i,
      /#include\s*<fcntl\.h>/i,
      /system\s*\(/i,
      /exec\s*\(/i,
      /fork\s*\(/i,
      /popen\s*\(/i,
      /fopen\s*\(/i,
      /fstream/i,
      /ofstream/i,
      /ifstream/i,
      /socket\s*\(/i,
      /connect\s*\(/i,
      /send\s*\(/i,
      /recv\s*\(/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new ValidationError('Dangerous operation detected. File system, network, and system calls are not allowed.');
      }
    }

    // Check for required main function
    if (!/int\s+main\s*\(/i.test(code)) {
      throw new ValidationError('C++ code must contain a main function: int main()');
    }

    return true;
  }

  /**
   * Execute C++ code
   * 1. Validate code
   * 2. Write to temporary file
   * 3. Compile code
   * 4. Execute binary
   * 5. Clean up files
   */
  async execute(code: string, options?: ExecutionOptions): Promise<ExecutionResult> {
    this.startTimer();

    const timeout = options?.timeout || this.metadata.maxExecutionTime;
    const uniqueId = randomUUID();
    const sourceFile = join(this.tempDir, `code_${uniqueId}.cpp`);
    const binaryFile = join(this.tempDir, `code_${uniqueId}`);

    try {
      // Validate code first
      await this.validate(code);

      // Ensure temp directory exists
      await this.ensureTempDir();

      // Write code to temporary file
      await writeFile(sourceFile, code, 'utf-8');

      // Compile code
      const compileResult = await this.compileCode(sourceFile, binaryFile, timeout);
      if (!compileResult.success) {
        const executionTime = this.endTimer();
        this.logExecution('C++', false, executionTime);
        return this.createErrorResult(`Compilation error: ${compileResult.error}`, executionTime);
      }

      // Execute binary
      const executeResult = await this.executeBinary(binaryFile, options?.input, timeout);

      // Clean up files
      await this.cleanupFiles(sourceFile, binaryFile);

      const executionTime = this.endTimer();
      this.logExecution('C++', executeResult.success, executionTime);

      return {
        ...executeResult,
        executionTime,
      };
    } catch (error: any) {
      // Clean up files on error
      await this.cleanupFiles(sourceFile, binaryFile).catch(() => {
        // Ignore cleanup errors
      });

      const executionTime = this.endTimer();
      const errorMessage = error.message || 'C++ execution failed';
      this.logExecution('C++', false, executionTime);

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
   * Compile C++ code
   */
  private async compileCode(
    sourceFile: string,
    binaryFile: string,
    timeout: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Build compilation command: compiler flags -o output input
      const compileArgs = [
        ...this.compilerFlags,
        '-o',
        binaryFile,
        sourceFile,
      ];
      
      const { stdout, stderr } = await execAsync(
        `${this.compiler} ${compileArgs.join(' ')}`,
        {
          timeout: Math.min(timeout / 2, 5000), // Compilation timeout (max 5 seconds)
          maxBuffer: 1024 * 1024, // 1MB buffer
        }
      );

      // Check if binary was created (add .exe extension on Windows)
      const executableFile = this.isWindows ? `${binaryFile}.exe` : binaryFile;
      
      if (stderr && stderr.trim().length > 0) {
        // Some warnings might appear in stderr, but compilation might still succeed
        // Check if binary was created
        if (!existsSync(executableFile)) {
          return { success: false, error: stderr };
        }
      }

      if (!existsSync(executableFile)) {
        return { success: false, error: 'Compilation failed: binary not created' };
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.stderr || error.message || 'Compilation failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Execute compiled binary with timeout
   */
  private async executeBinary(
    binaryFile: string,
    input?: string,
    timeout?: number
  ): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const execTimeout = timeout || this.metadata.maxExecutionTime;
      
      // Add .exe extension on Windows
      const executableFile = this.isWindows ? `${binaryFile}.exe` : binaryFile;
      
      if (!existsSync(executableFile)) {
        resolve(this.createErrorResult('Executable not found', 0));
        return;
      }

      // Spawn process for better control
      const childProcess = spawn(executableFile, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false,
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      // Set timeout
      const timeoutId = setTimeout(() => {
        if (!killed) {
          killed = true;
          childProcess.kill('SIGTERM');
          resolve(this.createErrorResult('Execution timeout', 0));
        }
      }, execTimeout);

      // Collect stdout
      childProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      // Collect stderr
      childProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process completion
      childProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        
        if (killed) {
          return; // Already handled by timeout
        }

        // Combine stdout and stderr
        const output = stdout + (stderr ? `\n${stderr}` : '');

        if (code === 0) {
          resolve(this.createSuccessResult(output, 0));
        } else {
          resolve(this.createErrorResult(`Process exited with code ${code}${stderr ? ': ' + stderr : ''}`, 0));
        }
      });

      // Handle process errors
      childProcess.on('error', (error) => {
        clearTimeout(timeoutId);
        if (!killed) {
          killed = true;
          resolve(this.createErrorResult(`Execution error: ${error.message}`, 0));
        }
      });

      // Send input if provided
      if (input && childProcess.stdin) {
        childProcess.stdin.write(input);
        childProcess.stdin.end();
      }
    });
  }

  /**
   * Ensure temporary directory exists
   */
  private async ensureTempDir(): Promise<void> {
    try {
      if (!existsSync(this.tempDir)) {
        await mkdir(this.tempDir, { recursive: true });
      }
    } catch (error) {
      logger.error('Failed to create temp directory:', error);
      throw new Error('Failed to create temporary directory for code execution');
    }
  }

  /**
   * Clean up temporary files
   */
  private async cleanupFiles(sourceFile: string, binaryFile: string): Promise<void> {
    const filesToDelete = [
      sourceFile,
      binaryFile,
      this.isWindows ? `${binaryFile}.exe` : binaryFile,
    ];

    for (const file of filesToDelete) {
      try {
        if (existsSync(file)) {
          await unlink(file);
        }
      } catch (error) {
        logger.warn(`Failed to delete temporary file: ${file}`, error);
        // Don't throw - continue cleaning up other files
      }
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await super.cleanup();
    // Additional cleanup if needed
  }
}


/**
 * SQL Execution Engine
 * 
 * Executes SQL queries against a test database and compares results
 */

import { BaseEngine } from '../base/BaseEngine.js';
import { ExecutionResult, ExecutionOptions, EngineMetadata } from '../types.js';
import mongoose from 'mongoose';
import logger from '../../utils/logger.js';
import { ValidationError } from '../../utils/errors.js';

export class SqlEngine extends BaseEngine {
  private connection: mongoose.Connection | null = null;
  private readonly metadata: EngineMetadata = {
    language: 'SQL',
    version: '1.0.0',
    supportedExtensions: ['.sql'],
    maxExecutionTime: 10000, // 10 seconds for SQL
    maxMemory: 50 * 1024 * 1024, // 50MB
  };

  constructor() {
    super();
  }

  getMetadata(): EngineMetadata {
    return this.metadata;
  }

  /**
   * Validate SQL query
   * - Check for dangerous operations (DROP, DELETE, UPDATE, INSERT, ALTER, etc.)
   * - Only allow SELECT queries for security
   */
  async validate(code: string): Promise<boolean> {
    if (!code || typeof code !== 'string') {
      throw new ValidationError('SQL code must be a non-empty string');
    }

    const trimmedCode = code.trim().toUpperCase();
    
    // Block dangerous SQL operations
    const dangerousKeywords = [
      'DROP',
      'DELETE',
      'UPDATE',
      'INSERT',
      'ALTER',
      'CREATE',
      'TRUNCATE',
      'EXEC',
      'EXECUTE',
      'GRANT',
      'REVOKE',
      'MERGE',
    ];

    for (const keyword of dangerousKeywords) {
      if (trimmedCode.includes(keyword)) {
        throw new ValidationError(`Dangerous SQL operation detected: ${keyword}. Only SELECT queries are allowed.`);
      }
    }

    // Ensure it's a SELECT query
    if (!trimmedCode.startsWith('SELECT')) {
      throw new ValidationError('Only SELECT queries are allowed for security reasons');
    }

    // Check for SQL injection patterns
    const injectionPatterns = [
      /;\s*DROP/i,
      /;\s*DELETE/i,
      /;\s*UPDATE/i,
      /UNION\s+SELECT/i,
      /--/,
      /\/\*/,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(code)) {
        throw new ValidationError('Potential SQL injection detected');
      }
    }

    return true;
  }

  /**
   * Execute SQL query
   */
  async execute(code: string, options?: ExecutionOptions): Promise<ExecutionResult> {
    this.startTimer();

    const timeout = options?.timeout || this.metadata.maxExecutionTime;
    const startTime = Date.now();

    try {
      // Validate code first
      await this.validate(code);

      // Get or create test database connection
      const connection = await this.getTestConnection();

      // Execute query with timeout
      const result = await Promise.race([
        this.executeQuery(connection, code),
        this.createTimeoutPromise(timeout),
      ]);

      const executionTime = this.endTimer();
      this.logExecution('SQL', true, executionTime);

      return this.createSuccessResult(JSON.stringify(result, null, 2), executionTime);
    } catch (error: any) {
      const executionTime = this.endTimer();
      this.logExecution('SQL', false, executionTime);

      const errorMessage = error.message || 'SQL execution failed';
      return this.createErrorResult(errorMessage, executionTime);
    }
  }

  /**
   * Compare SQL query results
   * For SQL, we compare the JSON representation of results
   */
  compareResult(result: ExecutionResult, expectedOutput: string): boolean {
    if (!result.success) {
      return false;
    }

    try {
      // Parse both outputs as JSON for comparison
      const actualData = JSON.parse(result.output);
      const expectedData = JSON.parse(expectedOutput);

      // Compare arrays/objects
      return this.deepEqual(actualData, expectedData);
    } catch {
      // If parsing fails, do string comparison
      return this.compareOutputs(result.output, expectedOutput);
    }
  }

  /**
   * Get or create test database connection
   * Uses a separate connection pool for test queries
   */
  private async getTestConnection(): Promise<mongoose.Connection> {
    if (this.connection && this.connection.readyState === 1) {
      return this.connection;
    }

    // Create a new connection for test queries
    // This uses the same MongoDB URI but a separate connection pool
    const { env } = await import('../../config/env.js');
    
    this.connection = mongoose.createConnection(env.MONGODB_URI, {
      maxPoolSize: 5, // Smaller pool for test queries
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });

    return this.connection;
  }

  /**
   * Execute SQL query (MongoDB aggregation or find)
   * Note: MongoDB doesn't support SQL natively, so we'll use aggregation pipeline
   * For a true SQL engine, you'd need a SQL database like PostgreSQL or MySQL
   */
  private async executeQuery(connection: mongoose.Connection, code: string): Promise<any> {
    // For MongoDB, we'll need to convert SQL-like queries to MongoDB queries
    // This is a simplified implementation
    // For production, consider using a SQL-to-MongoDB converter or a separate SQL database

    // For now, we'll parse basic SELECT queries and convert to MongoDB find
    // This is a placeholder - you may want to use a library like mongo-sql or
    // set up a separate PostgreSQL/MySQL database for SQL queries

    try {
      // Simple SELECT * FROM collection LIMIT N conversion
      const selectMatch = code.match(/SELECT\s+\*\s+FROM\s+(\w+)(?:\s+LIMIT\s+(\d+))?/i);
      
      if (selectMatch) {
        const collectionName = selectMatch[1];
        const limit = selectMatch[2] ? parseInt(selectMatch[2], 10) : 100;

        const collection = connection.collection(collectionName);
        const results = await collection.find({}).limit(limit).toArray();
        
        return {
          rows: results,
          count: results.length,
        };
      }

      // If we can't parse it, return an error
      throw new Error('Complex SQL queries are not yet supported. Please use simple SELECT * FROM collection queries.');
    } catch (error: any) {
      throw new Error(`SQL execution error: ${error.message}`);
    }
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query execution timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Deep equality check for objects/arrays
   */
  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!this.deepEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }

    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!this.deepEqual(obj1[key], obj2[key])) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Cleanup connection
   */
  async cleanup(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.close();
        this.connection = null;
      } catch (error) {
        logger.error('Error closing SQL engine connection:', error);
      }
    }
    await super.cleanup();
  }
}


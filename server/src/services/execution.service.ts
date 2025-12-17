/**
 * Code Execution Service
 * 
 * Handles code execution requests, validation, and result comparison
 */

import engineRegistry from '../engines/EngineRegistry.js';
import { ExecutionResult, ExecutionOptions } from '../engines/types.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { Questions } from '../models/Questions.js';
import { validateAndConvertObjectId } from '../utils/validation.js';
import {
  validateCodeSecurity,
  detectLanguage,
  logSecurityValidation,
} from '../utils/security.validation.js';
import cacheService from './cache.service.js';
import { isConnected } from '../config/redis.js';

export interface ExecuteCodeRequest {
  code: string;
  language: string;
  questionId?: string;
  input?: string;
  timeout?: number;
}

export interface ExecuteCodeResponse {
  success: boolean;
  result: ExecutionResult;
  matchesExpected?: boolean;
  questionId?: string;
  executionTime: number;
}

export class ExecutionService {
  /**
   * Execute code with optional question validation
   */
  async executeCode(request: ExecuteCodeRequest, userId?: string): Promise<ExecuteCodeResponse> {
    const { code, language, questionId, input, timeout } = request;

    // Step 1: Centralized security validation (before language-specific validation)
    const securityCheck = validateCodeSecurity(code, language);
    logSecurityValidation(securityCheck, language, userId);

    if (!securityCheck.safe) {
      throw new ValidationError(
        `Security validation failed: ${securityCheck.threats.join('; ')}`
      );
    }

    // Step 2: Auto-detect language if not provided or validate provided language
    let detectedLanguage = language;
    if (!detectedLanguage) {
      const autoDetected = detectLanguage(code);
      if (autoDetected) {
        detectedLanguage = autoDetected;
        logger.info(`Auto-detected language: ${detectedLanguage}`);
      } else {
        throw new ValidationError(
          'Language not specified and could not be auto-detected. Please specify the language.'
        );
      }
    }

    // Step 3: Validate language is supported
    if (!engineRegistry.has(detectedLanguage)) {
      throw new ValidationError(
        `Language '${detectedLanguage}' is not supported. Supported languages: ${engineRegistry.getLanguages().join(', ')}`
      );
    }

    // Step 4: Get engine
    const engine = engineRegistry.get(detectedLanguage);
    if (!engine) {
      throw new NotFoundError(`Engine for language '${detectedLanguage}' not found`);
    }

    // Step 5: Engine-specific validation (additional security layer)
    try {
      await engine.validate(code);
    } catch (error: any) {
      logger.warn(`Engine validation failed for ${detectedLanguage}`, {
        userId,
        error: error.message,
      });
      throw error; // Re-throw validation error
    }

    // Get question if questionId provided (check cache first)
    let expectedOutput: string | undefined;
    if (questionId) {
      const validQuestionId = validateAndConvertObjectId(questionId, 'questionId');
      
      // Check cache first
      let question: any = null;
      if (isConnected()) {
        question = await cacheService.getQuestion(validQuestionId.toString());
      }

      // If not in cache, fetch from database
      if (!question) {
        question = await Questions.findById(validQuestionId);
        
        if (!question) {
          throw new NotFoundError('Question not found');
        }

        // Cache question data
        if (isConnected()) {
          await cacheService.cacheQuestion(validQuestionId.toString(), {
            _id: question._id,
            question: question.question,
            answer: question.answer,
            questionType: question.questionType,
            question_level: question.question_level,
            isActive: question.isActive,
          });
        }
      }

      // Verify language matches
      if (question.questionType.toUpperCase() !== detectedLanguage.toUpperCase()) {
        throw new ValidationError(
          `Question type '${question.questionType}' does not match language '${detectedLanguage}'`
        );
      }

      expectedOutput = question.answer;
    }

    // Check cache for execution result (if Redis is available)
    if (isConnected()) {
      const cachedResult = await cacheService.getExecutionResult(code, detectedLanguage, questionId);
      if (cachedResult) {
        logger.info('Returning cached execution result');
        return cachedResult;
      }
    }

    // Prepare execution options
    const options: ExecutionOptions = {
      timeout: timeout || engine.getMetadata().maxExecutionTime,
      input,
      expectedOutput,
    };

    // Step 6: Execute code
    logger.info(`Executing ${detectedLanguage} code for question ${questionId || 'N/A'}`, {
      userId,
      codeLength: code.length,
    });
    const result = await engine.execute(code, options);

    // Compare with expected output if provided
    let matchesExpected: boolean | undefined;
    if (expectedOutput && result.success) {
      matchesExpected = engine.compareResult(result, expectedOutput);
      logger.info(`Result comparison: ${matchesExpected ? 'MATCH' : 'NO MATCH'}`);
    }

    const response = {
      success: result.success,
      result,
      matchesExpected,
      questionId,
      executionTime: result.executionTime,
    };

    // Cache successful execution results (if Redis is available)
    if (isConnected() && result.success) {
      await cacheService.cacheExecutionResult(code, detectedLanguage, response, questionId);
    }

    return response;
  }

  /**
   * Validate code without execution
   */
  async validateCode(code: string, language: string): Promise<boolean> {
    if (!engineRegistry.has(language)) {
      throw new ValidationError(`Language '${language}' is not supported`);
    }

    const engine = engineRegistry.get(language);
    if (!engine) {
      throw new NotFoundError(`Engine for language '${language}' not found`);
    }

    return await engine.validate(code);
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return engineRegistry.getLanguages();
  }

  /**
   * Get engine metadata for a language
   */
  getEngineMetadata(language: string) {
    if (!engineRegistry.has(language)) {
      throw new ValidationError(`Language '${language}' is not supported`);
    }

    const engine = engineRegistry.get(language);
    if (!engine) {
      throw new NotFoundError(`Engine for language '${language}' not found`);
    }

    return engine.getMetadata();
  }
}

export default new ExecutionService();


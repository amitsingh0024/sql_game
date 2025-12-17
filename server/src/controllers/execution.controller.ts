/**
 * Code Execution Controller
 * 
 * Handles HTTP requests for code execution
 */

import { Request, Response, NextFunction } from 'express';
import executionService from '../services/execution.service.js';
import { ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const executionController = {
  /**
   * Execute code
   * POST /api/v1/execute
   */
  async executeCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, language, questionId, input, timeout } = req.body;
      const userId = req.user?.id;

      // Validate required fields
      if (!code || typeof code !== 'string') {
        throw new ValidationError('Code is required and must be a string');
      }

      if (!language || typeof language !== 'string') {
        throw new ValidationError('Language is required and must be a string');
      }

      // Execute code (pass userId for security logging)
      const result = await executionService.executeCode(
        {
          code,
          language,
          questionId,
          input,
          timeout,
        },
        userId
      );

      logger.info(`Code execution completed for user ${userId}, language: ${language}, success: ${result.success}`);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Validate code without execution
   * POST /api/v1/execute/validate
   */
  async validateCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, language } = req.body;

      if (!code || typeof code !== 'string') {
        throw new ValidationError('Code is required and must be a string');
      }

      if (!language || typeof language !== 'string') {
        throw new ValidationError('Language is required and must be a string');
      }

      const isValid = await executionService.validateCode(code, language);

      res.json({
        success: true,
        data: {
          valid: isValid,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get supported languages
   * GET /api/v1/execute/languages
   */
  async getSupportedLanguages(req: Request, res: Response, next: NextFunction) {
    try {
      const languages = executionService.getSupportedLanguages();
      
      // Get metadata for each language
      const languagesWithMetadata = languages.map(lang => {
        try {
          const metadata = executionService.getEngineMetadata(lang);
          return {
            language: lang,
            version: metadata.version,
            maxExecutionTime: metadata.maxExecutionTime,
            maxMemory: metadata.maxMemory,
          };
        } catch {
          return {
            language: lang,
          };
        }
      });

      res.json({
        success: true,
        data: {
          languages: languagesWithMetadata,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};


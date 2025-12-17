/**
 * Code Execution Routes
 * 
 * Routes for code execution endpoints
 */

import { Router } from 'express';
import { executionController } from '../../controllers/execution.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';
import Joi from 'joi';

const router = Router();

// Apply rate limiting
router.use(apiLimiter);

// Validation schemas
const executeCodeSchema = Joi.object({
  code: Joi.string().required().min(1).max(10000).messages({
    'string.empty': 'Code cannot be empty',
    'string.max': 'Code cannot exceed 10000 characters',
  }),
  language: Joi.string().required().valid('SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML').messages({
    'any.only': 'Language must be one of: SQL, JAVA, C++, PYTHON, JAVASCRIPT, AI, ML',
  }),
  questionId: Joi.string().optional(),
  input: Joi.string().optional().max(5000),
  timeout: Joi.number().optional().min(1000).max(60000).messages({
    'number.min': 'Timeout must be at least 1000ms',
    'number.max': 'Timeout cannot exceed 60000ms',
  }),
});

const validateCodeSchema = Joi.object({
  code: Joi.string().required().min(1).max(10000),
  language: Joi.string().required().valid('SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML'),
});

// Public route - Get supported languages
router.get('/languages', executionController.getSupportedLanguages);

// Protected routes (require authentication)
router.use(authenticate);

// Execute code
router.post('/', validate(executeCodeSchema), executionController.executeCode);

// Validate code
router.post('/validate', validate(validateCodeSchema), executionController.validateCode);

export default router;


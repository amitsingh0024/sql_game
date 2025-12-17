import { Router } from 'express';
import { questionController } from '../../controllers/question.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { validateObjectId } from '../../middleware/security.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createQuestionSchema = Joi.object({
  question: Joi.string().min(10).max(1000).required(),
  answer: Joi.string().min(1).max(500).required(),
  questionType: Joi.string()
    .valid('SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML')
    .required(),
  question_level: Joi.string().valid('normal', 'boss').required(),
  isActive: Joi.boolean().optional(),
});

const updateQuestionSchema = Joi.object({
  question: Joi.string().min(10).max(1000).optional(),
  answer: Joi.string().min(1).max(500).optional(),
  questionType: Joi.string()
    .valid('SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML')
    .optional(),
  question_level: Joi.string().valid('normal', 'boss').optional(),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const verifyAnswerSchema = Joi.object({
  answer: Joi.string().required(),
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes (no auth required)
router.get('/', questionController.getQuestions);
router.get('/random', questionController.getRandomQuestions);
router.get('/topic/:topic', questionController.getQuestionsByTopic);
router.get('/:id', validateObjectId('id'), questionController.getQuestionById);

// Protected routes (require authentication)
router.use(authenticate);

// Answer verification (any authenticated user)
router.post('/:id/verify', validateObjectId('id'), validate(verifyAnswerSchema), questionController.verifyAnswer);

// Question creation (any authenticated user)
router.post('/', validate(createQuestionSchema), questionController.createQuestion);

// Admin-only routes
router.put('/:id', requireAdmin, validateObjectId('id'), validate(updateQuestionSchema), questionController.updateQuestion);
router.delete('/:id', requireAdmin, validateObjectId('id'), questionController.deleteQuestion);
router.get('/stats/overview', requireAdmin, questionController.getQuestionStats);

export default router;


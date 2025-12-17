import { Router } from 'express';
import { challengeController } from '../../controllers/challenge.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createChallengeSchema = Joi.object({
  challenge_mode: Joi.string().valid('one_on_one', 'story_mode', 'custom_room').required(),
  challenge_type: Joi.string().valid('daily', 'weekly', 'monthly', 'custom_created').required(),
  challenge_name: Joi.string().min(3).max(100).required(),
  challenge_description: Joi.string().min(10).max(500).required(),
  gametype: Joi.string().valid('SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML').required(),
  challenge_start_date: Joi.date().required(),
  challenge_end_date: Joi.date().required(),
  opponent_id: Joi.string().when('challenge_mode', {
    is: 'one_on_one',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  max_participants: Joi.number().min(2).optional(),
  is_private: Joi.boolean().default(false),
  question_ids: Joi.array().items(Joi.string()).when('challenge_mode', {
    is: 'custom_room',
    then: Joi.optional().min(1),
    otherwise: Joi.optional(),
  }),
  topic: Joi.string()
    .valid('SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML')
    .when('challenge_mode', {
      is: 'custom_room',
      then: Joi.when('question_ids', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
      otherwise: Joi.optional(),
    }),
  number_of_questions: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .when('challenge_mode', {
      is: 'custom_room',
      then: Joi.when('question_ids', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
      otherwise: Joi.optional(),
    }),
  level_id: Joi.number().integer().min(1).max(12).when('challenge_mode', {
    is: 'story_mode',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  mission_index: Joi.number().integer().min(0).optional(),
  allow_hints: Joi.boolean().default(true),
  time_limit_seconds: Joi.number().min(0).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').optional(),
  challenge_reward: Joi.number().min(0).optional(),
}).custom((value, helpers) => {
  if (value.challenge_start_date >= value.challenge_end_date) {
    return helpers.error('any.invalid');
  }

  // For custom_room mode, validate that either question_ids OR (topic AND number_of_questions) is provided
  if (value.challenge_mode === 'custom_room') {
    const hasQuestionIds = value.question_ids && value.question_ids.length > 0;
    const hasTopicAndCount = value.topic && value.number_of_questions;

    if (!hasQuestionIds && !hasTopicAndCount) {
      return helpers.error('custom_room.questions');
    }

    if (hasQuestionIds && hasTopicAndCount) {
      return helpers.error('custom_room.both');
    }
  }

  return value;
}).messages({
  'any.invalid': 'Challenge end date must be after start date',
  'custom_room.questions': 'Custom room requires either question_ids or both topic and number_of_questions',
  'custom_room.both': 'Cannot provide both question_ids and topic/number_of_questions. Choose one method.',
});

const updateProgressSchema = Joi.object({
  questions_completed: Joi.number().integer().min(0).optional(),
  score: Joi.number().min(0).optional(),
  time_spent_seconds: Joi.number().min(0).optional(),
  completed: Joi.boolean().optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'completed', 'pending').required(),
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes (no auth required)
router.get('/', challengeController.getChallenges);
router.get('/:id', challengeController.getChallengeById);
router.get('/room/:roomCode', challengeController.getChallengeByRoomCode);
router.get('/:id/leaderboard', challengeController.getChallengeLeaderboard);

// Protected routes (require authentication)
router.use(authenticate);

// Challenge management
router.post('/', validate(createChallengeSchema), challengeController.createChallenge);
router.post('/:id/enroll', challengeController.enrollInChallenge);
router.post('/:id/leave', challengeController.leaveChallenge);
router.put('/:id/progress', validate(updateProgressSchema), challengeController.updateChallengeProgress);
router.get('/:id/progress', challengeController.getUserChallengeProgress);
router.put('/:id/status', validate(updateStatusSchema), challengeController.updateChallengeStatus);
router.delete('/:id', challengeController.deleteChallenge);

export default router;


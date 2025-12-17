import { Router } from 'express';
import { settingsController } from '../../controllers/settings.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';
import Joi from 'joi';

const router = Router();

// Validation schema
const updateSettingsSchema = Joi.object({
  // Game preferences
  theme: Joi.string().valid('light', 'dark', 'auto').optional(),
  soundEnabled: Joi.boolean().optional(),
  musicEnabled: Joi.boolean().optional(),
  soundVolume: Joi.number().min(0).max(100).optional(),
  musicVolume: Joi.number().min(0).max(100).optional(),
  
  // Display preferences
  language: Joi.string().max(10).optional(),
  timezone: Joi.string().optional(),
  dateFormat: Joi.string().optional(),
  timeFormat: Joi.string().valid('12h', '24h').optional(),
  
  // Notification preferences
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  friendRequestNotifications: Joi.boolean().optional(),
  challengeInviteNotifications: Joi.boolean().optional(),
  achievementNotifications: Joi.boolean().optional(),
  leaderboardNotifications: Joi.boolean().optional(),
  
  // Privacy settings
  profileVisibility: Joi.string().valid('public', 'friends', 'private').optional(),
  showEmail: Joi.boolean().optional(),
  showLevel: Joi.boolean().optional(),
  showXp: Joi.boolean().optional(),
  allowFriendRequests: Joi.boolean().optional(),
  
  // Gameplay preferences
  defaultDifficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').optional(),
  autoSaveProgress: Joi.boolean().optional(),
  showHints: Joi.boolean().optional(),
  showTutorials: Joi.boolean().optional(),
  
  // Challenge preferences
  autoAcceptChallenges: Joi.boolean().optional(),
  challengeReminderEnabled: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one setting field must be provided',
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// All routes require authentication
router.use(authenticate);

// Settings routes
router.get('/', settingsController.getSettings);
router.put('/', validate(updateSettingsSchema), settingsController.updateSettings);
router.post('/reset', settingsController.resetSettings);

export default router;


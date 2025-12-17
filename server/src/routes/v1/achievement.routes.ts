import { Router } from 'express';
import { achievementController } from '../../controllers/achievement.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

// Apply rate limiting
router.use(apiLimiter);

// All routes require authentication
router.use(authenticate);

// Achievement routes
router.get('/', achievementController.getUserAchievements);
router.get('/list', achievementController.getAllAchievements);
router.get('/:id', achievementController.getAchievementById);
router.post('/unlock', achievementController.unlockAchievement);

export default router;


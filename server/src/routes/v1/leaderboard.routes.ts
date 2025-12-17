import { Router } from 'express';
import { leaderboardController } from '../../controllers/leaderboard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

// Apply rate limiting
router.use(apiLimiter);

// Public routes
router.get('/', leaderboardController.getGlobalLeaderboard);
router.get('/level/:levelId', leaderboardController.getLevelLeaderboard);
router.get('/user/:userId', leaderboardController.getUserRank);

// Protected routes (system updates)
router.use(authenticate);
router.post('/update', leaderboardController.updateLeaderboard);

export default router;


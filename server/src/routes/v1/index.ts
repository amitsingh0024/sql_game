import { Router } from 'express';
import authRoutes from './auth.routes.js';
import progressRoutes from './progress.routes.js';
import userRoutes from './user.routes.js';
import challengeRoutes from './challenge.routes.js';
import questionRoutes from './question.routes.js';
import settingsRoutes from './settings.routes.js';
import achievementRoutes from './achievement.routes.js';
import gameConfigRoutes from './game-config.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';
import analyticsRoutes from './analytics.routes.js';
import privacyRoutes from './privacy.routes.js';
import executionRoutes from './execution.routes.js';

const router = Router();

// API v1 routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/progress', progressRoutes);
router.use('/challenges', challengeRoutes);
router.use('/questions', questionRoutes);
router.use('/settings', settingsRoutes);
router.use('/achievements', achievementRoutes);
router.use('/game-config', gameConfigRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/privacy', privacyRoutes);
router.use('/execute', executionRoutes);

export default router;


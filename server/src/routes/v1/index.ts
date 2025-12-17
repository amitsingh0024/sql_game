import { Router } from 'express';
import authRoutes from './auth.routes.js';
import progressRoutes from './progress.routes.js';
import userRoutes from './user.routes.js';
import challengeRoutes from './challenge.routes.js';
import questionRoutes from './question.routes.js';

const router = Router();

// API v1 routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/progress', progressRoutes);
router.use('/challenges', challengeRoutes);
router.use('/questions', questionRoutes);
// router.use('/settings', settingsRoutes);
// router.use('/notifications', notificationsRoutes);
// router.use('/friends', friendsRoutes);
// router.use('/messages', messagesRoutes);

export default router;


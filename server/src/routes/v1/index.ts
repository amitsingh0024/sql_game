import { Router } from 'express';
import authRoutes from './auth.routes.js';
import progressRoutes from './progress.routes.js';

const router = Router();

// API v1 routes
router.use('/auth', authRoutes);
router.use('/progress', progressRoutes);

export default router;


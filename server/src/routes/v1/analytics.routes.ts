import { Router } from 'express';
import { analyticsController } from '../../controllers/analytics.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

// Apply rate limiting
router.use(apiLimiter);

// Protected routes (require authentication)
router.use(authenticate);

// Analytics routes
router.post('/event', analyticsController.logEvent);
router.get('/events', analyticsController.getUserEvents);
router.get('/events/:eventType', analyticsController.getEventsByType);

// Admin-only routes
router.get('/stats', requireAdmin, analyticsController.getAnalyticsStats);

export default router;


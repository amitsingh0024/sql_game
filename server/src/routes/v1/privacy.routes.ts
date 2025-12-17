import { Router } from 'express';
import { privacyController } from '../../controllers/privacy.controller.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

// Apply rate limiting (lighter for public content)
const publicLimiter = apiLimiter;

router.use(publicLimiter);

// Public routes - no authentication required
router.get('/policy', privacyController.getPrivacyPolicy);
router.get('/terms', privacyController.getTermsOfService);

export default router;


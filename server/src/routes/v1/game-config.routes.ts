import { Router } from 'express';
import { gameConfigController } from '../../controllers/game-config.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

// Apply rate limiting
router.use(apiLimiter);

// Public routes
router.get('/', gameConfigController.getGameConfigs);
router.get('/:gametype', gameConfigController.getGameConfigByType);

// Admin-only routes
router.use(authenticate);
router.use(requireAdmin);
router.post('/', gameConfigController.createGameConfig);
router.put('/:id', gameConfigController.updateGameConfig);
router.delete('/:id', gameConfigController.deleteGameConfig);

export default router;


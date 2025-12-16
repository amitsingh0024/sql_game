import { Router } from 'express';
import { progressController } from '../../controllers/progress.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import Joi from 'joi';

const router = Router();

const completeMissionSchema = Joi.object({
  levelId: Joi.number().integer().min(1).max(12).required(),
  missionIndex: Joi.number().integer().min(0).required(),
  xpEarned: Joi.number().integer().min(0).required(),
  stabilityEarned: Joi.number().integer().min(0).max(100).required(),
  isReplay: Joi.boolean().default(false),
});

const updateStatsSchema = Joi.object({
  xp: Joi.number().integer().min(0).optional(),
  stability: Joi.object().pattern(Joi.number(), Joi.number().min(0).max(100)).optional(),
  missionsCompleted: Joi.number().integer().min(0).optional(),
  levelsCompleted: Joi.number().integer().min(0).optional(),
  playtimeSeconds: Joi.number().integer().min(0).optional(),
});

// All routes require authentication
router.use(authenticate);

router.get('/', progressController.getUserProgress);
router.get('/level/:levelId', progressController.getLevelProgress);
router.post('/mission/complete', validate(completeMissionSchema), progressController.completeMission);
router.put('/stats', validate(updateStatsSchema), progressController.updateStats);
router.get('/stats', progressController.getUserStats);
router.post('/sync', progressController.syncProgress);

export default router;


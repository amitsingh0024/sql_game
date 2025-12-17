import { Router } from 'express';
import { authController } from '../../controllers/auth.controller.js';
import { validate } from '../../middleware/validation.middleware.js';
import { authLimiter } from '../../middleware/rateLimit.middleware.js';
import Joi from 'joi';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.get('/me', authenticate, authController.getMe);

export default router;


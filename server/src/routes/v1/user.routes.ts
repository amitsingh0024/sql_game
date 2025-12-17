import { Router } from 'express';
import { userController } from '../../controllers/user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';
import Joi from 'joi';

const router = Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
}).min(1).messages({
  'object.min': 'At least one field (username or email) must be provided',
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes (no auth required) - must come before parameterized routes
router.get('/search', userController.searchUsers);

// Protected routes (require authentication)
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.put('/password', validate(changePasswordSchema), userController.changePassword);

// Challenges routes
router.get('/challenges/list', userController.getUserChallenges);

// Friends routes
router.get('/friends/list', userController.getFriends);
router.delete('/friends/:id', userController.removeFriend);

// Friend Request routes
router.post('/friends/request/:id', userController.sendFriendRequest);
router.get('/friends/requests', userController.getFriendRequests);
router.post('/friends/requests/:id/accept', userController.acceptFriendRequest);
router.post('/friends/requests/:id/reject', userController.rejectFriendRequest);
router.delete('/friends/requests/:id', userController.cancelFriendRequest);

// Public profile route (must be last to avoid conflicts with other routes)
router.get('/:id', userController.getPublicProfile);

export default router;


import { Response, NextFunction } from 'express';
import userService from '../services/user.service.js';
import { AuthRequest } from '../types/index.js';

export const userController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const user = await userService.getUserProfile(req.user.id);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async getPublicProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getPublicUserProfile(id);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { username, email } = req.body;
      const user = await userService.updateProfile(req.user.id, { username, email });

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(req.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserChallenges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const challenges = await userService.getUserChallenges(req.user.id);

      res.json({
        success: true,
        data: { challenges },
      });
    } catch (error) {
      next(error);
    }
  },

  async getFriends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const friends = await userService.getFriends(req.user.id);

      res.json({
        success: true,
        data: { friends },
      });
    } catch (error) {
      next(error);
    }
  },

  async sendFriendRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: toUserId } = req.params;
      const request = await userService.sendFriendRequest(req.user.id, toUserId);

      res.status(201).json({
        success: true,
        data: { friendRequest: request },
      });
    } catch (error) {
      next(error);
    }
  },

  async getFriendRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const type = (req.query.type as 'sent' | 'received') || 'received';
      const requests = await userService.getFriendRequests(req.user.id, type);

      res.json({
        success: true,
        data: { friendRequests: requests },
      });
    } catch (error) {
      next(error);
    }
  },

  async acceptFriendRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: requestId } = req.params;
      const result = await userService.acceptFriendRequest(req.user.id, requestId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async rejectFriendRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: requestId } = req.params;
      const result = await userService.rejectFriendRequest(req.user.id, requestId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelFriendRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: requestId } = req.params;
      const result = await userService.cancelFriendRequest(req.user.id, requestId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async removeFriend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: friendId } = req.params;
      const result = await userService.removeFriend(req.user.id, friendId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async searchUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: { message: 'Search query is required', statusCode: 400 },
        });
      }

      const users = await userService.searchUsers(q, limit);

      res.json({
        success: true,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  },
};


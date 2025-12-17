import { Response, NextFunction } from 'express';
import settingsService from '../services/settings.service.js';
import { AuthRequest } from '../types/index.js';

export const settingsController = {
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const settings = await settingsService.getSettings(req.user.id);

      res.json({
        success: true,
        data: { settings },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const settings = await settingsService.updateSettings(req.user.id, req.body);

      res.json({
        success: true,
        data: { settings },
      });
    } catch (error) {
      next(error);
    }
  },

  async resetSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const settings = await settingsService.resetSettings(req.user.id);

      res.json({
        success: true,
        data: { settings },
      });
    } catch (error) {
      next(error);
    }
  },
};


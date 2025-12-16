import { Response, NextFunction } from 'express';
import progressService from '../services/progress.service.js';
import { AuthRequest } from '../types/index.js';

export const progressController = {
  async getUserProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const progress = await progressService.getUserProgress(userId);

      res.json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  },

  async getLevelProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const levelId = parseInt(req.params.levelId);

      const progress = await progressService.getLevelProgress(userId, levelId);

      res.json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  },

  async completeMission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { levelId, missionIndex, xpEarned, stabilityEarned, isReplay } = req.body;

      const progress = await progressService.completeMission(
        userId,
        levelId,
        missionIndex,
        xpEarned,
        stabilityEarned,
        isReplay
      );

      res.json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await progressService.updateStats(userId, req.body);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await progressService.getUserStats(userId);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  },

  async syncProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await progressService.syncProgress(userId, req.body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};


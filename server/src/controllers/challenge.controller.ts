import { Response, NextFunction } from 'express';
import challengeService from '../services/challenge.service.js';
import { AuthRequest } from '../types/index.js';

export const challengeController = {
  async createChallenge(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const challenge = await challengeService.createChallenge(req.user.id, req.body);

      res.status(201).json({
        success: true,
        data: { challenge },
      });
    } catch (error) {
      next(error);
    }
  },

  async getChallenges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        challenge_mode: req.query.challenge_mode as string,
        challenge_type: req.query.challenge_type as string,
        gametype: req.query.gametype as string,
        challenge_status: req.query.challenge_status as string,
        is_private: req.query.is_private === 'true' ? true : req.query.is_private === 'false' ? false : undefined,
        limit: parseInt(req.query.limit as string) || 50,
        skip: parseInt(req.query.skip as string) || 0,
      };

      const challenges = await challengeService.getChallenges(filters);

      res.json({
        success: true,
        data: { challenges },
      });
    } catch (error) {
      next(error);
    }
  },

  async getChallengeById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challenge = await challengeService.getChallengeById(id);

      res.json({
        success: true,
        data: { challenge },
      });
    } catch (error) {
      next(error);
    }
  },

  async getChallengeByRoomCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomCode } = req.params;
      const challenge = await challengeService.getChallengeByRoomCode(roomCode);

      res.json({
        success: true,
        data: { challenge },
      });
    } catch (error) {
      next(error);
    }
  },

  async enrollInChallenge(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: challengeId } = req.params;
      const challenge = await challengeService.enrollInChallenge(req.user.id, challengeId);

      res.status(201).json({
        success: true,
        data: { challenge },
      });
    } catch (error) {
      next(error);
    }
  },

  async leaveChallenge(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: challengeId } = req.params;
      const result = await challengeService.leaveChallenge(req.user.id, challengeId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateChallengeProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: challengeId } = req.params;
      const progress = await challengeService.updateChallengeProgress(
        req.user.id,
        challengeId,
        req.body
      );

      res.json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  },

  async getChallengeLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: challengeId } = req.params;
      const leaderboard = await challengeService.getChallengeLeaderboard(challengeId);

      res.json({
        success: true,
        data: { leaderboard },
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserChallengeProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: challengeId } = req.params;
      const progress = await challengeService.getUserChallengeProgress(req.user.id, challengeId);

      res.json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateChallengeStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: challengeId } = req.params;
      const { status } = req.body;
      const challenge = await challengeService.updateChallengeStatus(
        req.user.id,
        challengeId,
        status
      );

      res.json({
        success: true,
        data: { challenge },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteChallenge(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id: challengeId } = req.params;
      const result = await challengeService.deleteChallenge(req.user.id, challengeId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};


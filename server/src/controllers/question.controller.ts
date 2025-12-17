import { Response, NextFunction } from 'express';
import questionService from '../services/question.service.js';
import { AuthRequest } from '../types/index.js';

export const questionController = {
  async createQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      // Any authenticated user can create questions
      // The creator's ID will be automatically saved
      const question = await questionService.createQuestion(req.body, req.user.id);

      res.status(201).json({
        success: true,
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  },

  async getQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        questionType: req.query.questionType as string,
        question_level: req.query.question_level as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        limit: parseInt(req.query.limit as string) || 50,
        skip: parseInt(req.query.skip as string) || 0,
        includeAnswer: req.user?.isAdmin || false, // Only admins see answers by default
      };

      const questions = await questionService.getQuestions(filters);

      res.json({
        success: true,
        data: { questions },
      });
    } catch (error) {
      next(error);
    }
  },

  async getQuestionById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const includeAnswer = req.user?.isAdmin || false;
      const question = await questionService.getQuestionById(id, includeAnswer);

      res.json({
        success: true,
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  },

  async getRandomQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = parseInt(req.query.count as string) || 1;
      const filters = {
        questionType: req.query.questionType as string,
        question_level: req.query.question_level as string,
        excludeIds: req.query.excludeIds
          ? (req.query.excludeIds as string).split(',')
          : undefined,
      };

      const questions = await questionService.getRandomQuestions(count, filters);

      res.json({
        success: true,
        data: { questions },
      });
    } catch (error) {
      next(error);
    }
  },

  async getQuestionsByTopic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { topic } = req.params;
      const count = parseInt(req.query.count as string) || 10;
      const excludeIds = req.query.excludeIds
        ? (req.query.excludeIds as string).split(',')
        : undefined;

      if (!topic) {
        return res.status(400).json({
          success: false,
          error: { message: 'Topic is required', statusCode: 400 },
        });
      }

      const validTopics = ['SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML'];
      if (!validTopics.includes(topic)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid topic', statusCode: 400 },
        });
      }

      const questions = await questionService.getQuestionsByTopic(topic, count, excludeIds);

      res.json({
        success: true,
        data: { questions, count: questions.length },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      // Only admins can update questions
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: { message: 'Admin access required', statusCode: 403 },
        });
      }

      const { id } = req.params;
      const question = await questionService.updateQuestion(id, req.body);

      res.json({
        success: true,
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      // Only admins can delete questions
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: { message: 'Admin access required', statusCode: 403 },
        });
      }

      const { id } = req.params;
      const result = await questionService.deleteQuestion(id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      const { id } = req.params;
      const { answer } = req.body;

      if (!answer) {
        return res.status(400).json({
          success: false,
          error: { message: 'Answer is required', statusCode: 400 },
        });
      }

      const result = await questionService.verifyAnswer(id, answer);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getQuestionStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', statusCode: 401 },
        });
      }

      // Only admins can view stats
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: { message: 'Admin access required', statusCode: 403 },
        });
      }

      const stats = await questionService.getQuestionStats();

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  },
};


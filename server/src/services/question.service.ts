import { Questions } from '../models/Questions.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import { validateAndConvertObjectId, validateObjectIdArray } from '../utils/validation.js';
import logger from '../utils/logger.js';
import { Types } from 'mongoose';

export class QuestionService {
  async createQuestion(
    questionData: {
      question: string;
      answer: string;
      questionType: 'SQL' | 'JAVA' | 'C++' | 'PYTHON' | 'JAVASCRIPT' | 'AI' | 'ML';
      question_level: 'normal' | 'boss';
      isActive?: boolean;
    },
    createdBy: string
  ) {
    const validUserId = validateAndConvertObjectId(createdBy, 'createdBy');

    const question = await Questions.create({
      question: questionData.question,
      answer: questionData.answer,
      questionType: questionData.questionType,
      question_level: questionData.question_level,
      isActive: questionData.isActive !== undefined ? questionData.isActive : true,
      created_by: validUserId,
    });

    logger.info(`Question created: ${question._id} (${question.questionType}) by user ${createdBy}`);

    return {
      id: question._id.toString(),
      question: question.question,
      answer: question.answer,
      questionType: question.questionType,
      question_level: question.question_level,
      isActive: question.isActive,
      created_by: question.created_by.toString(),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  async getQuestions(filters: {
    questionType?: string;
    question_level?: string;
    isActive?: boolean;
    limit?: number;
    skip?: number;
    includeAnswer?: boolean;
  }) {
    const query: any = {};

    if (filters.questionType) {
      query.questionType = filters.questionType;
    }
    if (filters.question_level) {
      query.question_level = filters.question_level;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const questions = await Questions.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.skip || 0);

    return questions.map(question => ({
      id: question._id.toString(),
      question: question.question,
      answer: filters.includeAnswer ? question.answer : undefined,
      questionType: question.questionType,
      question_level: question.question_level,
      isActive: question.isActive,
      created_by: question.created_by?.toString(),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    }));
  }

  async getQuestionById(questionId: string, includeAnswer: boolean = false) {
    const validId = validateAndConvertObjectId(questionId, 'questionId');
    const question = await Questions.findById(validId);

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    return {
      id: question._id.toString(),
      question: question.question,
      answer: includeAnswer ? question.answer : undefined,
      questionType: question.questionType,
      question_level: question.question_level,
      isActive: question.isActive,
      created_by: question.created_by?.toString(),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  async getRandomQuestions(
    count: number = 1,
    filters: {
      questionType?: string;
      question_level?: string;
      excludeIds?: string[];
    } = {}
  ) {
    const query: any = { isActive: true };

    if (filters.questionType) {
      query.questionType = filters.questionType;
    }
    if (filters.question_level) {
      query.question_level = filters.question_level;
    }
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      query._id = { $nin: filters.excludeIds };
    }

    // Get random questions
    const questions = await Questions.aggregate([
      { $match: query },
      { $sample: { size: count } },
    ]);

    return questions.map((question: any) => ({
      id: question._id.toString(),
      question: question.question,
      questionType: question.questionType,
      question_level: question.question_level,
      isActive: question.isActive,
      created_by: question.created_by ? question.created_by.toString() : undefined,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    }));
  }

  /**
   * Get questions sorted from easy to hard (normal first, then boss)
   * For custom challenge room creation
   */
  async getQuestionsByTopic(
    questionType: string,
    count: number,
    excludeIds?: string[]
  ) {
    const query: any = {
      isActive: true,
      questionType: questionType,
    };

    if (excludeIds && excludeIds.length > 0) {
      // Validate all exclude IDs
      const validExcludeIds = validateObjectIdArray(excludeIds, 'excludeIds');
      query._id = { $nin: validExcludeIds };
    }

    // Get questions sorted by difficulty: normal (easy) first, then boss (hard)
    // Within each level, sort by creation date (newer first)
    const questions = await Questions.find(query)
      .sort({
        question_level: 1, // 'normal' comes before 'boss' alphabetically
        createdAt: -1, // Newer questions first within same level
      })
      .limit(count);

    return questions.map(question => ({
      id: question._id.toString(),
      question: question.question,
      answer: question.answer,
      questionType: question.questionType,
      question_level: question.question_level,
      isActive: question.isActive,
      created_by: question.created_by?.toString(),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    }));
  }

  async updateQuestion(
    questionId: string,
    updates: {
      question?: string;
      answer?: string;
      questionType?: string;
      question_level?: string;
      isActive?: boolean;
    }
  ) {
    const validId = validateAndConvertObjectId(questionId, 'questionId');
    const question = await Questions.findById(validId);

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    if (updates.question !== undefined) {
      question.question = updates.question;
    }
    if (updates.answer !== undefined) {
      question.answer = updates.answer;
    }
    if (updates.questionType !== undefined) {
      question.questionType = updates.questionType as any;
    }
    if (updates.question_level !== undefined) {
      question.question_level = updates.question_level as any;
    }
    if (updates.isActive !== undefined) {
      question.isActive = updates.isActive;
    }

    await question.save();

    logger.info(`Question updated: ${question._id}`);

    return {
      id: question._id.toString(),
      question: question.question,
      answer: question.answer,
      questionType: question.questionType,
      question_level: question.question_level,
      isActive: question.isActive,
      created_by: question.created_by?.toString(),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  async deleteQuestion(questionId: string) {
    const validId = validateAndConvertObjectId(questionId, 'questionId');
    const question = await Questions.findById(validId);

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    // Check if question is used in any active challenges
    const { Challenges } = await import('../models/Challenges.js');
    const challengesUsingQuestion = await Challenges.find({
      question_ids: validId,
      challenge_status: { $in: ['active', 'pending'] },
    });

    if (challengesUsingQuestion.length > 0) {
      throw new ValidationError(
        'Cannot delete question that is used in active or pending challenges'
      );
    }

    await Questions.findByIdAndDelete(validId);

    logger.info(`Question deleted: ${questionId}`);

    return { message: 'Question deleted successfully' };
  }

  async verifyAnswer(questionId: string, userAnswer: string): Promise<{
    correct: boolean;
    expectedAnswer?: string;
  }> {
    const validId = validateAndConvertObjectId(questionId, 'questionId');
    const question = await Questions.findById(validId);

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    // Normalize answers for comparison (trim, lowercase, remove extra spaces)
    const normalize = (str: string) =>
      str.trim().toLowerCase().replace(/\s+/g, ' ');

    const isCorrect = normalize(question.answer) === normalize(userAnswer);

    return {
      correct: isCorrect,
      expectedAnswer: isCorrect ? undefined : question.answer, // Only show answer if wrong
    };
  }

  async getQuestionStats() {
    const stats = await Questions.aggregate([
      {
        $group: {
          _id: {
            questionType: '$questionType',
            question_level: '$question_level',
            isActive: '$isActive',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.questionType',
          levels: {
            $push: {
              level: '$_id.question_level',
              isActive: '$_id.isActive',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
    ]);

    return stats.map((stat: any) => ({
      questionType: stat._id,
      total: stat.total,
      levels: stat.levels,
    }));
  }
}

export default new QuestionService();


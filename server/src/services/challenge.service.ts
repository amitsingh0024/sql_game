import { Challenges } from '../models/Challenges.js';
import { User } from '../models/User.js';
import { Questions } from '../models/Questions.js';
import { NotFoundError, ConflictError, ForbiddenError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { Types } from 'mongoose';

export class ChallengeService {
  async createChallenge(userId: string, challengeData: {
    challenge_mode: 'one_on_one' | 'story_mode' | 'custom_room';
    challenge_type: 'daily' | 'weekly' | 'monthly' | 'custom_created';
    challenge_name: string;
    challenge_description: string;
    gametype: 'SQL' | 'JAVA' | 'C++' | 'PYTHON' | 'JAVASCRIPT' | 'AI' | 'ML';
    challenge_start_date: Date;
    challenge_end_date: Date;
    opponent_id?: string;
    max_participants?: number;
    is_private?: boolean;
    question_ids?: string[]; // Optional: user can provide specific questions
    topic?: string; // Optional: for auto-selecting questions by topic
    number_of_questions?: number; // Optional: number of questions to auto-select
    level_id?: number;
    mission_index?: number;
    allow_hints?: boolean;
    time_limit_seconds?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    challenge_reward?: number;
  }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate challenge mode specific requirements
    if (challengeData.challenge_mode === 'one_on_one') {
      if (!challengeData.opponent_id) {
        throw new ValidationError('One-on-one challenges require an opponent_id');
      }
      const opponent = await User.findById(challengeData.opponent_id);
      if (!opponent) {
        throw new NotFoundError('Opponent not found');
      }
      if (opponent._id.toString() === userId) {
        throw new ValidationError('Cannot create one-on-one challenge with yourself');
      }
    }

    if (challengeData.challenge_mode === 'custom_room') {
      let finalQuestionIds: string[] = [];

      // Option 1: User provides specific question_ids
      if (challengeData.question_ids && challengeData.question_ids.length > 0) {
        // Validate questions exist
        const questions = await Questions.find({ _id: { $in: challengeData.question_ids } });
        if (questions.length !== challengeData.question_ids.length) {
          throw new NotFoundError('Some questions not found');
        }
        finalQuestionIds = challengeData.question_ids;
      }
      // Option 2: Auto-select questions by topic and count
      else if (challengeData.topic && challengeData.number_of_questions) {
        const { default: questionService } = await import('./question.service.js');
        const selectedQuestions = await questionService.getQuestionsByTopic(
          challengeData.topic,
          challengeData.number_of_questions
        );

        if (selectedQuestions.length === 0) {
          throw new NotFoundError(`No active questions found for topic: ${challengeData.topic}`);
        }

        if (selectedQuestions.length < challengeData.number_of_questions) {
          logger.warn(
            `Requested ${challengeData.number_of_questions} questions but only ${selectedQuestions.length} available for topic ${challengeData.topic}`
          );
        }

        finalQuestionIds = selectedQuestions.map(q => q.id);
      } else {
        throw new ValidationError(
          'Custom room challenges require either question_ids or both topic and number_of_questions'
        );
      }

      // Update challengeData with final question IDs
      challengeData.question_ids = finalQuestionIds;
    }

    if (challengeData.challenge_mode === 'story_mode') {
      if (!challengeData.level_id) {
        throw new ValidationError('Story mode challenges require a level_id');
      }
    }

    // Validate dates
    if (challengeData.challenge_start_date >= challengeData.challenge_end_date) {
      throw new ValidationError('Challenge end date must be after start date');
    }

    const challenge = await Challenges.create({
      ...challengeData,
      created_by: user._id,
      enrolled_users: challengeData.challenge_mode === 'one_on_one' 
        ? [user._id, new Types.ObjectId(challengeData.opponent_id!)]
        : [user._id],
      question_ids: challengeData.question_ids?.map(id => new Types.ObjectId(id)),
      opponent_id: challengeData.opponent_id ? new Types.ObjectId(challengeData.opponent_id) : undefined,
      challenge_status: 'pending',
    });

    // Add challenge to user's challenges_id
    user.challenges_id.push(challenge._id);
    await user.save();

    // Add to opponent's challenges_id if one_on_one
    if (challengeData.challenge_mode === 'one_on_one' && challengeData.opponent_id) {
      const opponent = await User.findById(challengeData.opponent_id);
      if (opponent) {
        opponent.challenges_id.push(challenge._id);
        await opponent.save();
      }
    }

    logger.info(`Challenge created: ${challenge.challenge_name} by ${user.username}`);

    return this.formatChallenge(challenge);
  }

  async getChallenges(filters: {
    challenge_mode?: string;
    challenge_type?: string;
    gametype?: string;
    challenge_status?: string;
    is_private?: boolean;
    limit?: number;
    skip?: number;
  }) {
    const query: any = {};

    if (filters.challenge_mode) {
      query.challenge_mode = filters.challenge_mode;
    }
    if (filters.challenge_type) {
      query.challenge_type = filters.challenge_type;
    }
    if (filters.gametype) {
      query.gametype = filters.gametype;
    }
    if (filters.challenge_status) {
      query.challenge_status = filters.challenge_status;
    }
    if (filters.is_private !== undefined) {
      query.is_private = filters.is_private;
    }

    const challenges = await Challenges.find(query)
      .populate('created_by', 'username level xp')
      .populate('enrolled_users', 'username level xp')
      .populate('opponent_id', 'username level xp')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.skip || 0);

    return challenges.map(challenge => this.formatChallenge(challenge));
  }

  async getChallengeById(challengeId: string) {
    const challenge = await Challenges.findById(challengeId)
      .populate('created_by', 'username level xp')
      .populate('enrolled_users', 'username level xp')
      .populate('opponent_id', 'username level xp')
      .populate('question_ids', 'question questionType question_level');

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    return this.formatChallenge(challenge);
  }

  async getChallengeByRoomCode(roomCode: string) {
    const challenge = await Challenges.findOne({ room_code: roomCode })
      .populate('created_by', 'username level xp')
      .populate('enrolled_users', 'username level xp')
      .populate('question_ids', 'question questionType question_level');

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    return this.formatChallenge(challenge);
  }

  async enrollInChallenge(userId: string, challengeId: string) {
    const user = await User.findById(userId);
    const challenge = await Challenges.findById(challengeId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    // Check if already enrolled
    if (challenge.enrolled_users.some(id => id.toString() === userId)) {
      throw new ConflictError('Already enrolled in this challenge');
    }

    // Check if challenge is active
    if (challenge.challenge_status !== 'active' && challenge.challenge_status !== 'pending') {
      throw new ConflictError('Challenge is not accepting enrollments');
    }

    // Check if challenge has ended
    if (new Date() > challenge.challenge_end_date) {
      throw new ConflictError('Challenge has ended');
    }

    // Check max participants for custom_room
    if (challenge.challenge_mode === 'custom_room' && challenge.max_participants) {
      if (challenge.enrolled_users.length >= challenge.max_participants) {
        throw new ConflictError('Challenge is full');
      }
    }

    // Check one_on_one limit
    if (challenge.challenge_mode === 'one_on_one') {
      if (challenge.enrolled_users.length >= 2) {
        throw new ConflictError('One-on-one challenge is full');
      }
    }

    // Add user to challenge
    challenge.enrolled_users.push(user._id);
    await challenge.save();

    // Add challenge to user's challenges_id
    if (!user.challenges_id) {
      user.challenges_id = [];
    }
    user.challenges_id.push(challenge._id);
    await user.save();

    // Initialize user progress
    if (!challenge.user_progress) {
      challenge.user_progress = new Map();
    }
    const userProgressMap = challenge.user_progress as Map<string, any>;
    userProgressMap.set(userId, {
      userId: user._id,
      progress: 0,
      questions_completed: 0,
      total_questions: challenge.question_ids?.length || 0,
      score: 0,
      time_spent_seconds: 0,
      started_at: new Date(),
    });
    challenge.user_progress = userProgressMap;
    await challenge.save();

    logger.info(`User ${user.username} enrolled in challenge: ${challenge.challenge_name}`);

    return this.formatChallenge(challenge);
  }

  async leaveChallenge(userId: string, challengeId: string) {
    const user = await User.findById(userId);
    const challenge = await Challenges.findById(challengeId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    // Check if enrolled
    if (!challenge.enrolled_users.some(id => id.toString() === userId)) {
      throw new NotFoundError('Not enrolled in this challenge');
    }

    // Cannot leave if challenge is completed
    if (challenge.challenge_completed) {
      throw new ConflictError('Cannot leave a completed challenge');
    }

    // Remove user from challenge
    challenge.enrolled_users = challenge.enrolled_users.filter(
      id => id.toString() !== userId
    );
    await challenge.save();

    // Remove challenge from user's challenges_id
    if (user.challenges_id) {
      user.challenges_id = user.challenges_id.filter(
        id => id.toString() !== challengeId
      );
      await user.save();
    }

    // Remove user progress
    if (challenge.user_progress) {
      const userProgressMap = challenge.user_progress as Map<string, any>;
      userProgressMap.delete(userId);
      challenge.user_progress = userProgressMap;
      await challenge.save();
    }

    logger.info(`User ${user.username} left challenge: ${challenge.challenge_name}`);

    return { message: 'Left challenge successfully' };
  }

  async updateChallengeProgress(
    userId: string,
    challengeId: string,
    progress: {
      questions_completed?: number;
      score?: number;
      time_spent_seconds?: number;
      completed?: boolean;
    }
  ) {
    const user = await User.findById(userId);
    const challenge = await Challenges.findById(challengeId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    // Check if enrolled
    if (!challenge.enrolled_users.some(id => id.toString() === userId)) {
      throw new ForbiddenError('Not enrolled in this challenge');
    }

    // Get or create user progress
    if (!challenge.user_progress) {
      challenge.user_progress = new Map();
    }
    const userProgressMap = challenge.user_progress as Map<string, any>;
    const currentProgress = userProgressMap.get(userId) || {
      userId: user._id,
      progress: 0,
      questions_completed: 0,
      total_questions: challenge.question_ids?.length || 0,
      score: 0,
      time_spent_seconds: 0,
      started_at: new Date(),
    };

    // Update progress
    if (progress.questions_completed !== undefined) {
      currentProgress.questions_completed = progress.questions_completed;
    }
    if (progress.score !== undefined) {
      currentProgress.score = progress.score;
    }
    if (progress.time_spent_seconds !== undefined) {
      currentProgress.time_spent_seconds = progress.time_spent_seconds;
    }
    if (progress.completed) {
      currentProgress.completed_at = new Date();
      currentProgress.progress = 100;
    } else {
      // Calculate progress percentage
      const totalQuestions = currentProgress.total_questions || challenge.question_ids?.length || 1;
      currentProgress.progress = Math.min(
        100,
        Math.round((currentProgress.questions_completed / totalQuestions) * 100)
      );
    }

    userProgressMap.set(userId, currentProgress);
    challenge.user_progress = userProgressMap;

    // Update overall challenge progress
    const allProgress = Array.from(userProgressMap.values());
    if (allProgress.length > 0) {
      challenge.challenge_progress = Math.round(
        allProgress.reduce((sum, p) => sum + p.progress, 0) / allProgress.length
      );
    }

    // Check if challenge is completed
    if (allProgress.every(p => p.progress === 100)) {
      challenge.challenge_completed = true;
      challenge.challenge_completed_at = new Date();
      challenge.challenge_status = 'completed';
    }

    await challenge.save();

    return {
      progress: currentProgress.progress,
      questions_completed: currentProgress.questions_completed,
      score: currentProgress.score,
      time_spent_seconds: currentProgress.time_spent_seconds,
    };
  }

  async getChallengeLeaderboard(challengeId: string) {
    const challenge = await Challenges.findById(challengeId)
      .populate('enrolled_users', 'username level xp');

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    if (!challenge.user_progress) {
      return [];
    }

    const userProgressMap = challenge.user_progress as Map<string, any>;
    const leaderboard = Array.from(userProgressMap.entries())
      .map(([userId, progress]) => {
        const user = challenge.enrolled_users.find(
          (u: any) => u._id.toString() === userId
        ) as any;

        return {
          userId,
          username: user?.username || 'Unknown',
          level: user?.level || 0,
          progress: progress.progress || 0,
          questions_completed: progress.questions_completed || 0,
          score: progress.score || 0,
          time_spent_seconds: progress.time_spent_seconds || 0,
          completed_at: progress.completed_at,
        };
      })
      .sort((a, b) => {
        // Sort by: completed first, then by score, then by time
        if (a.progress === 100 && b.progress !== 100) return -1;
        if (a.progress !== 100 && b.progress === 100) return 1;
        if (b.score !== a.score) return b.score - a.score;
        return a.time_spent_seconds - b.time_spent_seconds;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return leaderboard;
  }

  async getUserChallengeProgress(userId: string, challengeId: string) {
    const challenge = await Challenges.findById(challengeId);

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    // Check if enrolled
    if (!challenge.enrolled_users.some(id => id.toString() === userId)) {
      throw new ForbiddenError('Not enrolled in this challenge');
    }

    if (!challenge.user_progress) {
      return {
        progress: 0,
        questions_completed: 0,
        total_questions: challenge.question_ids?.length || 0,
        score: 0,
        time_spent_seconds: 0,
      };
    }

    const userProgressMap = challenge.user_progress as Map<string, any>;
    const progress = userProgressMap.get(userId);

    if (!progress) {
      return {
        progress: 0,
        questions_completed: 0,
        total_questions: challenge.question_ids?.length || 0,
        score: 0,
        time_spent_seconds: 0,
      };
    }

    return {
      progress: progress.progress || 0,
      questions_completed: progress.questions_completed || 0,
      total_questions: progress.total_questions || challenge.question_ids?.length || 0,
      score: progress.score || 0,
      time_spent_seconds: progress.time_spent_seconds || 0,
      started_at: progress.started_at,
      completed_at: progress.completed_at,
    };
  }

  async updateChallengeStatus(userId: string, challengeId: string, status: 'active' | 'inactive' | 'completed' | 'pending') {
    const challenge = await Challenges.findById(challengeId);

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    // Only creator can update status
    if (challenge.created_by.toString() !== userId) {
      throw new ForbiddenError('Only challenge creator can update status');
    }

    challenge.challenge_status = status;
    await challenge.save();

    logger.info(`Challenge ${challenge.challenge_name} status updated to ${status}`);

    return this.formatChallenge(challenge);
  }

  async deleteChallenge(userId: string, challengeId: string) {
    const challenge = await Challenges.findById(challengeId);

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    // Only creator can delete
    if (challenge.created_by.toString() !== userId) {
      throw new ForbiddenError('Only challenge creator can delete challenge');
    }

    // Remove challenge from all enrolled users' challenges_id
    await User.updateMany(
      { _id: { $in: challenge.enrolled_users } },
      { $pull: { challenges_id: challenge._id } }
    );

    await Challenges.findByIdAndDelete(challengeId);

    logger.info(`Challenge ${challenge.challenge_name} deleted by user ${userId}`);

    return { message: 'Challenge deleted successfully' };
  }

  private formatChallenge(challenge: any) {
    return {
      id: challenge._id.toString(),
      challenge_mode: challenge.challenge_mode,
      challenge_type: challenge.challenge_type,
      challenge_name: challenge.challenge_name,
      challenge_description: challenge.challenge_description,
      gametype: challenge.gametype,
      challenge_start_date: challenge.challenge_start_date,
      challenge_end_date: challenge.challenge_end_date,
      challenge_status: challenge.challenge_status,
      created_by: challenge.created_by,
      enrolled_users: challenge.enrolled_users,
      enrolled_count: challenge.enrolled_users?.length || 0,
      opponent_id: challenge.opponent_id,
      max_participants: challenge.max_participants,
      is_private: challenge.is_private,
      room_code: challenge.room_code,
      question_ids: challenge.question_ids,
      level_id: challenge.level_id,
      mission_index: challenge.mission_index,
      challenge_progress: challenge.challenge_progress,
      challenge_reward: challenge.challenge_reward,
      challenge_completed: challenge.challenge_completed,
      challenge_completed_at: challenge.challenge_completed_at,
      winner_ids: challenge.winner_ids,
      allow_hints: challenge.allow_hints,
      time_limit_seconds: challenge.time_limit_seconds,
      difficulty: challenge.difficulty,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    };
  }
}

export default new ChallengeService();


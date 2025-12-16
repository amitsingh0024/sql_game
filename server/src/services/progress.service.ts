import { UserProgress } from '../models/UserProgress.js';
import { UserStats } from '../models/UserStats.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const RANK_THRESHOLDS = [
  { rank: 'NOVICE WEAVER', minXP: 0, maxXP: 500 },
  { rank: 'APPRENTICE QUERY', minXP: 500, maxXP: 1500 },
  { rank: 'JUNIOR ANALYST', minXP: 1500, maxXP: 3000 },
  { rank: 'DATA OPERATOR', minXP: 3000, maxXP: 5000 },
  { rank: 'SQL SPECIALIST', minXP: 5000, maxXP: 7500 },
  { rank: 'DATABASE ARCHITECT', minXP: 7500, maxXP: 11000 },
  { rank: 'REALITY WEAVER', minXP: 11000, maxXP: 15000 },
  { rank: 'VOID MASTER', minXP: 15000, maxXP: 20000 },
  { rank: 'DIMENSION LORD', minXP: 20000, maxXP: 25000 },
  { rank: 'THE ARCHITECT', minXP: 25000, maxXP: Infinity },
];

export class ProgressService {
  calculateRank(xp: number): string {
    for (const threshold of RANK_THRESHOLDS) {
      if (xp >= threshold.minXP && xp < threshold.maxXP) {
        return threshold.rank;
      }
    }
    return RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1].rank;
  }

  async getUserProgress(userId: string) {
    const progress = await UserProgress.find({ userId }).sort({
      levelId: 1,
      missionIndex: 1,
    });

    return progress;
  }

  async getLevelProgress(userId: string, levelId: number) {
    const progress = await UserProgress.find({
      userId,
      levelId,
    }).sort({ missionIndex: 1 });

    return progress;
  }

  async completeMission(
    userId: string,
    levelId: number,
    missionIndex: number,
    xpEarned: number,
    stabilityEarned: number,
    isReplay: boolean = false
  ) {
    // Check if already completed
    const existing = await UserProgress.findOne({
      userId,
      levelId,
      missionIndex,
    });

    if (existing && existing.isCompleted && !isReplay) {
      // Already completed, return existing
      return existing;
    }

    // Update or create progress
    const progress = await UserProgress.findOneAndUpdate(
      { userId, levelId, missionIndex },
      {
        isCompleted: true,
        xpEarned: isReplay ? existing?.xpEarned || 0 : xpEarned,
        stabilityEarned: isReplay ? existing?.stabilityEarned || 0 : stabilityEarned,
        completedAt: isReplay ? existing?.completedAt : new Date(),
        $inc: { attemptsCount: 1 },
      },
      { upsert: true, new: true }
    );

    // Update user stats if not replay
    if (!isReplay) {
      await this.updateStats(userId, {
        xp: xpEarned,
        stability: { [levelId]: stabilityEarned },
        missionsCompleted: 1,
      });
    }

    logger.info(`Mission completed: User ${userId}, Level ${levelId}, Mission ${missionIndex}`);

    return progress;
  }

  async updateStats(
    userId: string,
    updates: {
      xp?: number;
      stability?: Record<number, number>;
      missionsCompleted?: number;
      levelsCompleted?: number;
      playtimeSeconds?: number;
    }
  ) {
    const stats = await UserStats.findOne({ userId });

    if (!stats) {
      // Create new stats
      const newStats = await UserStats.create({
        userId,
        totalXp: updates.xp || 0,
        currentRank: this.calculateRank(updates.xp || 0),
        unlockedLevels: [1],
        levelStability: updates.stability || {},
        missionsCompleted: updates.missionsCompleted || 0,
        levelsCompleted: updates.levelsCompleted || 0,
        totalPlaytimeSeconds: updates.playtimeSeconds || 0,
      });
      return newStats;
    }

    // Update existing stats
    if (updates.xp !== undefined) {
      stats.totalXp += updates.xp;
      stats.currentRank = this.calculateRank(stats.totalXp);
    }

    if (updates.stability) {
      Object.entries(updates.stability).forEach(([levelId, stability]) => {
        const level = parseInt(levelId);
        const current = stats.levelStability.get(level) || 0;
        stats.levelStability.set(level, Math.min(100, current + stability));
      });
    }

    if (updates.missionsCompleted !== undefined) {
      stats.missionsCompleted += updates.missionsCompleted;
    }

    if (updates.levelsCompleted !== undefined) {
      stats.levelsCompleted += updates.levelsCompleted;
    }

    if (updates.playtimeSeconds !== undefined) {
      stats.totalPlaytimeSeconds += updates.playtimeSeconds;
    }

    await stats.save();
    return stats;
  }

  async getUserStats(userId: string) {
    const stats = await UserStats.findOne({ userId });

    if (!stats) {
      // Return default stats
      return {
        userId,
        totalXp: 0,
        currentRank: 'NOVICE WEAVER',
        unlockedLevels: [1],
        levelStability: {},
        totalPlaytimeSeconds: 0,
        missionsCompleted: 0,
        levelsCompleted: 0,
      };
    }

    return stats;
  }

  async syncProgress(userId: string, clientProgress: any) {
    // This would sync client-side localStorage data to server
    // Implementation depends on client data structure
    logger.info(`Syncing progress for user ${userId}`);
    // TODO: Implement based on client data format
    return { success: true };
  }
}

export default new ProgressService();


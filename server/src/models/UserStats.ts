import mongoose, { Schema } from 'mongoose';
import { IUserStats } from '../types/index.js';

const userStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentRank: {
      type: String,
      default: 'NOVICE WEAVER',
    },
    unlockedLevels: {
      type: [Number],
      default: [1],
    },
    levelStability: {
      type: Map,
      of: Number,
      default: {},
    },
    totalPlaytimeSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    missionsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    levelsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for leaderboard queries
userStatsSchema.index({ totalXp: -1 });
userStatsSchema.index({ userId: 1 });

export const UserStats = mongoose.model<IUserStats>('UserStats', userStatsSchema);


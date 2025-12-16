import mongoose, { Schema } from 'mongoose';
import { ILeaderboard } from '../types/index.js';

const leaderboardSchema = new Schema<ILeaderboard>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    levelId: {
      type: Number,
      index: true,
      sparse: true, // Allows null values but indexes them
    },
    totalXp: {
      type: Number,
      required: true,
      min: 0,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
leaderboardSchema.index({ levelId: 1, totalXp: -1 });
leaderboardSchema.index({ totalXp: -1 }); // For global leaderboard
leaderboardSchema.index({ userId: 1, levelId: 1 }, { unique: true, sparse: true });

export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', leaderboardSchema);


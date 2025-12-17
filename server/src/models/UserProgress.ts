import mongoose, { Schema } from 'mongoose';
import { IUserProgress } from '../types/index.js';

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    levelId: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    missionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    stabilityEarned: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
    },
    attemptsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bestTimeSeconds: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate progress entries
userProgressSchema.index({ userId: 1, levelId: 1, missionIndex: 1 }, { unique: true });

// Indexes for queries
userProgressSchema.index({ userId: 1, levelId: 1 });
userProgressSchema.index({ userId: 1, isCompleted: 1 });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', userProgressSchema);


import { Schema } from 'mongoose';

/**
 * Schema for tracking individual user progress within a challenge
 * Used as a subdocument in the Challenges model
 */
export const challengeUserProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  questions_completed: {
    type: Number,
    default: 0,
    min: 0,
  },
  total_questions: {
    type: Number,
    default: 0,
    min: 0,
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
  },
  time_spent_seconds: {
    type: Number,
    default: 0,
    min: 0,
  },
  started_at: {
    type: Date,
  },
  completed_at: {
    type: Date,
  },
}, { _id: false });


import mongoose, { Schema } from 'mongoose';
import { IChallenges } from '../types/index.js';
import { challengeUserProgressSchema } from './ChallengeUserProgress.js';

const challengesSchema = new Schema<IChallenges>(
  {
    challenge_mode: {
      type: String,
      required: true,
      enum: ['one_on_one', 'story_mode', 'custom_room'],
      index: true,
    },
    challenge_type: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'custom_created'],
      index: true,
    },
    challenge_name: {
      type: String,
      required: [true, 'Challenge name is required'],
    },
    challenge_description: {
      type: String,
      required: [true, 'Challenge description is required'],
    },
    gametype: {
      type: String,
      required: true,
      enum: ['SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML'],
      index: true,
    },
    challenge_start_date: {
      type: Date,
      required: true,
      index: true,
    },
    challenge_end_date: {
      type: Date,
      required: true,
      index: true,
    },
    challenge_status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'completed', 'pending'],
      default: 'pending',
      index: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrolled_users: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    opponent_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Required only for one_on_one mode
    },
    max_participants: {
      type: Number,
      min: 2,
      // null = unlimited for custom rooms
    },
    is_private: {
      type: Boolean,
      default: false,
      index: true,
    },
    room_code: {
      type: String,
      sparse: true, // Allows multiple null values
      // Auto-generated for custom_room challenges
    },
    question_ids: {
      type: [Schema.Types.ObjectId],
      ref: 'Questions',
      // Required for custom_room mode
    },
    level_id: {
      type: Number,
      min: 1,
      max: 12,
      // Required for story_mode
    },
    mission_index: {
      type: Number,
      min: 0,
      // Optional for story_mode (null = entire level)
    },
    challenge_progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    user_progress: {
      type: Map,
      of: challengeUserProgressSchema,
      default: new Map(),
    },
    challenge_reward: {
      type: Number,
      default: 0,
      min: 0,
    },
    challenge_completed: {
      type: Boolean,
      default: false,
    },
    challenge_completed_at: {
      type: Date,
    },
    winner_ids: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    allow_hints: {
      type: Boolean,
      default: true,
    },
    time_limit_seconds: {
      type: Number,
      min: 0,
      // Optional time limit
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Ensure one_on_one has exactly 2 participants
challengesSchema.pre('save', function (next) {
  if (this.challenge_mode === 'one_on_one') {
    if (!this.opponent_id) {
      return next(new Error('One-on-one challenges require an opponent_id'));
    }
    if (this.enrolled_users.length > 2) {
      return next(new Error('One-on-one challenges can only have 2 participants'));
    }
  }
  
  // Validation: custom_room requires question_ids
  if (this.challenge_mode === 'custom_room') {
    if (!this.question_ids || this.question_ids.length === 0) {
      return next(new Error('Custom room challenges require at least one question'));
    }
    // Generate room code if not provided
    if (!this.room_code) {
      this.room_code = `ROOM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    }
  }
  
  // Validation: story_mode requires level_id
  if (this.challenge_mode === 'story_mode') {
    if (!this.level_id) {
      return next(new Error('Story mode challenges require a level_id'));
    }
  }
  
  next();
});

// Indexes
challengesSchema.index({ challenge_mode: 1, challenge_status: 1 });
challengesSchema.index({ challenge_type: 1, challenge_status: 1 });
challengesSchema.index({ gametype: 1, challenge_mode: 1 });
challengesSchema.index({ challenge_start_date: 1, challenge_end_date: 1 });
challengesSchema.index({ enrolled_users: 1 });
challengesSchema.index({ created_by: 1 });
challengesSchema.index({ opponent_id: 1 });
challengesSchema.index({ room_code: 1 }, { unique: true, sparse: true });
challengesSchema.index({ level_id: 1, mission_index: 1 });
challengesSchema.index({ question_ids: 1 });

export const Challenges = mongoose.model<IChallenges>('Challenges', challengesSchema);


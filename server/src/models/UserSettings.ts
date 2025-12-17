import mongoose, { Schema } from 'mongoose';
import { IUserSettings } from '../types/index.js';

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    
    // Game preferences
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    musicEnabled: {
      type: Boolean,
      default: true,
    },
    soundVolume: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    musicVolume: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    
    // Display preferences
    language: {
      type: String,
      default: 'en',
      maxlength: 10,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h',
    },
    
    // Notification preferences
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    friendRequestNotifications: {
      type: Boolean,
      default: true,
    },
    challengeInviteNotifications: {
      type: Boolean,
      default: true,
    },
    achievementNotifications: {
      type: Boolean,
      default: true,
    },
    leaderboardNotifications: {
      type: Boolean,
      default: true,
    },
    
    // Privacy settings
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showLevel: {
      type: Boolean,
      default: true,
    },
    showXp: {
      type: Boolean,
      default: true,
    },
    allowFriendRequests: {
      type: Boolean,
      default: true,
    },
    
    // Gameplay preferences
    defaultDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
    },
    autoSaveProgress: {
      type: Boolean,
      default: true,
    },
    showHints: {
      type: Boolean,
      default: true,
    },
    showTutorials: {
      type: Boolean,
      default: true,
    },
    
    // Challenge preferences
    autoAcceptChallenges: {
      type: Boolean,
      default: false,
    },
    challengeReminderEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index
userSettingsSchema.index({ userId: 1 }, { unique: true });

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);


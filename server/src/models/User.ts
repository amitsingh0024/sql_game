import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/index.js';

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    userRole: {
      type: String,
      enum: ['ADMIN', 'USER', 'MODERATOR', 'SUPER_ADMIN'],
      default: 'USER',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    associated_friend_id: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    stability: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    challenges_id: {
      type: [Schema.Types.ObjectId],
      ref: 'Challenges',
      default: [],
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { password, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ userRole: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ associated_friend_id: 1 });
userSchema.index({ challenges_id: 1 });
userSchema.index({ xp: -1 }); // For leaderboard queries

export const User = mongoose.model<IUser>('User', userSchema);


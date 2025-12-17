import mongoose, { Schema } from 'mongoose';
import { IGameConfig } from '../types/index.js';

const gameConfigSchema = new Schema<IGameConfig>(
  {
    gametype: {
      type: String,
      required: true,
      enum: ['SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML'],
      index: true,
    },
    gameversion: {
      type: String,
      required: true,
      match: [/^\d+\.\d+\.\d+$/, 'Version must be in format x.y.z'],
    },
    gameplatform: {
      type: String,
      required: true,
      enum: ['PC', 'MAC', 'LINUX', 'ANDROID', 'IOS', 'WEB', 'OTHER'],
    },
    gamebrowser: {
      type: String,
      enum: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'],
    },
    gameengine: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
gameConfigSchema.index({ gametype: 1, gameversion: 1 });

export const GameConfig = mongoose.model<IGameConfig>('GameConfig', gameConfigSchema);


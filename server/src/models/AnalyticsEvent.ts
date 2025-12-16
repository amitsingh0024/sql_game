import mongoose, { Schema } from 'mongoose';
import { IAnalyticsEvent } from '../types/index.js';

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        'mission_start',
        'mission_complete',
        'query_execute',
        'query_error',
        'level_unlock',
        'level_complete',
        'hint_requested',
        'session_start',
        'session_end',
      ],
    },
    levelId: {
      type: Number,
      index: true,
    },
    missionIndex: {
      type: Number,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ levelId: 1, eventType: 1, createdAt: -1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);


import mongoose, { Schema } from 'mongoose';
import { IFriendRequest } from '../types/index.js';

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate requests
friendRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// Compound indexes for efficient queries
friendRequestSchema.index({ toUserId: 1, status: 1 });
friendRequestSchema.index({ fromUserId: 1, status: 1 });
friendRequestSchema.index({ status: 1, createdAt: -1 });

// Validation: Prevent self-friend requests
friendRequestSchema.pre('save', function (next) {
  if (this.fromUserId.toString() === this.toUserId.toString()) {
    return next(new Error('Cannot send friend request to yourself'));
  }
  next();
});

export const FriendRequest = mongoose.model<IFriendRequest>('FriendRequest', friendRequestSchema);


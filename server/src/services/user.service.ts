import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { Challenges } from '../models/Challenges.js';
import { FriendRequest } from '../models/FriendRequest.js';
import { UnauthorizedError, NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export class UserService {
  async getUserProfile(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      userRole: user.userRole,
      isAdmin: user.isAdmin,
      level: user.level,
      xp: user.xp,
      stability: user.stability,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getPublicUserProfile(userId: string) {
    const user = await User.findById(userId).select('-password -email -isAdmin -userRole -isActive');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      level: user.level,
      xp: user.xp,
      stability: user.stability,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, updates: { username?: string; email?: string }) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if username is being changed and if it's already taken
    if (updates.username && updates.username !== user.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser) {
        throw new ConflictError('Username already taken');
      }
      user.username = updates.username;
    }

    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: updates.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }
      user.email = updates.email.toLowerCase();
    }

    await user.save();

    logger.info(`User profile updated: ${user.username} (${user.email})`);

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      userRole: user.userRole,
      isAdmin: user.isAdmin,
      level: user.level,
      xp: user.xp,
      stability: user.stability,
      updatedAt: user.updatedAt,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    user.password = passwordHash;

    await user.save();

    logger.info(`Password changed for user: ${user.username}`);

    return { message: 'Password changed successfully' };
  }

  async getUserChallenges(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get all challenges where user is enrolled
    const challenges = await Challenges.find({
      _id: { $in: user.challenges_id },
    })
      .populate('created_by', 'username')
      .populate('enrolled_users', 'username')
      .select('-user_progress')
      .sort({ challenge_start_date: -1 });

    return challenges.map((challenge) => ({
      id: challenge._id.toString(),
      challenge_mode: challenge.challenge_mode,
      challenge_type: challenge.challenge_type,
      challenge_name: challenge.challenge_name,
      challenge_description: challenge.challenge_description,
      gametype: challenge.gametype,
      challenge_start_date: challenge.challenge_start_date,
      challenge_end_date: challenge.challenge_end_date,
      challenge_status: challenge.challenge_status,
      created_by: challenge.created_by,
      enrolled_users: challenge.enrolled_users,
      challenge_progress: challenge.challenge_progress,
      challenge_completed: challenge.challenge_completed,
      difficulty: challenge.difficulty,
      createdAt: challenge.createdAt,
    }));
  }

  async getFriends(userId: string) {
    const user = await User.findById(userId).populate('associated_friend_id', 'username level xp stability');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.associated_friend_id || user.associated_friend_id.length === 0) {
      return [];
    }

    return user.associated_friend_id.map((friend: any) => ({
      id: friend._id.toString(),
      username: friend.username,
      level: friend.level,
      xp: friend.xp,
      stability: friend.stability,
    }));
  }

  async sendFriendRequest(userId: string, toUserId: string) {
    if (userId === toUserId) {
      throw new ConflictError('Cannot send friend request to yourself');
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(toUserId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!toUser) {
      throw new NotFoundError('User to send request to not found');
    }

    // Check if already friends
    if (user.associated_friend_id && user.associated_friend_id.some((id) => id.toString() === toUserId)) {
      throw new ConflictError('User is already in your friends list');
    }

    // Check if there's already a pending request (in either direction)
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: userId },
      ],
      status: 'pending',
    });

    if (existingRequest) {
      if (existingRequest.fromUserId.toString() === userId) {
        throw new ConflictError('Friend request already sent');
      } else {
        throw new ConflictError('This user has already sent you a friend request');
      }
    }

    // Check if there's an accepted request (already friends)
    const acceptedRequest = await FriendRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: userId },
      ],
      status: 'accepted',
    });

    if (acceptedRequest) {
      throw new ConflictError('You are already friends with this user');
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      fromUserId: user._id,
      toUserId: toUser._id,
      status: 'pending',
    });

    logger.info(`Friend request sent from ${user.username} to ${toUser.username}`);

    return {
      id: friendRequest._id.toString(),
      fromUser: {
        id: user._id.toString(),
        username: user.username,
      },
      toUser: {
        id: toUser._id.toString(),
        username: toUser.username,
      },
      status: friendRequest.status,
      createdAt: friendRequest.createdAt,
    };
  }

  async getFriendRequests(userId: string, type: 'sent' | 'received' = 'received') {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const query =
      type === 'sent'
        ? { fromUserId: user._id, status: 'pending' }
        : { toUserId: user._id, status: 'pending' };

    const requests = await FriendRequest.find(query)
      .populate('fromUserId', 'username level xp')
      .populate('toUserId', 'username level xp')
      .sort({ createdAt: -1 });

    return requests.map((request) => ({
      id: request._id.toString(),
      fromUser: {
        id: (request.fromUserId as any)._id.toString(),
        username: (request.fromUserId as any).username,
        level: (request.fromUserId as any).level,
        xp: (request.fromUserId as any).xp,
      },
      toUser: {
        id: (request.toUserId as any)._id.toString(),
        username: (request.toUserId as any).username,
        level: (request.toUserId as any).level,
        xp: (request.toUserId as any).xp,
      },
      status: request.status,
      createdAt: request.createdAt,
    }));
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    const user = await User.findById(userId);
    const friendRequest = await FriendRequest.findById(requestId)
      .populate('fromUserId')
      .populate('toUserId');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!friendRequest) {
      throw new NotFoundError('Friend request not found');
    }

    // Verify the request is for this user
    if (friendRequest.toUserId.toString() !== userId) {
      throw new ForbiddenError('You can only accept friend requests sent to you');
    }

    // Check if request is already processed
    if (friendRequest.status !== 'pending') {
      throw new ConflictError(`Friend request has already been ${friendRequest.status}`);
    }

    const fromUser = friendRequest.fromUserId as any;

    // Check if already friends
    if (
      user.associated_friend_id && user.associated_friend_id.some((id) => id.toString() === fromUser._id.toString())
    ) {
      // Already friends, just update the request status
      friendRequest.status = 'accepted';
      await friendRequest.save();
      throw new ConflictError('You are already friends with this user');
    }

    // Add to both users' friend lists
    if (!user.associated_friend_id) {
      user.associated_friend_id = [];
    }
    user.associated_friend_id.push(fromUser._id);
    await user.save();

    const fromUserDoc = await User.findById(fromUser._id);
    if (fromUserDoc) {
      if (!fromUserDoc.associated_friend_id) {
        fromUserDoc.associated_friend_id = [];
      }
      fromUserDoc.associated_friend_id.push(user._id);
      await fromUserDoc.save();
    }

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    logger.info(`Friend request accepted: ${user.username} and ${fromUser.username} are now friends`);

    return {
      id: friendRequest._id.toString(),
      fromUser: {
        id: fromUser._id.toString(),
        username: fromUser.username,
        level: fromUser.level,
        xp: fromUser.xp,
        stability: fromUser.stability,
      },
      status: friendRequest.status,
      message: 'Friend request accepted',
    };
  }

  async rejectFriendRequest(userId: string, requestId: string) {
    const user = await User.findById(userId);
    const friendRequest = await FriendRequest.findById(requestId)
      .populate('fromUserId');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!friendRequest) {
      throw new NotFoundError('Friend request not found');
    }

    // Verify the request is for this user
    if (friendRequest.toUserId.toString() !== userId) {
      throw new ForbiddenError('You can only reject friend requests sent to you');
    }

    // Check if request is already processed
    if (friendRequest.status !== 'pending') {
      throw new ConflictError(`Friend request has already been ${friendRequest.status}`);
    }

    // Update request status
    friendRequest.status = 'rejected';
    await friendRequest.save();

    const fromUser = friendRequest.fromUserId as any;
    logger.info(`Friend request rejected: ${user.username} rejected request from ${fromUser.username}`);

    return {
      id: friendRequest._id.toString(),
      status: friendRequest.status,
      message: 'Friend request rejected',
    };
  }

  async cancelFriendRequest(userId: string, requestId: string) {
    const user = await User.findById(userId);
    const friendRequest = await FriendRequest.findById(requestId)
      .populate('fromUserId')
      .populate('toUserId');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!friendRequest) {
      throw new NotFoundError('Friend request not found');
    }

    // Verify the request was sent by this user
    if (friendRequest.fromUserId.toString() !== userId) {
      throw new ForbiddenError('You can only cancel friend requests you sent');
    }

    // Check if request is already processed
    if (friendRequest.status !== 'pending') {
      throw new ConflictError(`Friend request has already been ${friendRequest.status}`);
    }

    // Delete the request
    await FriendRequest.findByIdAndDelete(requestId);

    logger.info(`Friend request cancelled: ${user.username} cancelled request ${requestId}`);

    return {
      message: 'Friend request cancelled',
    };
  }

  async removeFriend(userId: string, friendId: string) {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!friend) {
      throw new NotFoundError('Friend not found');
    }

    // Check if friend exists in list
    if (!user.associated_friend_id) {
      throw new NotFoundError('Friend not found in your friends list');
    }

    const friendIndex = user.associated_friend_id.findIndex(
      (id) => id.toString() === friendId
    );

    if (friendIndex === -1) {
      throw new NotFoundError('Friend not found in your friends list');
    }

    // Remove friend from user's list
    user.associated_friend_id.splice(friendIndex, 1);
    await user.save();

    // Remove user from friend's list
    if (friend.associated_friend_id) {
      const userIndex = friend.associated_friend_id.findIndex(
        (id) => id.toString() === userId
      );
      if (userIndex !== -1) {
        friend.associated_friend_id.splice(userIndex, 1);
        await friend.save();
      }
    }

    // Update any existing friend requests to rejected
    await FriendRequest.updateMany(
      {
        $or: [
          { fromUserId: userId, toUserId: friendId },
          { fromUserId: friendId, toUserId: userId },
        ],
      },
      { status: 'rejected' }
    );

    logger.info(`User ${user.username} removed friend: ${friend.username}`);

    return { message: 'Friend removed successfully' };
  }

  async searchUsers(query: string, limit: number = 10) {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      isActive: true,
    })
      .select('username level xp stability')
      .limit(limit)
      .sort({ xp: -1 });

    return users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      level: user.level,
      xp: user.xp,
      stability: user.stability,
    }));
  }
}

export default new UserService();


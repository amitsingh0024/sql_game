import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  userRole: string; // ADMIN, USER, MODERATOR, SUPER_ADMIN
  isAdmin: boolean;
  isActive: boolean; // Account is active or deactivated
  associated_friend_id?: Types.ObjectId[]; // Array of User IDs for adding users as friends
  level: number;
  xp: number;
  stability: number;
  challenges_id: Types.ObjectId[]; // Reverse mapping to show in which challenges user participated
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGameConfig extends Document {
  _id: Types.ObjectId;
  gametype: string; // SQL, JAVA, C++, PYTHON, JAVASCRIPT, AI, ML
  gameversion: string; // 1.0.0, 1.0.1, 1.0.2, etc.
  gameplatform: string; // PC, MAC, LINUX, ANDROID, IOS, WEB, OTHER
  gamebrowser: string; // Chrome, Firefox, Safari, Edge, Other
  gameengine: string; // SQL engine, C++ engine, Python engine, JS engine, to run the code on the server and return the result
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuestions extends Document {
  _id: Types.ObjectId;
  question: string;
  answer: string;
  isActive: boolean;
  questionType: string; // Should match IGameConfig.gametype
  question_level: string; // normal, boss
  createdAt?: Date;
  updatedAt?: Date;
}


export interface ILeaderboard extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | string; // Reference to User
  levelId?: number; // Optional: for level-specific leaderboards
  totalXp: number;
  rank: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChallenges extends Document {
  _id: Types.ObjectId;
  challenge_mode: string; // one_on_one, story_mode, custom_room
  challenge_type: string; // daily, weekly, monthly, custom_created
  challenge_name: string;
  challenge_description: string;
  
  // Game configuration
  gametype: string; // SQL, JAVA, C++, PYTHON, JAVASCRIPT, AI, ML
  
  // Timing
  challenge_start_date: Date;
  challenge_end_date: Date;
  challenge_status: string; // active, inactive, completed, pending
  
  // Participants
  created_by: Types.ObjectId; // User ID who created the challenge
  enrolled_users: Types.ObjectId[]; // Array of user IDs who enrolled
  opponent_id?: Types.ObjectId; // For one-on-one challenges (exactly 2 users)
  max_participants?: number; // For custom rooms (null = unlimited)
  is_private: boolean; // Private challenge (invite only) or public
  room_code?: string; // Unique code for custom room access
  
  // Challenge content
  question_ids?: Types.ObjectId[]; // For custom_room: selected question IDs
  level_id?: number; // For story_mode: which level
  mission_index?: number; // For story_mode: which mission(s), null = entire level
  
  // Progress tracking
  challenge_progress: number; // Overall challenge progress (0-100)
  user_progress: Record<string, {
    userId: Types.ObjectId;
    progress: number; // Individual user progress (0-100)
    questions_completed: number;
    total_questions: number;
    score: number;
    time_spent_seconds: number;
    started_at?: Date;
    completed_at?: Date;
  }> | Map<string, {
    userId: Types.ObjectId;
    progress: number;
    questions_completed: number;
    total_questions: number;
    score: number;
    time_spent_seconds: number;
    started_at?: Date;
    completed_at?: Date;
  }>; // Per-user progress tracking (key = userId.toString())
  
  // Rewards & completion
  challenge_reward: number; // XP or other reward
  challenge_completed: boolean;
  challenge_completed_at?: Date;
  winner_ids: Types.ObjectId[]; // Array of user IDs who won the challenge
  
  // Settings
  allow_hints: boolean; // Whether hints are allowed
  time_limit_seconds?: number; // Optional time limit per question or total
  difficulty?: string; // easy, medium, hard, expert
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserProgress extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | string; // Reference to User
  levelId: number;
  missionIndex: number;
  isCompleted: boolean;
  xpEarned: number;
  stabilityEarned: number;
  completedAt?: Date;
  attemptsCount: number;
  bestTimeSeconds?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserStats extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | string; // Reference to User
  totalXp: number;
  currentRank: string;
  unlockedLevels: number[];
  levelStability: Map<number, number> | Record<number, number>; // Mongoose Map or plain object
  totalPlaytimeSeconds: number;
  missionsCompleted: number;
  levelsCompleted: number;
  createdAt?: Date;
  updatedAt: Date;
}


export interface IAnalyticsEvent extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId | string; // Optional: for anonymous events
  eventType: string; // mission_start, mission_complete, query_execute, etc.
  levelId?: number;
  missionIndex?: number;
  metadata: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IUserAchievement extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | string; // Reference to User
  achievementId: string; // Achievement identifier (e.g., 'first_complete', 'speed_demon')
  unlockedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFriendRequest extends Document {
  _id: Types.ObjectId;
  fromUserId: Types.ObjectId; // User who sent the request
  toUserId: Types.ObjectId; // User who received the request
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}


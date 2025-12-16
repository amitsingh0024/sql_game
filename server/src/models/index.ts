/**
 * Models Index
 * 
 * This file imports all Mongoose models to ensure they are registered
 * when the server starts. Models must be imported at least once to be
 * available for use throughout the application.
 */

// User-related models
export { User } from './User.js';
export { UserProgress } from './UserProgress.js';
export { UserStats } from './UserStats.js';
export { UserAchievement } from './UserAchievement.js';

// Game-related models
export { GameConfig } from './GameConfig.js';
export { Questions } from './Questions.js';

// Challenge models
export { Challenges } from './Challenges.js';
export { challengeUserProgressSchema } from './ChallengeUserProgress.js';

// Leaderboard and Analytics
export { Leaderboard } from './Leaderboard.js';
export { AnalyticsEvent } from './AnalyticsEvent.js';


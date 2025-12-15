import { PlayerStats } from '../types';
import { getCompletedMissions } from './missionUnlock';

const PLAYER_STATS_KEY = 'sql_game_player_stats';
const TOTAL_MISSIONS_PER_LEVEL = 11; // All levels have 11 missions

// Rank thresholds based on XP
// Designed so completing all 12 levels (~32,000 XP) guarantees reaching THE ARCHITECT
// Ranks are distributed across the progression to feel meaningful
const RANK_THRESHOLDS = [
  { rank: 'NOVICE WEAVER', minXP: 0, maxXP: 500 },
  { rank: 'APPRENTICE QUERY', minXP: 500, maxXP: 1500 },
  { rank: 'JUNIOR ANALYST', minXP: 1500, maxXP: 3000 },
  { rank: 'DATA OPERATOR', minXP: 3000, maxXP: 5000 },
  { rank: 'SQL SPECIALIST', minXP: 5000, maxXP: 7500 },
  { rank: 'DATABASE ARCHITECT', minXP: 7500, maxXP: 11000 },
  { rank: 'REALITY WEAVER', minXP: 11000, maxXP: 15000 },
  { rank: 'VOID MASTER', minXP: 15000, maxXP: 20000 },
  { rank: 'DIMENSION LORD', minXP: 20000, maxXP: 25000 },
  { rank: 'THE ARCHITECT', minXP: 25000, maxXP: Infinity },
];

/**
 * Calculate stability for a level based on completed missions
 * This is used to retroactively calculate stability for levels completed before the per-level system
 */
const calculateLevelStabilityFromMissions = (levelId: number): number => {
  const completedMissions = getCompletedMissions(levelId);
  if (completedMissions.length === 0) return 0;
  
  let totalStability = 0;
  
  // Calculate stability based on completed missions
  completedMissions.forEach((missionIndex) => {
    const isBoss = missionIndex >= 9; // Last 2 missions are typically bosses (indices 9 and 10)
    
    // Base stability reward
    let stabilityReward = 8;
    if (isBoss) {
      stabilityReward = 15;
    }
    
    // Level difficulty bonus
    stabilityReward += Math.floor(levelId * 0.5);
    
    // Mission position bonus (later missions give more)
    const missionPositionMultiplier = missionIndex / Math.max(1, TOTAL_MISSIONS_PER_LEVEL - 1);
    const positionBonus = Math.floor(missionPositionMultiplier * 2); // Small position bonus for stability
    stabilityReward += positionBonus;
    
    totalStability += stabilityReward;
  });
  
  // Add level completion bonus if all missions are completed
  if (completedMissions.length >= TOTAL_MISSIONS_PER_LEVEL) {
    const completionBonus = Math.min(5, Math.floor(levelId * 0.5));
    totalStability += completionBonus;
  }
  
  return Math.min(100, totalStability);
};

/**
 * Migrate old stability data to per-level stability
 * Calculates stability for all levels based on completed missions
 */
const migrateToPerLevelStability = (stats: PlayerStats): PlayerStats => {
  if (!stats.levelStability) {
    stats.levelStability = {};
  }
  
  // Check if we need to migrate (if any levels have completed missions but no stability)
  let needsMigration = false;
  for (let levelId = 1; levelId <= 12; levelId++) {
    const completedMissions = getCompletedMissions(levelId);
    if (completedMissions.length > 0 && stats.levelStability[levelId] === undefined) {
      needsMigration = true;
      stats.levelStability[levelId] = calculateLevelStabilityFromMissions(levelId);
    }
  }
  
  // Save migrated data if needed
  if (needsMigration && typeof window !== 'undefined') {
    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(stats));
  }
  
  return stats;
};

/**
 * Get current player stats from localStorage
 */
export const getPlayerStats = (): PlayerStats => {
  if (typeof window === 'undefined') {
    return { rank: 'NOVICE WEAVER', powerLevel: 0, realityStability: 0, levelStability: {} };
  }

  const stored = localStorage.getItem(PLAYER_STATS_KEY);
  if (stored) {
    try {
      const stats = JSON.parse(stored) as PlayerStats;
      // Ensure rank is calculated correctly
      stats.rank = calculateRank(stats.powerLevel);
      // Initialize levelStability if missing (migration from old system)
      if (!stats.levelStability) {
        stats.levelStability = {};
      }
      // Migrate old data to per-level stability
      return migrateToPerLevelStability(stats);
    } catch {
      // Fall through to default
    }
  }
  
  return { rank: 'NOVICE WEAVER', powerLevel: 0, realityStability: 0, levelStability: {} };
};

/**
 * Get stability for a specific level
 * If stability isn't tracked yet, calculate it from completed missions
 */
export const getLevelStability = (levelId: number): number => {
  const stats = getPlayerStats();
  
  // If stability is already tracked, return it
  if (stats.levelStability?.[levelId] !== undefined) {
    return stats.levelStability[levelId];
  }
  
  // Otherwise, calculate from completed missions and save it
  const calculatedStability = calculateLevelStabilityFromMissions(levelId);
  
  // Save the calculated stability for future use
  if (calculatedStability > 0 && typeof window !== 'undefined') {
    const updatedLevelStability = {
      ...(stats.levelStability || {}),
      [levelId]: calculatedStability
    };
    
    const updatedStats: PlayerStats = {
      ...stats,
      levelStability: updatedLevelStability
    };
    
    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(updatedStats));
  }
  
  return calculatedStability;
};

/**
 * Calculate rank based on XP
 */
export const calculateRank = (xp: number): string => {
  for (const threshold of RANK_THRESHOLDS) {
    if (xp >= threshold.minXP && xp < threshold.maxXP) {
      return threshold.rank;
    }
  }
  return RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1].rank;
};

/**
 * Get XP progress for current rank
 */
export const getRankProgress = (xp: number): { current: number; max: number; rank: string; nextRank: string | null } => {
  for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
    const threshold = RANK_THRESHOLDS[i];
    if (xp >= threshold.minXP && xp < threshold.maxXP) {
      const nextRank = i < RANK_THRESHOLDS.length - 1 ? RANK_THRESHOLDS[i + 1].rank : null;
      return {
        current: xp - threshold.minXP,
        max: threshold.maxXP - threshold.minXP,
        rank: threshold.rank,
        nextRank
      };
    }
  }
  const last = RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
  return {
    current: xp - last.minXP,
    max: Infinity,
    rank: last.rank,
    nextRank: null
  };
};

/**
 * Count how many levels have been fully completed
 * A level is considered completed when all its missions are completed
 */
export const getCompletedLevelsCount = (): number => {
  if (typeof window === 'undefined') return 0;
  
  let completedCount = 0;
  
  // Check each level (1-12)
  for (let levelId = 1; levelId <= 12; levelId++) {
    const completedMissions = getCompletedMissions(levelId);
    // A level is complete if all missions are completed
    // We check if completed missions count equals total missions
    if (completedMissions.length >= TOTAL_MISSIONS_PER_LEVEL) {
      completedCount++;
    }
  }
  
  return completedCount;
};

/**
 * Award XP and stability for completing a mission
 * Rewards scale with:
 * 1. Overall progress (completed levels count)
 * 2. Mission position within level (later missions = more XP)
 * 3. Level difficulty (higher level = more base XP)
 * 4. Boss status (boss missions = bonus multiplier)
 */
export const awardMissionReward = (
  levelId: number, 
  missionIndex: number, 
  totalMissionsInLevel: number,
  isBoss: boolean = false
): { xp: number; stability: number } => {
  // Base rewards
  let xpReward = 150;
  let stabilityReward = 8;

  // Boss missions get base multiplier
  if (isBoss) {
    xpReward = 300;
    stabilityReward = 15;
  }

  // 1. Level difficulty bonus (higher levels = more base XP)
  const levelDifficultyBonus = Math.floor(levelId * 10);
  xpReward += levelDifficultyBonus;
  stabilityReward += Math.floor(levelId * 0.5);

  // 2. Mission position bonus (later missions in level = more XP)
  // Mission index 0 = 0%, mission index 10 = 100% of position bonus
  const missionPositionMultiplier = missionIndex / Math.max(1, totalMissionsInLevel - 1);
  const positionBonus = Math.floor(missionPositionMultiplier * 50); // Up to 50 XP bonus
  xpReward += positionBonus;

  // 3. Overall progress bonus (completed levels = multiplier)
  const completedLevels = getCompletedLevelsCount();
  // Each completed level adds 2% XP bonus (capped at 50% bonus for 25+ completed levels)
  const progressMultiplier = Math.min(1.5, 1.0 + (completedLevels * 0.02));
  xpReward = Math.floor(xpReward * progressMultiplier);

  // Get current stats
  const stats = getPlayerStats();
  
  // Calculate new values
  const newXP = stats.powerLevel + xpReward;
  
  // Update level-specific stability
  const currentLevelStability = stats.levelStability?.[levelId] || 0;
  const newLevelStability = Math.min(100, currentLevelStability + stabilityReward); // Cap at 100%
  
  // Update levelStability object
  const updatedLevelStability = {
    ...(stats.levelStability || {}),
    [levelId]: newLevelStability
  };
  
  // Calculate new rank
  const newRank = calculateRank(newXP);
  
  // Save updated stats
  const updatedStats: PlayerStats = {
    rank: newRank,
    powerLevel: newXP,
    realityStability: 0, // Deprecated, kept for compatibility
    levelStability: updatedLevelStability
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(updatedStats));
  }
  
  return { xp: xpReward, stability: stabilityReward };
};

/**
 * Award bonus XP for completing an entire level
 * This ensures players are rewarded for full level completion
 * Bonus scales with overall progress (completed levels)
 */
export const awardLevelCompletionBonus = (levelId: number): { xp: number; stability: number } => {
  // Base completion bonus scales with level
  let xpBonus = levelId * 50; // Level 1 = 50, Level 12 = 600
  const stabilityBonus = Math.min(5, Math.floor(levelId * 0.5)); // Small stability bonus, capped
  
  // Scale with overall progress (completed levels before this one)
  const completedLevels = getCompletedLevelsCount();
  const progressMultiplier = Math.min(1.5, 1.0 + (completedLevels * 0.02));
  xpBonus = Math.floor(xpBonus * progressMultiplier);
  
  const stats = getPlayerStats();
  const newXP = stats.powerLevel + xpBonus;
  
  // Update level-specific stability
  const currentLevelStability = stats.levelStability?.[levelId] || 0;
  const newLevelStability = Math.min(100, currentLevelStability + stabilityBonus);
  
  // Update levelStability object
  const updatedLevelStability = {
    ...(stats.levelStability || {}),
    [levelId]: newLevelStability
  };
  
  const newRank = calculateRank(newXP);
  
  const updatedStats: PlayerStats = {
    rank: newRank,
    powerLevel: newXP,
    realityStability: 0, // Deprecated, kept for compatibility
    levelStability: updatedLevelStability
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(updatedStats));
  }
  
  return { xp: xpBonus, stability: stabilityBonus };
};

/**
 * Reset player stats (for testing/debugging)
 */
export const resetPlayerStats = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PLAYER_STATS_KEY);
};

/**
 * Check if player has enough stability to unlock a level
 * Higher levels require more stability
 */
export const canUnlockLevel = (levelId: number): boolean => {
  const stats = getPlayerStats();
  const requiredStability = (levelId - 1) * 8; // Level 2 needs 8%, Level 3 needs 16%, etc.
  return stats.realityStability >= requiredStability || levelId === 1;
};


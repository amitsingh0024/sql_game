const UNLOCKED_MISSIONS_KEY = 'sql_game_unlocked_missions';

/**
 * Get the list of unlocked missions for a specific level from localStorage
 * Defaults to only the first mission (index 0) unlocked for new users
 */
export const getUnlockedMissions = (levelId: number): number[] => {
  if (typeof window === 'undefined') return [0];
  
  const stored = localStorage.getItem(UNLOCKED_MISSIONS_KEY);
  if (stored) {
    try {
      const allLevels = JSON.parse(stored) as Record<string, number[]>;
      const levelKey = `level_${levelId}`;
      const missions = allLevels[levelKey];
      if (missions && Array.isArray(missions)) {
        // Ensure mission 0 is always unlocked
        if (!missions.includes(0)) {
          missions.push(0);
          missions.sort((a, b) => a - b);
        }
        return missions;
      }
    } catch {
      // Fall through to default
    }
  }
  return [0]; // Default: only first mission (index 0) unlocked
};

/**
 * Check if a specific mission is unlocked for a level
 */
export const isMissionUnlocked = (levelId: number, missionIndex: number): boolean => {
  const unlocked = getUnlockedMissions(levelId);
  return unlocked.includes(missionIndex);
};

/**
 * Unlock a mission for a level and save to localStorage
 */
export const unlockMission = (levelId: number, missionIndex: number): void => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(UNLOCKED_MISSIONS_KEY);
  let allLevels: Record<string, number[]> = {};
  
  if (stored) {
    try {
      allLevels = JSON.parse(stored) as Record<string, number[]>;
    } catch {
      // Start fresh if corrupted
    }
  }
  
  const levelKey = `level_${levelId}`;
  const missions = allLevels[levelKey] || [0]; // Default to mission 0 unlocked
  
  if (!missions.includes(missionIndex)) {
    missions.push(missionIndex);
    missions.sort((a, b) => a - b);
    allLevels[levelKey] = missions;
    localStorage.setItem(UNLOCKED_MISSIONS_KEY, JSON.stringify(allLevels));
  }
};

/**
 * Unlock the next mission after completing a mission
 */
export const unlockNextMission = (levelId: number, completedMissionIndex: number): void => {
  const nextMissionIndex = completedMissionIndex + 1;
  unlockMission(levelId, nextMissionIndex);
};

/**
 * Mark a mission as completed (for tracking purposes)
 * This is separate from unlocking - completion means you've finished it
 */
export const getCompletedMissions = (levelId: number): number[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(`${UNLOCKED_MISSIONS_KEY}_completed`);
  if (stored) {
    try {
      const allLevels = JSON.parse(stored) as Record<string, number[]>;
      const levelKey = `level_${levelId}`;
      return allLevels[levelKey] || [];
    } catch {
      return [];
    }
  }
  return [];
};

/**
 * Mark a mission as completed
 */
export const markMissionCompleted = (levelId: number, missionIndex: number): void => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(`${UNLOCKED_MISSIONS_KEY}_completed`);
  let allLevels: Record<string, number[]> = {};
  
  if (stored) {
    try {
      allLevels = JSON.parse(stored) as Record<string, number[]>;
    } catch {
      // Start fresh if corrupted
    }
  }
  
  const levelKey = `level_${levelId}`;
  const completed = allLevels[levelKey] || [];
  
  if (!completed.includes(missionIndex)) {
    completed.push(missionIndex);
    completed.sort((a, b) => a - b);
    allLevels[levelKey] = completed;
    localStorage.setItem(`${UNLOCKED_MISSIONS_KEY}_completed`, JSON.stringify(allLevels));
  }
};

/**
 * Reset all mission progress (for testing/debugging)
 */
export const resetMissionProgress = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(UNLOCKED_MISSIONS_KEY);
};


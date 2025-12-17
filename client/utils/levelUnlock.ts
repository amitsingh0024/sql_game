const UNLOCKED_LEVELS_KEY = 'sql_game_unlocked_levels';

/**
 * Get the list of unlocked levels from localStorage
 * Defaults to only level 1 unlocked for new users
 */
export const getUnlockedLevels = (): number[] => {
  if (typeof window === 'undefined') return [1];
  
  const stored = localStorage.getItem(UNLOCKED_LEVELS_KEY);
  if (stored) {
    try {
      const levels = JSON.parse(stored) as number[];
      // Ensure level 1 is always unlocked
      if (!levels.includes(1)) {
        levels.push(1);
        levels.sort((a, b) => a - b);
      }
      return levels;
    } catch {
      return [1];
    }
  }
  return [1]; // Default: only level 1 unlocked
};

/**
 * Check if a specific level is unlocked
 */
export const isLevelUnlocked = (levelId: number): boolean => {
  const unlocked = getUnlockedLevels();
  return unlocked.includes(levelId);
};

/**
 * Unlock a level and save to localStorage
 */
export const unlockLevel = (levelId: number): void => {
  if (typeof window === 'undefined') return;
  
  const unlocked = getUnlockedLevels();
  if (!unlocked.includes(levelId)) {
    unlocked.push(levelId);
    unlocked.sort((a, b) => a - b);
    localStorage.setItem(UNLOCKED_LEVELS_KEY, JSON.stringify(unlocked));
  }
};

/**
 * Unlock the next level after completing a level
 */
export const unlockNextLevel = (completedLevelId: number): void => {
  const nextLevelId = completedLevelId + 1;
  if (nextLevelId <= 12) { // Assuming max 12 levels
    unlockLevel(nextLevelId);
  }
};

/**
 * Reset all progress (for testing/debugging)
 */
export const resetProgress = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(UNLOCKED_LEVELS_KEY);
};




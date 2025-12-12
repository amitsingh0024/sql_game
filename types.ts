
export enum GameState {
  SPLASH = 'SPLASH',
  INTRO_STORY = 'INTRO_STORY',
  LEVEL_SELECT = 'LEVEL_SELECT',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface PlayerStats {
  rank: string;
  powerLevel: number;
  realityStability: number;
}

export interface GlitchReport {
  id: string;
  dimension: string;
  severity: 'LOW' | 'CRITICAL' | 'REALITY_COLLAPSE';
  technicalFault: string;
  manifestation: string;
  flavor: string;
}

export interface SquadMember {
  name: string;
  role: string;
  status: 'ONLINE' | 'OFFLINE' | 'IN_COMBAT';
  avatarColor: string;
}

export enum ThemeStyle {
  CYBERPUNK = 'CYBERPUNK',
  VAPORWAVE = 'VAPORWAVE',
  CARTOON = 'CARTOON'
}

// --- NEW GAMEPLAY TYPES ---

export interface TableColumn {
  name: string;
  type: 'string' | 'number' | 'boolean';
}

export interface MockTable {
  name: string;
  columns: TableColumn[];
  data: Record<string, any>[];
}

export interface Mission {
  id: string;
  title: string;
  story: string; // The narrative briefing
  objective: string; // Short goal
  hint?: string;
  table?: MockTable; // Legacy support for single table missions
  tables?: MockTable[]; // Support for multi-table missions (Level 2+)
  expectedResult: (data: any[]) => boolean; // validation logic
  successMessage: string;
}

export interface LevelData {
  id: number;
  title: string;
  description: string;
  theme: ThemeStyle;
  missions: Mission[];
}

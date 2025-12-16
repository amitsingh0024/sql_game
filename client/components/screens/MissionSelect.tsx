import React, { useState, useEffect } from 'react';
import { LevelData, Mission } from '../../types';
import { LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10, LEVEL_11, LEVEL_12 } from '../../data/levels';
import { getUnlockedMissions, getCompletedMissions } from '../../utils/missionUnlock';
import { getLevelStability } from '../../utils/playerStats';
import { HoloButton } from '../ui/HoloButton';
import { GlitchText } from '../ui/GlitchText';
import { StabilityIndicator } from '../ui/StabilityIndicator';

interface MissionSelectProps {
  levelId: number;
  onBack: () => void;
  onSelectMission: (missionIndex: number) => void;
}

export const MissionSelect: React.FC<MissionSelectProps> = ({ levelId, onBack, onSelectMission }) => {
  // Load correct level data
  const getLevelData = (id: number): LevelData => {
    switch(id) {
      case 1: return LEVEL_1;
      case 2: return LEVEL_2;
      case 3: return LEVEL_3;
      case 4: return LEVEL_4;
      case 5: return LEVEL_5;
      case 6: return LEVEL_6;
      case 7: return LEVEL_7;
      case 8: return LEVEL_8;
      case 9: return LEVEL_9;
      case 10: return LEVEL_10;
      case 11: return LEVEL_11;
      case 12: return LEVEL_12;
      default: return LEVEL_1;
    }
  };

  const level: LevelData = getLevelData(levelId);
  const [unlockedMissions, setUnlockedMissions] = useState<number[]>(getUnlockedMissions(levelId));
  const [completedMissions, setCompletedMissions] = useState<number[]>(getCompletedMissions(levelId));

  useEffect(() => {
    // Refresh unlocked and completed missions whenever we return to this screen
    setUnlockedMissions(getUnlockedMissions(levelId));
    setCompletedMissions(getCompletedMissions(levelId));
  }, [levelId]);

  const isMissionUnlocked = (missionIndex: number): boolean => {
    return unlockedMissions.includes(missionIndex);
  };

  const isMissionCompleted = (missionIndex: number): boolean => {
    return completedMissions.includes(missionIndex);
  };

  // Determine theme colors based on level theme
  const getThemeColors = () => {
    switch(level.theme) {
      case 'VAPORWAVE':
        return {
          accent: 'text-neon-purple',
          border: 'border-neon-purple',
          bg: 'bg-neon-purple/10',
          hover: 'hover:border-neon-purple'
        };
      case 'CARTOON':
        return {
          accent: 'text-neon-yellow',
          border: 'border-neon-yellow',
          bg: 'bg-neon-yellow/10',
          hover: 'hover:border-neon-yellow'
        };
      case 'BLUEPRINT':
        return {
          accent: 'text-blue-400',
          border: 'border-blue-400',
          bg: 'bg-blue-400/10',
          hover: 'hover:border-blue-400'
        };
      case 'FRACTAL':
        return {
          accent: 'text-green-400',
          border: 'border-green-400',
          bg: 'bg-green-400/10',
          hover: 'hover:border-green-400'
        };
      case 'CHRONO':
        return {
          accent: 'text-amber-400',
          border: 'border-amber-400',
          bg: 'bg-amber-400/10',
          hover: 'hover:border-amber-400'
        };
      case 'VAULT':
        return {
          accent: 'text-yellow-600',
          border: 'border-yellow-600',
          bg: 'bg-yellow-600/10',
          hover: 'hover:border-yellow-600'
        };
      case 'DRAGON':
        return {
          accent: 'text-red-500',
          border: 'border-red-500',
          bg: 'bg-red-500/10',
          hover: 'hover:border-red-500'
        };
      case 'KERNEL':
        return {
          accent: 'text-orange-500',
          border: 'border-orange-500',
          bg: 'bg-orange-500/10',
          hover: 'hover:border-orange-500'
        };
      case 'SHARD':
        return {
          accent: 'text-cyan-200',
          border: 'border-cyan-200',
          bg: 'bg-cyan-200/10',
          hover: 'hover:border-cyan-200'
        };
      case 'CORE':
        return {
          accent: 'text-white',
          border: 'border-white',
          bg: 'bg-white/10',
          hover: 'hover:border-white'
        };
      case 'ARCHITECT':
        return {
          accent: 'text-yellow-100',
          border: 'border-white',
          bg: 'bg-white/5',
          hover: 'hover:border-yellow-100'
        };
      default: // CYBERPUNK
        return {
          accent: 'text-neon-cyan',
          border: 'border-neon-cyan',
          bg: 'bg-neon-cyan/10',
          hover: 'hover:border-neon-cyan'
        };
    }
  };

  const theme = getThemeColors();

  return (
    <div className="relative min-h-screen w-full bg-void-dark text-white overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 p-6 md:p-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex-1">
            <GlitchText text={level.title} as="h1" className={`text-4xl md:text-6xl ${theme.accent} mb-2`} />
            <p className="text-gray-400 font-mono text-sm">{level.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block min-w-[200px]">
              <StabilityIndicator size="small" levelId={levelId} />
            </div>
            <HoloButton onClick={onBack} variant="ghost" className="px-6 py-2 text-sm">
              BACK TO LEVELS
            </HoloButton>
          </div>
        </header>

        {/* Mission List */}
        <div className="mb-6">
          <h2 className="font-mono text-neon-cyan/50 text-sm mb-6 uppercase tracking-widest border-b border-neon-cyan/20 pb-2">
            Available Missions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {level.missions.map((mission, index) => {
              const unlocked = isMissionUnlocked(index);
              const completed = isMissionCompleted(index);
              const isBoss = mission.id.includes("BOSS");
              const missionNumber = index + 1;

              return (
                <div
                  key={mission.id}
                  className={`
                    bg-void-panel border rounded-lg p-5 transition-all
                    ${unlocked 
                      ? `${theme.border} ${theme.hover} hover:-translate-y-1 cursor-pointer` 
                      : 'border-gray-800 opacity-60 cursor-not-allowed'
                    }
                    ${isBoss ? 'border-2' : ''}
                    ${completed ? 'bg-green-500/5 border-green-500/30' : ''}
                  `}
                  onClick={() => unlocked && onSelectMission(index)}
                >
                  {/* Mission Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isBoss ? (
                        <span className="text-2xl">☠</span>
                      ) : (
                        <span className={`font-mono text-lg ${unlocked ? theme.accent : 'text-gray-600'}`}>
                          {missionNumber.toString().padStart(2, '0')}
                        </span>
                      )}
                      {isBoss && (
                        <span className="text-xs font-mono text-red-500 bg-red-500/10 px-2 py-1 rounded">
                          BOSS
                        </span>
                      )}
                      {completed && (
                        <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">
                          ✓ COMPLETE
                        </span>
                      )}
                    </div>
                    {!unlocked && (
                      <span className="text-2xl text-gray-600">🔒</span>
                    )}
                    {unlocked && !completed && (
                      <span className="text-xs text-gray-500">●</span>
                    )}
                  </div>

                  {/* Mission Title */}
                  <h3 className={`text-lg font-display font-bold mb-2 ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                    {mission.title}
                  </h3>

                  {/* Mission Objective Preview */}
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {mission.objective}
                  </p>

                  {/* Mission Status */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${
                      completed ? 'text-green-400' : 
                      unlocked ? 'text-blue-400' : 
                      'text-gray-600'
                    }`}>
                      {completed ? 'COMPLETED' : unlocked ? 'AVAILABLE' : 'LOCKED'}
                    </span>
                    {unlocked && (
                      <HoloButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMission(index);
                        }}
                        variant="primary"
                        className="text-xs py-1 px-3"
                      >
                        {completed ? 'REPLAY' : 'START'}
                      </HoloButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


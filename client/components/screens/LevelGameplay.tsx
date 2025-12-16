import React, { useState, useEffect } from 'react';
import { LevelData, Mission } from '../../types';
import { LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10, LEVEL_11, LEVEL_12 } from '../../data/levels';
import { executeQuery } from '../../utils/sqlEngine';
import { unlockNextLevel } from '../../utils/levelUnlock';
import { getUnlockedMissions, unlockNextMission, markMissionCompleted, getCompletedMissions } from '../../utils/missionUnlock';
import { awardMissionReward, awardLevelCompletionBonus, getPlayerStats, getLevelStability } from '../../utils/playerStats';
import { SqlTerminal } from '../ui/SqlTerminal';
import { DataGrid } from '../ui/DataGrid';
import { HoloButton } from '../ui/HoloButton';
import { StabilityIndicator } from '../ui/StabilityIndicator';

interface LevelGameplayProps {
  levelId: number;
  missionIndex?: number; // Optional: start at specific mission, defaults to 0
  onExit: () => void;
}

const SuccessOverlay: React.FC<{ 
  message: string; 
  onNext: () => void; 
  isLast: boolean;
  xpReward: number;
  stabilityReward: number;
  isReplay?: boolean;
}> = ({ message, onNext, isLast, xpReward, stabilityReward, isReplay = false }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="w-full max-w-lg mx-4 border-2 border-neon-cyan bg-void-panel relative overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.3)]">
      {/* Animated background strip */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(0,243,255,0.1),transparent)] animate-pulse"></div>
      
      <div className="relative z-10 p-8 flex flex-col items-center text-center gap-6">
         <h2 className="text-4xl md:text-5xl font-display font-black italic text-white drop-shadow-[0_0_10px_rgba(0,243,255,0.8)] animate-pulse tracking-widest">
           {isReplay ? "MISSION REPLAY" : "MISSION COMPLETE"}
         </h2>
         
         <div className="h-px w-3/4 bg-gradient-to-r from-transparent via-neon-cyan to-transparent"></div>
         
         <p className="font-mono text-neon-yellow text-lg md:text-xl leading-relaxed">
           {message}
         </p>

         {isReplay ? (
           <div className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded text-xs font-mono text-gray-400">
             Mission already completed. No rewards awarded for replay.
           </div>
         ) : (
           <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
               <div className="flex-1 min-w-[120px] text-xs font-mono text-neon-cyan border border-neon-cyan/50 bg-neon-cyan/10 px-4 py-2 rounded flex flex-col gap-1">
                  <span className="text-gray-400">XP REWARD</span>
                  <span className="font-bold text-lg">+{xpReward} XP</span>
               </div>
               <div className="flex-1 min-w-[120px] text-xs font-mono text-neon-purple border border-neon-purple/50 bg-neon-purple/10 px-4 py-2 rounded flex flex-col gap-1">
                  <span className="text-gray-400">SYSTEM STABILITY</span>
                  <span className="font-bold text-lg">+{stabilityReward}%</span>
               </div>
           </div>
         )}

         <HoloButton onClick={onNext} className="w-full mt-6 text-lg py-4 animate-bounce">
           {isLast ? "SECTOR CLEARED >>" : "NEXT MISSION >>"}
         </HoloButton>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-neon-pink"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-neon-pink"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-neon-pink"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-neon-pink"></div>
    </div>
  </div>
);

// --- MISSION MAP COMPONENT ---
const MissionMap: React.FC<{ 
  missions: Mission[]; 
  currentIndex: number; 
  unlockedIndex: number; 
  onSelect: (index: number) => void; 
}> = ({ missions, currentIndex, unlockedIndex, onSelect }) => {
  return (
    <div className="mb-6 p-4 bg-black/40 border border-white/10 rounded-lg relative overflow-hidden">
      {/* Background Grid for Map */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">SECTOR MAP</span>
        <span className="text-xs font-mono text-neon-cyan">{currentIndex + 1} / {missions.length}</span>
      </div>

      <div className="relative z-10 flex flex-wrap gap-2">
         {missions.map((m, idx) => {
           const isLocked = idx > unlockedIndex;
           const isActive = idx === currentIndex;
           const isCompleted = idx < unlockedIndex;
           const isBoss = m.id.includes("BOSS");

           return (
             <button
               key={m.id}
               disabled={isLocked}
               onClick={() => onSelect(idx)}
               title={m.title}
               className={`
                 relative w-8 h-8 flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300
                 border clip-path-slant
                 ${isActive 
                    ? 'border-neon-cyan bg-neon-cyan/20 text-white shadow-[0_0_15px_rgba(0,243,255,0.6)] scale-110 z-10' 
                    : ''}
                 ${isCompleted && !isActive 
                    ? 'border-green-500/50 text-green-500 bg-green-500/10 hover:bg-green-500/20' 
                    : ''}
                 ${isLocked 
                    ? 'border-gray-800 text-gray-700 bg-black/50 cursor-not-allowed' 
                    : 'cursor-pointer'}
                 ${isBoss && !isLocked && !isCompleted ? 'border-red-500 text-red-500 animate-pulse' : ''}
               `}
             >
               {isActive && <div className="absolute inset-0 bg-white/10 animate-ping rounded-full opacity-20"></div>}
               {isBoss ? '☠' : idx + 1}
             </button>
           );
         })}
      </div>
      
      {/* Active Mission Title Display */}
      <div className="mt-3 pt-3 border-t border-white/10">
         <div className="text-[10px] font-mono text-gray-400 uppercase">ACTIVE NODE</div>
         <div className={`text-sm font-display font-bold truncate ${currentIndex > unlockedIndex ? 'text-gray-600' : 'text-neon-cyan'}`}>
            {missions[currentIndex].title}
         </div>
      </div>
    </div>
  );
};

export const LevelGameplay: React.FC<LevelGameplayProps> = ({ levelId, missionIndex: initialMissionIndex = 0, onExit }) => {
  // Load correct level data
  const getLevelData = (id: number) => {
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
  }
  const level: LevelData = getLevelData(levelId);

  const [missionIndex, setMissionIndex] = useState(initialMissionIndex);
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(() => {
    // Initialize with unlocked missions from localStorage
    const unlocked = getUnlockedMissions(levelId);
    return Math.max(...unlocked, 0);
  });
  
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [missionComplete, setMissionComplete] = useState(false);
  const [isBoss, setIsBoss] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [missionRewards, setMissionRewards] = useState<{ xp: number; stability: number } | null>(null);
  const [wasLevelCompleteBeforeCurrentMission, setWasLevelCompleteBeforeCurrentMission] = useState<boolean>(false);

  const currentMission: Mission = level.missions[missionIndex];
  
  // Resolve tables: support multi-table missions or fallback to single
  const availableTables = currentMission.tables || (currentMission.table ? [currentMission.table] : []);

  useEffect(() => {
    // Reset state on mission change
    setQueryResult(null);
    setError(null);
    setFeedback(null);
    setMissionComplete(false);
    setIsBoss(currentMission.id.includes("BOSS"));
    setShowHint(false);
    setMissionRewards(null);
    setWasLevelCompleteBeforeCurrentMission(false);
  }, [missionIndex, currentMission]);

  const handleExecute = (code: string) => {
    if (isExecuting) return;
    
    setError(null);
    setFeedback(null);
    setIsExecuting(true);
    
    // Slight artificial delay for "processing" feel
    setTimeout(() => {
      // Pass all available tables to the engine
      const result = executeQuery(code, availableTables);
      setIsExecuting(false);
      
      if (result.success) {
        setQueryResult(result.data || []);
        
        // Validate against mission objectives
        const isSuccess = currentMission.expectedResult(result.data || []);
        if (isSuccess) {
           setMissionComplete(true);
           setFeedback(currentMission.successMessage);
           
           // Check if mission was already completed BEFORE marking it
           const completedMissionsBefore = getCompletedMissions(levelId);
           const isAlreadyCompleted = completedMissionsBefore.includes(missionIndex);
           
           // Check if level was already complete BEFORE marking this mission
           // This is important for the final mission to correctly detect first-time level completion
           const wasLevelAlreadyComplete = completedMissionsBefore.length >= level.missions.length;
           
           // Store this state for use in nextMission() when checking level completion bonus
           setWasLevelCompleteBeforeCurrentMission(wasLevelAlreadyComplete);
           
           // Mark mission as completed (this is idempotent - won't duplicate)
           markMissionCompleted(levelId, missionIndex);
           
           // Only award XP and stability if this is the first time completing this mission
           if (!isAlreadyCompleted) {
             const rewards = awardMissionReward(levelId, missionIndex, level.missions.length, isBoss);
             setMissionRewards(rewards);
           } else {
             // Show zero rewards for replay
             setMissionRewards({ xp: 0, stability: 0 });
           }
           
           // Unlock next mission immediately upon success
           if (missionIndex + 1 > maxUnlockedIndex && missionIndex + 1 < level.missions.length) {
              setMaxUnlockedIndex(missionIndex + 1);
              unlockNextMission(levelId, missionIndex);
           }
        } else {
           setFeedback("QUERY EXECUTED BUT REALITY IS STILL UNSTABLE. CHECK OBJECTIVES.");
        }
      } else {
        setQueryResult(null);
        setError(result.error || "UNKNOWN ERROR");
      }
    }, 600);
  };

  const nextMission = () => {
    const nextIdx = missionIndex + 1;
    if (nextIdx < level.missions.length) {
      if (nextIdx > maxUnlockedIndex) {
        setMaxUnlockedIndex(nextIdx);
        unlockNextMission(levelId, missionIndex);
      }
      setMissionIndex(nextIdx);
    } else {
      // Level Complete - use the state we stored BEFORE marking the mission as completed
      // This correctly detects if the level was already complete before this mission
      const wasLevelAlreadyComplete = wasLevelCompleteBeforeCurrentMission;
      
      // Only award completion bonus if this is the first time completing the level
      if (!wasLevelAlreadyComplete) {
        awardLevelCompletionBonus(levelId);
      }
      
      unlockNextLevel(levelId);
      onExit();
    }
  };

  const handleSelectMission = (index: number) => {
    if (index <= maxUnlockedIndex) {
      setMissionIndex(index);
    }
  };

  // Determine styles based on theme
  let themeAccent = 'text-neon-cyan';
  let themeBorder = 'border-neon-cyan';
  let themeBg = 'bg-neon-cyan/10';

  if (level.theme === 'VAPORWAVE') {
      themeAccent = 'text-neon-purple';
      themeBorder = 'border-neon-purple';
      themeBg = 'bg-neon-purple/10';
  } else if (level.theme === 'CYBERPUNK' && levelId === 3) {
      themeAccent = 'text-neon-yellow';
      themeBorder = 'border-neon-yellow';
      themeBg = 'bg-neon-yellow/10';
  } else if (level.theme === 'BLUEPRINT') {
      themeAccent = 'text-blue-400';
      themeBorder = 'border-blue-400';
      themeBg = 'bg-blue-400/10';
  } else if (level.theme === 'FRACTAL') {
      themeAccent = 'text-green-400';
      themeBorder = 'border-green-400';
      themeBg = 'bg-green-400/10';
  } else if (level.theme === 'CHRONO') {
      themeAccent = 'text-amber-400';
      themeBorder = 'border-amber-400';
      themeBg = 'bg-amber-400/10';
  } else if (level.theme === 'VAULT') {
      themeAccent = 'text-yellow-600';
      themeBorder = 'border-yellow-600';
      themeBg = 'bg-yellow-600/10';
  } else if (level.theme === 'DRAGON') {
      themeAccent = 'text-red-500';
      themeBorder = 'border-red-500';
      themeBg = 'bg-red-500/10';
  } else if (level.theme === 'KERNEL') {
      themeAccent = 'text-orange-500';
      themeBorder = 'border-orange-500';
      themeBg = 'bg-orange-500/10';
  } else if (level.theme === 'SHARD') {
      themeAccent = 'text-cyan-200';
      themeBorder = 'border-cyan-200';
      themeBg = 'bg-cyan-200/10';
  } else if (level.theme === 'CORE') {
      themeAccent = 'text-white';
      themeBorder = 'border-white';
      themeBg = 'bg-white/10';
  } else if (level.theme === 'ARCHITECT') {
      themeAccent = 'text-yellow-100';
      themeBorder = 'border-yellow-100';
      themeBg = 'bg-white/20';
  }

  return (
    <div className={`relative flex flex-col h-screen w-full bg-void-dark text-white overflow-hidden ${isBoss ? 'border-[4px] border-red-600 animate-pulse' : ''}`}>
      
      {/* SUCCESS OVERLAY */}
      {missionComplete && missionRewards && (
        <SuccessOverlay 
          message={feedback || "Mission Complete"} 
          onNext={nextMission} 
          isLast={missionIndex === level.missions.length - 1}
          xpReward={missionRewards.xp}
          stabilityReward={missionRewards.stability}
          isReplay={missionRewards.xp === 0 && missionRewards.stability === 0}
        />
      )}

      {/* Top Bar */}
      <header className="flex-none h-auto border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-3 bg-void-panel/80 backdrop-blur z-20 gap-3">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex flex-col">
             <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">CURRENT SECTOR</div>
             <div className={`font-display text-xl ${isBoss ? 'text-red-500 glitch-text' : themeAccent}`} data-text={level.title}>
               {level.title}
             </div>
          </div>
          {isBoss && <div className="bg-red-600 text-black font-bold px-3 py-1 text-xs animate-pulse rounded-full">BOSS BATTLE ACTIVE</div>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <StabilityIndicator size="small" showLabel={false} levelId={levelId} />
          </div>
          <HoloButton onClick={onExit} variant="ghost" className="px-4 py-1 text-xs">BACK TO MISSIONS</HoloButton>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left: Briefing & Schema */}
        <div className="w-1/3 min-w-[350px] bg-black/20 border-r border-white/10 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
           
           {/* MISSION MAP WIDGET */}
           <MissionMap 
              missions={level.missions} 
              currentIndex={missionIndex} 
              unlockedIndex={maxUnlockedIndex}
              onSelect={handleSelectMission}
           />

           {/* Briefing Card */}
           <div className={`p-5 rounded-lg border shadow-lg ${isBoss ? 'border-red-500/50 bg-red-900/10' : `${themeBorder}/30 ${themeBg.replace('10', '5')}`}`}>
             <h3 className="font-mono text-xs uppercase text-gray-400 mb-3 flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${isBoss ? 'bg-red-500' : themeBg.replace('/10', '')} animate-pulse`}></span>
               Mission Briefing
             </h3>
             <div className="font-mono text-white mb-6 text-sm leading-relaxed whitespace-pre-wrap text-gray-200">
               {currentMission.story}
             </div>
             <div className="p-4 bg-black/40 border-l-4 border-neon-yellow rounded-r">
               <div className="text-xs text-neon-yellow mb-1 font-bold tracking-wider">MISSION GOAL</div>
               <div className="text-sm font-bold">{currentMission.objective}</div>
             </div>
             
             {currentMission.hint && (
                <div className="mt-4">
                  {!showHint ? (
                    <HoloButton onClick={() => setShowHint(true)} variant="ghost" className="w-full text-xs py-2 opacity-50 hover:opacity-100 border-dashed">
                      REQUEST HINT_PROTOCOL (?)
                    </HoloButton>
                  ) : (
                    <div className="text-xs text-neon-yellow font-mono bg-yellow-900/20 p-3 rounded border border-yellow-500/30 animate-in fade-in slide-in-from-top-2">
                       <div className="flex justify-between items-start mb-2 border-b border-yellow-500/20 pb-1">
                         <span className="font-bold tracking-widest">HINT_SYSTEM_V1</span>
                         <button onClick={() => setShowHint(false)} className="hover:text-white text-yellow-500 font-bold">CLOSE [x]</button>
                       </div>
                       {currentMission.hint}
                    </div>
                  )}
                </div>
             )}
           </div>

           {/* Schema Card(s) - Now loops through available tables */}
           <div className="flex flex-col gap-4">
             <h3 className="font-mono text-xs uppercase text-gray-400">Available Schemas</h3>
             {availableTables.map((t) => (
               <DataGrid key={t.name} data={t.data} title={`TABLE: ${t.name} (PREVIEW)`} className="opacity-90 scale-100 w-full shadow-lg" />
             ))}
           </div>

        </div>

        {/* Right: Terminal & Results */}
        <div className="flex-1 flex flex-col p-6 gap-6 bg-gradient-to-br from-void-dark to-void-panel">
           
           {/* Code Editor */}
           <div className="flex-1 min-h-[40%] flex flex-col">
             <div className="flex justify-between items-end mb-2 px-1">
                <label className={`text-xs font-mono ${themeAccent}`}>TERMINAL INPUT</label>
                {isExecuting && <span className="text-xs font-mono text-neon-yellow animate-pulse">EXECUTING...</span>}
             </div>
             <div className="flex-1 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
               <SqlTerminal 
                 key={`terminal-${levelId}-${missionIndex}`}
                 onExecute={handleExecute} 
                 isExecuting={isExecuting} 
               />
             </div>
           </div>

           {/* Feedback Area */}
           <div className="h-[45%] flex flex-col">
              <label className="text-xs font-mono text-gray-500 mb-2 px-1">QUERY OUTPUT STREAM</label>
              
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-400 font-mono mb-4 rounded flex items-start gap-3 animate-in slide-in-from-bottom-2">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <div className="font-bold text-xs uppercase mb-1">Syntax Error</div>
                    {error}
                  </div>
                </div>
              )}
              
              {/* Soft Feedback (Non-Success) */}
              {feedback && !missionComplete && !error && (
                <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 text-yellow-200 font-mono mb-4 rounded animate-in slide-in-from-bottom-2">
                   {feedback}
                </div>
              )}

              {/* Results Table */}
              <div className="flex-1 overflow-auto bg-black border border-white/20 rounded shadow-inner">
                 {queryResult ? (
                   <DataGrid data={queryResult} title="LIVE RESULT SET" className="h-full border-0 rounded-none w-full" />
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-gray-700 font-mono text-sm gap-2">
                     <div className="w-8 h-8 border-2 border-gray-800 border-t-gray-600 rounded-full animate-spin"></div>
                     WAITING FOR INPUT...
                   </div>
                 )}
              </div>
           </div>

        </div>

      </div>

    </div>
  );
};
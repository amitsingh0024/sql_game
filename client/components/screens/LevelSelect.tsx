import React, { useState, useEffect } from 'react';
import { HoloButton } from '../ui/HoloButton';
import { GlitchText } from '../ui/GlitchText';
import { StabilityIndicator } from '../ui/StabilityIndicator';
import { GlitchReport, SquadMember } from '../../types';
import { getPlayerStats, getRankProgress, getLevelStability } from '../../utils/playerStats';

interface LevelSelectProps {
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
  unlockedLevels: number[];
}

const SQUAD_DATA: SquadMember[] = [
  { name: 'Viper', role: 'Lead Architect', status: 'ONLINE', avatarColor: 'bg-neon-yellow' },
  { name: 'Glitch', role: 'Security Ops', status: 'IN_COMBAT', avatarColor: 'bg-neon-pink' },
  { name: 'Null', role: 'Data Void', status: 'OFFLINE', avatarColor: 'bg-gray-500' },
];

// Static glitch report - can be manually updated when deploying missions
const DEFAULT_GLITCH_REPORT: GlitchReport = {
  id: "ANOMALY-X99",
  dimension: "THE NULL VOID",
  severity: "CRITICAL",
  technicalFault: "Missing WHERE clause in deletion logic.",
  manifestation: "Everything in the city is slowly turning into the color beige.",
  flavor: "It's super boring and literally erasing personalities."
};

export const LevelSelect: React.FC<LevelSelectProps> = ({ onBack, onSelectLevel, unlockedLevels }) => {
  // Use static glitch report - can be updated manually when deploying
  const [activeAnomaly] = useState<GlitchReport | null>(DEFAULT_GLITCH_REPORT);
  const [playerStats, setPlayerStats] = useState(getPlayerStats());
  const [rankProgress, setRankProgress] = useState(getRankProgress(playerStats.powerLevel));

  // Refresh stats when component mounts or when returning to this screen
  useEffect(() => {
    const stats = getPlayerStats();
    setPlayerStats(stats);
    setRankProgress(getRankProgress(stats.powerLevel));
  }, [unlockedLevels]); // Refresh when unlockedLevels changes (after completing missions)

  const isLevelUnlocked = (levelId: number): boolean => {
    return unlockedLevels.includes(levelId);
  };


  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-void-dark">
      {/* Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

      {/* LEFT SIDEBAR: Squad & Stats */}
      <div className="w-full md:w-64 bg-void-panel border-r border-white/10 p-6 flex flex-col gap-8 z-10 relative">
         <div>
            <h3 className="text-neon-cyan font-display text-xl mb-4 tracking-widest">SQUAD_LINK</h3>
            <div className="flex flex-col gap-3">
              {SQUAD_DATA.map((member) => (
                <div key={member.name} className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5">
                   <div className={`w-8 h-8 rounded-full ${member.avatarColor} opacity-80 shadow-[0_0_10px_currentColor]`} />
                   <div>
                     <div className="font-bold font-mono text-sm text-white">{member.name}</div>
                     <div className={`text-[10px] font-mono ${member.status === 'ONLINE' ? 'text-green-400' : member.status === 'IN_COMBAT' ? 'text-red-400' : 'text-gray-500'}`}>
                       {member.status}
                     </div>
                   </div>
                </div>
              ))}
            </div>
         </div>

         <div className="border-t border-white/10 pt-6">
            <h3 className="text-neon-cyan font-display text-xl mb-4 tracking-widest">YOU</h3>
            <div className="bg-black/40 p-3 rounded border border-neon-cyan/30">
               <div className="text-xs text-gray-400 font-mono mb-1">CURRENT RANK</div>
               <div className="text-lg text-white font-bold font-display">{playerStats.rank}</div>
               <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-neon-cyan transition-all duration-500" 
                   style={{ 
                     width: rankProgress.max === Infinity 
                       ? '100%' 
                       : `${(rankProgress.current / rankProgress.max) * 100}%` 
                   }} 
                 />
               </div>
               <div className="text-[10px] text-right text-neon-cyan mt-1">
                 XP: {rankProgress.current}{rankProgress.max !== Infinity ? `/${rankProgress.max}` : '+'} 
                 {rankProgress.nextRank && ` → ${rankProgress.nextRank}`}
               </div>
            </div>
            <div className="mt-4 text-xs font-mono text-gray-500 italic">
               "Dormant power detected. Complete rifts to awaken."
            </div>
         </div>
      </div>
      
      {/* MAIN CONTENT: Multiverse Map */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <span className="animate-ping w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-red-500 font-mono text-xs tracking-widest">CRITICAL ALERTS ACTIVE</span>
             </div>
             <GlitchText text="MULTIVERSE MONITOR" as="h2" className="text-4xl md:text-6xl text-white" />
          </div>
          <HoloButton onClick={onBack} variant="ghost" className="px-6 py-2 text-sm">
            DISCONNECT
          </HoloButton>
        </header>

        {/* Hero Anomaly Card */}
        {activeAnomaly && (
          <div className="mb-12 border-2 border-neon-pink bg-black/40 p-6 md:p-8 rounded-xl relative overflow-hidden group">
            {/* Animated Striped Background */}
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ff00ff_10px,#ff00ff_20px)]" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8">
               <div className="flex-1">
                  <div className="inline-block bg-neon-pink text-black font-bold px-2 py-0.5 text-xs font-mono mb-2">
                    PRIORITY TARGET
                  </div>
                  <h3 className="text-3xl font-display text-white mb-2">{activeAnomaly.dimension}</h3>
                  <p className="text-neon-pink font-mono text-lg mb-4">{activeAnomaly.manifestation}</p>
                  
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded font-mono text-sm text-red-300 mb-4">
                     <span className="font-bold text-red-500">ROOT CAUSE:</span> {activeAnomaly.technicalFault}
                  </div>
                  
                  <p className="text-gray-400 italic text-sm border-l-2 border-gray-600 pl-3">
                    "{activeAnomaly.flavor}"
                  </p>
               </div>
               <div className="flex items-end">
                  <HoloButton onClick={() => onSelectLevel(999)} variant="danger" className="w-full md:w-auto">
                    INITIATE PATCH
                  </HoloButton>
               </div>
            </div>
          </div>
        )}

        {/* Dimensions / Levels */}
        <h4 className="font-mono text-neon-cyan/50 text-sm mb-6 uppercase tracking-widest border-b border-neon-cyan/20 pb-2">Available Dimensions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Level 1: The Null Void */}
           {(() => {
             const unlocked = isLevelUnlocked(1);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-neon-cyan' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,243,255,0.2),transparent)]" />
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-10 group-hover:text-neon-cyan/40 transition-colors">
                   NULL
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-neon-cyan' : 'text-gray-600'} transition-colors`}>DIMENSION 01</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: DATA DISTRICT</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Data is vanishing. Learn <span className="text-neon-cyan">SELECT</span> to retrieve lost objects.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(1)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

           {/* Level 2: Link City */}
           {(() => {
             const unlocked = isLevelUnlocked(2);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-neon-purple' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(188,19,254,0.1),transparent)]" />
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-neon-purple/40 transition-colors">
                   LINK
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-neon-purple/40 transition-colors">
                   CITY
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-neon-purple' : 'text-gray-600'} transition-colors`}>DIMENSION 02</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: LINK CITY</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Bridges are broken. Use <span className="text-neon-purple">JOIN</span> to reconnect the islands.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(2)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-neon-purple border-neon-purple hover:bg-neon-purple hover:text-white ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}
           
           {/* Level 3: Marketverse */}
           {(() => {
             const unlocked = isLevelUnlocked(3);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-neon-yellow' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(250,255,0,0.1),transparent)]" />
                  {/* Floating Bars Graphic */}
                 <div className="absolute bottom-2 left-4 w-4 h-10 bg-white/10 group-hover:bg-neon-yellow/50 transition-colors"></div>
                 <div className="absolute bottom-2 left-10 w-4 h-16 bg-white/10 group-hover:bg-neon-yellow/70 transition-colors"></div>
                 <div className="absolute bottom-2 left-16 w-4 h-8 bg-white/10 group-hover:bg-neon-yellow/40 transition-colors"></div>
                 
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-neon-yellow/40 transition-colors">
                   MARKET
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-neon-yellow' : 'text-gray-600'} transition-colors`}>DIMENSION 03</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: MARKETVERSE</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Economic collapse. Use <span className="text-neon-yellow">GROUP BY</span> to calculate true totals.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(3)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-neon-yellow border-neon-yellow hover:bg-neon-yellow hover:text-black ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

           {/* Level 4: Census Core */}
           {(() => {
             const unlocked = isLevelUnlocked(4);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-blue-400' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_19px,rgba(96,165,250,0.1)_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,rgba(96,165,250,0.1)_20px)]" />
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-blue-400/40 transition-colors">
                   CENSUS
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-blue-400/40 transition-colors">
                   CORE
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-blue-400' : 'text-gray-600'} transition-colors`}>DIMENSION 04</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: CENSUS CORE</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Structural failure. Use <span className="text-blue-400">SCHEMA DESIGN</span> to purge redundancy.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(4)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

           {/* Level 5: Warpspace */}
           {(() => {
             const unlocked = isLevelUnlocked(5);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-green-400' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.2),transparent_70%)]" />
                 {/* Fractal Circles */}
                 <div className="absolute center w-20 h-20 border-2 border-green-500/30 rounded-full top-6 left-[calc(50%-2.5rem)] animate-pulse" />
                 <div className="absolute center w-12 h-12 border-2 border-green-500/50 rounded-full top-10 left-[calc(50%-1.5rem)] animate-ping" />
                 
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-green-400/40 transition-colors">
                   WARP
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-green-400/40 transition-colors">
                   SPACE
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-green-400' : 'text-gray-600'} transition-colors`}>DIMENSION 05</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: WARPSPACE</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Reality is recursive. Use <span className="text-green-400">SUBQUERIES</span> to see inside deeper layers.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(5)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-green-400 border-green-400 hover:bg-green-400 hover:text-black ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

           {/* Level 6: Time Labyrinth */}
           {(() => {
             const unlocked = isLevelUnlocked(6);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-amber-400' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(251,191,36,0.2),transparent)] animate-spin-slow" />
                 {/* Clock Face elements */}
                 <div className="absolute center w-24 h-24 border border-amber-500/30 rounded-full top-4 left-[calc(50%-3rem)]" />
                 <div className="absolute center w-1 h-10 bg-amber-500/50 top-11 left-[calc(50%-0.125rem)] transform -translate-y-1/2 rotate-45 origin-bottom" />
                 <div className="absolute center w-1 h-8 bg-amber-500/50 top-13 left-[calc(50%-0.125rem)] transform -translate-y-1/2 -rotate-12 origin-bottom" />
                 
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-amber-400/40 transition-colors">
                   TIME
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-amber-400/40 transition-colors">
                   MAZE
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-amber-400' : 'text-gray-600'} transition-colors`}>DIMENSION 06</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: TIME LABYRINTH</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Time is shifting. Use <span className="text-amber-400">WINDOW FUNCTIONS</span> to restore sequence order.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(6)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

           {/* Level 7: The Vault */}
           {(() => {
             const unlocked = isLevelUnlocked(7);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-yellow-600' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(202,138,4,0.1) 25%,transparent 25%),linear-gradient(225deg,rgba(202,138,4,0.1) 25%,transparent 25%),linear-gradient(45deg,rgba(202,138,4,0.1) 25%,transparent 25%),linear-gradient(315deg,rgba(202,138,4,0.1) 25%,transparent 25%)] bg-[length:20px_20px]" />
                 {/* Vault Lock */}
                 <div className="absolute center w-20 h-20 border-4 border-yellow-600/50 rounded-full top-6 left-[calc(50%-2.5rem)]" />
                 <div className="absolute center w-14 h-14 border-2 border-yellow-600/30 rounded-full top-9 left-[calc(50%-1.75rem)] animate-spin-slow" />
                 <div className="absolute center w-4 h-4 bg-yellow-600/80 rounded-full top-14 left-[calc(50%-0.5rem)]" />
                 
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-yellow-500/40 transition-colors">
                   THE
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-yellow-500/40 transition-colors">
                   VAULT
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-yellow-600' : 'text-gray-600'} transition-colors`}>DIMENSION 07</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: STABILITY VAULT</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Transactional integrity compromised. Use <span className="text-yellow-600">ACID PRINCIPLES</span> to lock reality.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(7)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-yellow-600 border-yellow-600 hover:bg-yellow-600 hover:text-black ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

           {/* Level 8: Dragon Machine */}
           {(() => {
             const unlocked = isLevelUnlocked(8);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-red-500' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(239,68,68,0.3),transparent_80%)]" />
                 {/* Gear Animation */}
                 <div className="absolute -right-4 -bottom-4 w-24 h-24 border-4 border-dashed border-red-500/30 rounded-full animate-spin-slow" />
                 <div className="absolute -left-4 top-4 w-16 h-16 border-4 border-dashed border-red-500/20 rounded-full animate-spin-reverse-slow" />
                 
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-red-500/40 transition-colors">
                   DRAGON
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-red-500/40 transition-colors">
                   ENGINE
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-red-500' : 'text-gray-600'} transition-colors`}>DIMENSION 08</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: DRAGON MACHINE</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Optimization logic failure. Use <span className="text-red-500">INDEXING</span> to speed up the engine.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(8)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-red-500 border-red-500 hover:bg-red-500 hover:text-black ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

           {/* Level 9: Underworld Kernel */}
           {(() => {
             const unlocked = isLevelUnlocked(9);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-orange-500' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(249,115,22,0.1)_0px,rgba(249,115,22,0.1)_10px,transparent_10px,transparent_20px)]" />
                 {/* Kernel Chips */}
                 <div className="absolute center w-16 h-16 bg-gray-800 border-2 border-orange-500/60 rounded top-8 left-[calc(50%-2rem)] shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    <div className="absolute top-1 left-1 w-2 h-2 bg-orange-500/80 rounded-full animate-pulse" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-orange-500/80 rounded-full animate-pulse delay-75" />
                 </div>
                 <div className="absolute center w-24 h-1 bg-orange-500/40 top-16 left-[calc(50%-3rem)]" />
                 
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-orange-500/40 transition-colors">
                   KERNEL
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-orange-500/40 transition-colors">
                   CORE
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-orange-500' : 'text-gray-600'} transition-colors`}>DIMENSION 09</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: UNDERWORLD KERNEL</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                System resources critical. Manage <span className="text-orange-500">MEMORY & CPU</span> to prevent collapse.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(9)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-black ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

           {/* Level 10: Shattered Universes */}
           {(() => {
             const unlocked = isLevelUnlocked(10);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-cyan-200' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(165,243,252,0.2),transparent)]" />
                 {/* Shard Animation */}
                 <div className="absolute center w-16 h-16 bg-white/5 border border-cyan-200/50 transform rotate-45 top-6 left-[calc(50%-2rem)] shadow-[0_0_20px_rgba(165,243,252,0.3)] animate-float" />
                 <div className="absolute center w-10 h-10 bg-white/5 border border-cyan-200/30 transform -rotate-12 top-14 left-[calc(50%-3rem)] animate-float delay-75" />
                 <div className="absolute center w-8 h-8 bg-white/5 border border-cyan-200/30 transform rotate-12 top-10 left-[calc(50%+1rem)] animate-float delay-150" />
                 
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-cyan-200/40 transition-colors">
                   SHATTERED
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-cyan-200/40 transition-colors">
                   REALMS
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-cyan-200' : 'text-gray-600'} transition-colors`}>DIMENSION 10</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: SHATTERED UNIVERSES</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Realms are split. Use <span className="text-cyan-200">SHARDING</span> and <span className="text-cyan-200">REPLICATION</span> to unite them.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(10)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-cyan-200 border-cyan-200 hover:bg-cyan-200 hover:text-black ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER RIFT' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}
           
           {/* Level 11: Glitchverse Core */}
           {(() => {
             const unlocked = isLevelUnlocked(11);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-white' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2),transparent_70%)]" />
                 {/* Core Animation */}
                 <div className="absolute center w-20 h-20 bg-white/10 rounded-full top-6 left-[calc(50%-2.5rem)] animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
                 <div className="absolute center w-full h-full border-t border-b border-white/10 animate-spin-slow" />
                 
                 <div className="absolute center text-4xl text-white/20 font-display font-bold w-full text-center top-8 group-hover:text-white/60 transition-colors">
                   GLITCH
                 </div>
                 <div className="absolute center text-4xl text-white/20 font-display font-bold w-full text-center top-12 left-2 group-hover:text-white/60 transition-colors">
                   CORE
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-gray-200' : 'text-gray-600'} transition-colors`}>DIMENSION 11</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: THE SOURCE</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                The final challenge. Unite all truth to become the <span className="text-white font-bold">ARCHITECT</span>.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(11)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-white border-white hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ENTER CORE' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

           {/* Level 12: Architect's Hall */}
           {(() => {
             const unlocked = isLevelUnlocked(12);
             return (
               <div className={`bg-void-panel border ${unlocked ? 'border-white/10 hover:border-yellow-200' : 'border-gray-800 opacity-60'} rounded-lg p-5 transition-all group ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed'}`}>
              <div className="h-32 mb-4 bg-white/5 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3),transparent)]" />
                 {/* Architect Geometry */}
                 <div className="absolute center w-16 h-16 border-2 border-white/60 transform rotate-45 top-8 left-[calc(50%-2rem)] shadow-[0_0_40px_rgba(255,255,255,0.5)] animate-float" />
                 <div className="absolute center w-12 h-12 border border-white/40 transform -rotate-12 top-10 left-[calc(50%-1.5rem)] animate-float delay-100" />
                 
                 <div className="absolute center text-4xl text-white/20 font-display font-bold w-full text-center top-8 group-hover:text-white/80 transition-colors">
                   ARCHITECT
                 </div>
                 <div className="absolute center text-4xl text-white/20 font-display font-bold w-full text-center top-12 left-2 group-hover:text-white/80 transition-colors">
                   HALL
                 </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-4xl text-gray-600">🔒</span>
                      </div>
                    )}
              </div>
                 <h4 className={`text-xl font-display ${unlocked ? 'text-white group-hover:text-yellow-100' : 'text-gray-600'} transition-colors`}>DIMENSION 12</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: CREATION HALL</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                The end is the beginning. Rewrite reality from scratch.
              </p>
                 <HoloButton 
                   onClick={() => unlocked && onSelectLevel(12)} 
                   variant="primary" 
                   className={`w-full text-sm py-2 text-yellow-100 border-white hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!unlocked}
                 >
                   {unlocked ? 'ASCEND' : 'LOCKED'}
              </HoloButton>
           </div>
             );
           })()}

        </div>
      </div>
    </div>
  );
};
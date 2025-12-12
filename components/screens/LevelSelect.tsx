import React, { useEffect, useState } from 'react';
import { HoloButton } from '../ui/HoloButton';
import { GlitchText } from '../ui/GlitchText';
import { generateGlitchReport } from '../../services/gemini';
import { GlitchReport, SquadMember } from '../../types';

interface LevelSelectProps {
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
}

const SQUAD_DATA: SquadMember[] = [
  { name: 'Viper', role: 'Lead Architect', status: 'ONLINE', avatarColor: 'bg-neon-yellow' },
  { name: 'Glitch', role: 'Security Ops', status: 'IN_COMBAT', avatarColor: 'bg-neon-pink' },
  { name: 'Null', role: 'Data Void', status: 'OFFLINE', avatarColor: 'bg-gray-500' },
];

export const LevelSelect: React.FC<LevelSelectProps> = ({ onBack, onSelectLevel }) => {
  const [activeAnomaly, setActiveAnomaly] = useState<GlitchReport | null>(null);

  useEffect(() => {
    generateGlitchReport().then(setActiveAnomaly);
  }, []);

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
               <div className="text-lg text-white font-bold font-display">NOVICE WEAVER</div>
               <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
                 <div className="w-[30%] h-full bg-neon-cyan" />
               </div>
               <div className="text-[10px] text-right text-neon-cyan mt-1">XP: 30/100</div>
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
           <div className="bg-void-panel border border-white/10 rounded-lg p-5 hover:border-neon-cyan transition-all group hover:-translate-y-1">
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,243,255,0.2),transparent)]" />
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-10 group-hover:text-neon-cyan/40 transition-colors">
                   NULL
                 </div>
              </div>
              <h4 className="text-xl font-display text-white group-hover:text-neon-cyan transition-colors">DIMENSION 01</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: DATA DISTRICT</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Data is vanishing. Learn <span className="text-neon-cyan">SELECT</span> to retrieve lost objects.
              </p>
              <HoloButton onClick={() => onSelectLevel(1)} variant="primary" className="w-full text-sm py-2">
                ENTER RIFT
              </HoloButton>
           </div>

           {/* Level 2: Link City */}
           <div className="bg-void-panel border border-white/10 rounded-lg p-5 hover:border-neon-purple transition-all group hover:-translate-y-1">
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(188,19,254,0.1),transparent)]" />
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-neon-purple/40 transition-colors">
                   LINK
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-neon-purple/40 transition-colors">
                   CITY
                 </div>
              </div>
              <h4 className="text-xl font-display text-white group-hover:text-neon-purple transition-colors">DIMENSION 02</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: LINK CITY</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Bridges are broken. Use <span className="text-neon-purple">JOIN</span> to reconnect the islands.
              </p>
              <HoloButton onClick={() => onSelectLevel(2)} variant="primary" className="w-full text-sm py-2 text-neon-purple border-neon-purple hover:bg-neon-purple hover:text-white">
                ENTER RIFT
              </HoloButton>
           </div>
           
           {/* Level 3: Marketverse */}
           <div className="bg-void-panel border border-white/10 rounded-lg p-5 hover:border-neon-yellow transition-all group hover:-translate-y-1">
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(250,255,0,0.1),transparent)]" />
                  {/* Floating Bars Graphic */}
                 <div className="absolute bottom-2 left-4 w-4 h-10 bg-white/10 group-hover:bg-neon-yellow/50 transition-colors"></div>
                 <div className="absolute bottom-2 left-10 w-4 h-16 bg-white/10 group-hover:bg-neon-yellow/70 transition-colors"></div>
                 <div className="absolute bottom-2 left-16 w-4 h-8 bg-white/10 group-hover:bg-neon-yellow/40 transition-colors"></div>
                 
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-neon-yellow/40 transition-colors">
                   MARKET
                 </div>
              </div>
              <h4 className="text-xl font-display text-white group-hover:text-neon-yellow transition-colors">DIMENSION 03</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: MARKETVERSE</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Economic collapse. Use <span className="text-neon-yellow">GROUP BY</span> to calculate true totals.
              </p>
              <HoloButton onClick={() => onSelectLevel(3)} variant="primary" className="w-full text-sm py-2 text-neon-yellow border-neon-yellow hover:bg-neon-yellow hover:text-black">
                ENTER RIFT
              </HoloButton>
           </div>

           {/* Level 4: Census Core */}
           <div className="bg-void-panel border border-white/10 rounded-lg p-5 hover:border-blue-400 transition-all group hover:-translate-y-1">
              <div className="h-32 mb-4 bg-gray-900 rounded relative overflow-hidden">
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_19px,rgba(96,165,250,0.1)_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,rgba(96,165,250,0.1)_20px)]" />
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-8 group-hover:text-blue-400/40 transition-colors">
                   CENSUS
                 </div>
                 <div className="absolute center text-4xl text-white/10 font-display font-bold w-full text-center top-12 left-2 group-hover:text-blue-400/40 transition-colors">
                   CORE
                 </div>
              </div>
              <h4 className="text-xl font-display text-white group-hover:text-blue-400 transition-colors">DIMENSION 04</h4>
              <div className="text-gray-400 font-mono text-xs mb-3">SECTOR: CENSUS CORE</div>
              <p className="text-sm text-gray-500 mb-4 h-10">
                Structural failure. Use <span className="text-blue-400">SCHEMA DESIGN</span> to purge redundancy.
              </p>
              <HoloButton onClick={() => onSelectLevel(4)} variant="primary" className="w-full text-sm py-2 text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black">
                ENTER RIFT
              </HoloButton>
           </div>
        </div>
      </div>
    </div>
  );
};
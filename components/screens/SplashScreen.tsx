import React, { useEffect, useState } from 'react';
import { GlitchText } from '../ui/GlitchText';
import { HoloButton } from '../ui/HoloButton';
import { generateSystemStatus } from '../../services/gemini';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [status, setStatus] = useState("INITIALIZING CONNECTION...");

  useEffect(() => {
    // Generate a flavor status text on mount
    generateSystemStatus().then(setStatus);
  }, []);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Content Container */}
      <div className="z-10 flex flex-col items-center gap-8 p-4 text-center">
        
        <div className="mb-4 flex items-center gap-2 rounded bg-neon-pink/20 px-4 py-1 font-mono text-sm text-neon-pink border border-neon-pink/50 backdrop-blur-md">
          <span className="animate-pulse">●</span> {status}
        </div>

        <div className="relative">
           {/* Decorative elements behind title */}
           <div className="absolute -left-12 -top-12 h-24 w-24 border-t-4 border-l-4 border-neon-yellow opacity-50" />
           <div className="absolute -right-12 -bottom-12 h-24 w-24 border-b-4 border-r-4 border-neon-cyan opacity-50" />
           
           <GlitchText 
             text="REALITY PATCH" 
             as="h1" 
             className="text-7xl md:text-9xl mb-2" 
             colorClass="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
           />
           <div className="flex justify-end">
             <span className="bg-neon-yellow text-black font-bold px-2 py-0.5 text-xl transform -rotate-3 font-glitch">
               SQL EDITION
             </span>
           </div>
        </div>

        <p className="max-w-md font-mono text-neon-cyan/80 md:text-lg bg-black/40 p-4 rounded border-l-2 border-neon-cyan">
          Warning: Reality integrity is critically low.
          SQL injection is now a feature, not a bug.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <HoloButton onClick={onStart} className="text-xl py-4 px-12 animate-pulse-fast">
            JACK IN
          </HoloButton>
          <p className="text-xs text-gray-500 font-mono mt-4">v.0.9.1-ALPHA // UNSTABLE BUILD</p>
        </div>
      </div>
      
      {/* Foreground Particles/Dust (Simulated with simple divs for now) */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-neon-purple/20 to-transparent" />
    </div>
  );
};
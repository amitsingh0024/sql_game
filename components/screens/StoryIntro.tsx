import React, { useState, useEffect, useRef } from 'react';
import { HoloButton } from '../ui/HoloButton';
import { GlitchText } from '../ui/GlitchText';

interface StoryIntroProps {
  onComplete: () => void;
}

const DIALOGUE = [
  { speaker: "SYSTEM", text: "CONNECTING TO SECURE CHANNEL...", type: "system" },
  { speaker: "VIPER", text: "Got a signal! Yo, Newbie! Can you hear me across the void?", type: "character", color: "text-neon-yellow" },
  { speaker: "VIPER", text: "We're the Reality Fixers. We patch the multiverse when the code breaks.", type: "character", color: "text-neon-yellow" },
  { speaker: "GLITCH", text: "Viper, stop showing off. The crisis is escalating.", type: "character", color: "text-neon-pink" },
  { speaker: "GLITCH", text: "Someone messed up the Core Schema. Gravity is null, time is looping, and cats are barking.", type: "character", color: "text-neon-pink" },
  { speaker: "VIPER", text: "Right. Listen, you have the Spark. The 'SQL Sight'.", type: "character", color: "text-neon-yellow" },
  { speaker: "VIPER", text: "It's not just database management. It's Reality Weaving. An INDEX is a portal. A SELECT is a summoning.", type: "character", color: "text-neon-yellow" },
  { speaker: "GLITCH", text: "Your power is dormant, but we need you to wake it up. Now.", type: "character", color: "text-neon-pink" },
  { speaker: "SYSTEM", text: "ALERT: DIMENSIONAL BREACH DETECTED IN SECTOR 01.", type: "alert" },
  { speaker: "VIPER", text: "Showtime. Let's go fix some realities.", type: "character", color: "text-neon-yellow" },
];

export const StoryIntro: React.FC<StoryIntroProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentLine = DIALOGUE[index];

  useEffect(() => {
    const text = currentLine.text; // Capture text to avoid dependency issues
    setDisplayedText("");
    setIsTyping(true);
    
    // Use a ref to track the built text to avoid state update race conditions
    let builtText = "";
    let charIndex = 0;
    
    const interval = setInterval(() => {
      if (charIndex < text.length) {
        builtText += text[charIndex];
        setDisplayedText(builtText);
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [index]); // Only depend on index, not currentLine object

  const handleNext = () => {
    if (isTyping) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      if (index < DIALOGUE.length - 1) {
        setIndex(prev => prev + 1);
      } else {
        onComplete();
      }
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center p-6 overflow-hidden">
       {/* Background */}
      <div className="absolute inset-0 bg-void-dark">
         {/* Removed animate-pulse from the background line below */}
         <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/multiverse/1920/1080')] opacity-20 bg-cover bg-center mix-blend-overlay grayscale blur-sm"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void-dark/90 to-void-dark"></div>
      </div>

      {/* Main UI Panel */}
      <div className="z-10 w-full max-w-4xl relative">
        {/* Holographic Header */}
        <div className="mb-8 flex items-end justify-between border-b-2 border-neon-cyan/30 pb-4">
           <div>
             <h2 className="text-neon-cyan font-mono text-sm tracking-widest">ENCRYPTED_FEED_V.9</h2>
             <div className="text-xs text-gray-500 font-mono">SQUAD_LINK: ACTIVE</div>
           </div>
           <div className="flex gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></span>
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></span>
           </div>
        </div>

        {/* Character / Avatar Area */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className={`
              w-24 h-24 md:w-40 md:h-40 shrink-0 border-2 relative overflow-hidden bg-black transition-all duration-300
              ${currentLine.speaker === 'VIPER' ? 'border-neon-yellow shadow-[0_0_20px_rgba(250,255,0,0.4)]' : ''}
              ${currentLine.speaker === 'GLITCH' ? 'border-neon-pink shadow-[0_0_20px_rgba(255,0,255,0.4)]' : ''}
              ${currentLine.type === 'alert' ? 'border-red-500 animate-pulse' : ''}
              ${currentLine.type === 'system' ? 'border-gray-500' : ''}
            `}>
               {/* Avatar Image */}
               <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/avatar/200')] grayscale mix-blend-screen opacity-60"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
               
               {/* Speaker Name Badge */}
               <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-center font-mono font-bold text-white text-sm border-t border-white/20">
                 {currentLine.speaker}
               </div>
            </div>

            {/* Dialogue Box */}
            <div 
              className="flex-1 min-h-[14rem] bg-void-panel/90 border border-white/10 p-6 relative backdrop-blur-md cursor-pointer group"
              onClick={handleNext}
              style={{ clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)' }}
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white/50"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white/50"></div>

              <p className={`
                font-mono text-lg md:text-2xl leading-relaxed
                ${currentLine.color || 'text-white'}
                ${currentLine.type === 'alert' ? 'text-red-500 font-bold tracking-widest' : ''}
                ${currentLine.type === 'system' ? 'text-neon-cyan/70 italic text-base' : ''}
              `}>
                {displayedText}
                <span className="animate-pulse inline-block w-3 h-6 bg-current align-middle ml-1">_</span>
              </p>

              <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono group-hover:text-neon-cyan transition-colors">
                {isTyping ? "DECODING_PACKETS..." : ">> NEXT_PACKET"}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { getPlayerStats, getLevelStability } from '../../utils/playerStats';

interface StabilityIndicatorProps {
  className?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  levelId?: number; // If provided, shows stability for this specific level
}

export const StabilityIndicator: React.FC<StabilityIndicatorProps> = ({ 
  className = '', 
  showLabel = true,
  size = 'medium',
  levelId
}) => {
  // Get stability for specific level or overall (for backward compatibility)
  const stability = levelId !== undefined 
    ? getLevelStability(levelId)
    : Math.min(100, Math.max(0, getPlayerStats().realityStability || 0));
  
  // Determine stability state
  const getStabilityState = () => {
    if (stability < 20) return { label: 'CRITICAL', color: 'red', intensity: 'high' };
    if (stability < 40) return { label: 'UNSTABLE', color: 'orange', intensity: 'high' };
    if (stability < 60) return { label: 'VOLATILE', color: 'yellow', intensity: 'medium' };
    if (stability < 80) return { label: 'STABILIZING', color: 'cyan', intensity: 'low' };
    if (stability < 95) return { label: 'STABLE', color: 'green', intensity: 'none' };
    return { label: 'OPTIMAL', color: 'purple', intensity: 'none' };
  };

  const state = getStabilityState();
  
  // Size classes
  const sizeClasses = {
    small: { container: 'p-2', bar: 'h-1', text: 'text-[10px]' },
    medium: { container: 'p-3', bar: 'h-2', text: 'text-xs' },
    large: { container: 'p-4', bar: 'h-3', text: 'text-sm' }
  };
  
  const sizeConfig = sizeClasses[size];
  
  // Color mapping
  const colorMap = {
    red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-400', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-[0_0_10px_rgba(234,179,8,0.5)]' },
    cyan: { bg: 'bg-neon-cyan', border: 'border-neon-cyan', text: 'text-neon-cyan', glow: 'shadow-[0_0_10px_rgba(0,243,255,0.5)]' },
    green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-400', glow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]' },
    purple: { bg: 'bg-neon-purple', border: 'border-neon-purple', text: 'text-neon-purple', glow: 'shadow-[0_0_15px_rgba(188,19,254,0.6)]' }
  };
  
  const colors = colorMap[state.color as keyof typeof colorMap];
  
  // Glitch effect for low stability
  const shouldGlitch = state.intensity !== 'none';
  const glitchClass = shouldGlitch ? 'animate-pulse' : '';
  
  return (
    <div className={`bg-black/40 rounded border ${colors.border}/30 ${sizeConfig.container} ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className={`${sizeConfig.text} font-mono text-gray-400 uppercase tracking-wider`}>
            REALITY STABILITY
          </div>
          <div className={`${sizeConfig.text} font-mono font-bold ${colors.text} ${glitchClass}`}>
            {state.label}
          </div>
        </div>
      )}
      
      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Bar */}
        <div className={`w-full ${sizeConfig.bar} bg-gray-900 rounded-full overflow-hidden border border-gray-700/50`}>
          {/* Animated Fill */}
          <div 
            className={`h-full ${colors.bg} transition-all duration-700 ease-out ${colors.glow} relative overflow-hidden`}
            style={{ width: `${stability}%` }}
          >
            {/* Shimmer effect for stable states */}
            {state.intensity === 'none' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
            )}
            
            {/* Glitch effect for unstable states */}
            {shouldGlitch && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            )}
          </div>
        </div>
        
        {/* Percentage Display */}
        <div className="flex items-center justify-between mt-1">
          <div className={`${sizeConfig.text} font-mono text-gray-500`}>
            {stability < 20 ? '⚠️ CRITICAL' : stability < 40 ? '⚠️ WARNING' : '✓'}
          </div>
          <div className={`${sizeConfig.text} font-mono font-bold ${colors.text}`}>
            {Math.round(stability)}%
          </div>
        </div>
      </div>
      
      {/* Status Message */}
      {showLabel && (
        <div className={`${sizeConfig.text} text-gray-500 mt-2 italic font-mono`}>
          {stability < 20 
            ? "Reality is collapsing. Complete missions immediately."
            : stability < 40
            ? "Reality is unstable. Patching required."
            : stability < 60
            ? "Stability improving. Continue patching rifts."
            : stability < 80
            ? "Reality stabilizing. Keep up the good work."
            : stability < 95
            ? "Reality is stable. You're mastering the code."
            : "Reality is optimal. You are THE ARCHITECT."}
        </div>
      )}
    </div>
  );
};


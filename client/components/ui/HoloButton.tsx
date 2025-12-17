import React from 'react';

interface HoloButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export const HoloButton: React.FC<HoloButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '',
  disabled = false
}) => {
  const baseStyles = "relative px-8 py-3 font-mono font-bold uppercase transition-all duration-200 clip-path-slant group";
  
  const variants = {
    primary: "bg-neon-cyan/10 border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]",
    danger: "bg-neon-pink/10 border-2 border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white hover:shadow-[0_0_20px_rgba(255,0,255,0.6)]",
    ghost: "bg-transparent border border-white/20 text-white/60 hover:text-white hover:border-white hover:bg-white/5"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
    >
      <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-[-150%] transition-transform duration-700 skew-x-12 opacity-0 group-hover:opacity-100" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
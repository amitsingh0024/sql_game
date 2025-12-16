import React from 'react';

interface GlitchTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  colorClass?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ 
  text, 
  as: Tag = 'span', 
  className = '',
  colorClass = 'text-white'
}) => {
  return (
    <Tag 
      className={`glitch-text font-display font-bold uppercase tracking-wider ${colorClass} ${className}`}
      data-text={text}
    >
      {text}
    </Tag>
  );
};
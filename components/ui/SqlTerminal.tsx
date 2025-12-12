import React, { useState, KeyboardEvent } from 'react';
import { HoloButton } from './HoloButton';

interface SqlTerminalProps {
  initialCode?: string;
  onExecute: (query: string) => void;
  isExecuting?: boolean;
}

export const SqlTerminal: React.FC<SqlTerminalProps> = ({ initialCode = '', onExecute, isExecuting }) => {
  const [code, setCode] = useState(initialCode);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      onExecute(code);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/80 border-2 border-neon-cyan/50 rounded-lg overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.1)]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neon-cyan/10 border-b border-neon-cyan/30">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="font-mono text-xs text-neon-cyan/70">SQL_WEAVER_INTERFACE.exe</div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 p-4 font-mono text-lg">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full h-full bg-transparent text-white outline-none resize-none placeholder-white/20"
          placeholder="-- Write your Reality Patch here..."
        />
        {/* Simple syntax highlighting overlay could go here, omitting for simplicity */}
      </div>

      {/* Action Bar */}
      <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
         <div className="text-xs text-gray-500 font-mono">
           CTRL+ENTER to Run
         </div>
         <HoloButton onClick={() => onExecute(code)} disabled={isExecuting} className="text-sm px-6 py-2">
           {isExecuting ? 'COMPILING...' : 'RUN QUERY'}
         </HoloButton>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { GameState } from './types';
import { CRTOverlay } from './components/layout/CRTOverlay';
import { SplashScreen } from './components/screens/SplashScreen';
import { StoryIntro } from './components/screens/StoryIntro';
import { LevelSelect } from './components/screens/LevelSelect';
import { LevelGameplay } from './components/screens/LevelGameplay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SPLASH);
  const [activeLevelId, setActiveLevelId] = useState<number>(1);

  const handleLevelSelect = (levelId: number) => {
    setActiveLevelId(levelId);
    setGameState(GameState.PLAYING);
  };

  const renderScreen = () => {
    switch (gameState) {
      case GameState.SPLASH:
        return <SplashScreen onStart={() => setGameState(GameState.INTRO_STORY)} />;
      case GameState.INTRO_STORY:
        return <StoryIntro onComplete={() => setGameState(GameState.LEVEL_SELECT)} />;
      case GameState.LEVEL_SELECT:
        return (
            <LevelSelect 
              onBack={() => setGameState(GameState.SPLASH)}
              onSelectLevel={handleLevelSelect} 
            />
        );
      case GameState.PLAYING:
        return (
          <LevelGameplay 
            levelId={activeLevelId} 
            onExit={() => setGameState(GameState.LEVEL_SELECT)} 
          />
        );
      default:
        return <div>Error: Unknown State</div>;
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-void-dark text-white font-sans selection:bg-neon-pink selection:text-white"
      style={{ 
        minHeight: '100vh', 
        width: '100%', 
        backgroundColor: '#050508', 
        color: '#ffffff' 
      }}
    >
      <CRTOverlay />
      {renderScreen()}
    </div>
  );
};

export default App;
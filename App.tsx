import React, { useState, useEffect } from 'react';
import { GameState } from './types';
import { CRTOverlay } from './components/layout/CRTOverlay';
import { SplashScreen } from './components/screens/SplashScreen';
import { StoryIntro } from './components/screens/StoryIntro';
import { LevelSelect } from './components/screens/LevelSelect';
import { MissionSelect } from './components/screens/MissionSelect';
import { LevelGameplay } from './components/screens/LevelGameplay';
import { getUnlockedLevels } from './utils/levelUnlock';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SPLASH);
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [activeMissionIndex, setActiveMissionIndex] = useState<number>(0);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(getUnlockedLevels());

  // Refresh unlocked levels when returning to level select
  useEffect(() => {
    if (gameState === GameState.LEVEL_SELECT) {
      setUnlockedLevels(getUnlockedLevels());
    }
  }, [gameState]);

  const handleLevelSelect = (levelId: number) => {
    setActiveLevelId(levelId);
    setGameState(GameState.MISSION_SELECT);
  };

  const handleMissionSelect = (missionIndex: number) => {
    setActiveMissionIndex(missionIndex);
    setGameState(GameState.PLAYING);
  };

  const handleMissionComplete = () => {
    // Return to mission select after completing a mission
    // Force refresh by updating activeLevelId (triggers re-render)
    setActiveLevelId(prev => prev);
    setGameState(GameState.MISSION_SELECT);
  };

  const handleBackToLevels = () => {
    // Refresh unlocked levels when going back
    setUnlockedLevels(getUnlockedLevels());
    setGameState(GameState.LEVEL_SELECT);
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
              unlockedLevels={unlockedLevels}
            />
        );
      case GameState.MISSION_SELECT:
        return (
          <MissionSelect
            key={`mission-select-${activeLevelId}`}
            levelId={activeLevelId}
            onBack={handleBackToLevels}
            onSelectMission={handleMissionSelect}
            />
        );
      case GameState.PLAYING:
        return (
          <LevelGameplay 
            levelId={activeLevelId} 
            missionIndex={activeMissionIndex}
            onExit={handleMissionComplete}
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
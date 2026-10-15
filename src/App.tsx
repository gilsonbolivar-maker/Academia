import React from 'react';
import {
  CameraPreset,
  Direction,
  GameState,
  LevelProgress,
  Position,
  ScreenTab,
  UserStats,
} from './types/game';
import { LEVELS } from './game/levelsData';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { GameHUD } from './components/GameHUD';
import { ThreeCanvas } from './components/ThreeCanvas';
import { TouchControls } from './components/TouchControls';
import { VictoryModal } from './components/VictoryModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PhysicsLab } from './components/PhysicsLab';
import { StatsModal } from './components/StatsModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
    const saved = localStorage.getItem('puxaempurra_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  // Screen Tab state
  const [currentTab, setCurrentTab] = React.useState<ScreenTab>('game');
  const [isHelpOpen, setIsHelpOpen] = React.useState<boolean>(false);

  // Camera preset
  const [cameraPreset, setCameraPreset] = React.useState<CameraPreset>('isometric');

  // Level index
  const [currentLevelIndex, setCurrentLevelIndex] = React.useState<number>(0);
  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];

  // Game dynamic state
  const [gameState, setGameState] = React.useState<GameState>(() => ({
    currentLevelIndex: 0,
    playerPos: { ...currentLevel.playerStart },
    playerFacing: 'S',
    isPullMode: false,
    crates: currentLevel.crates.map((c, i) => ({ id: i, x: c.x, y: c.y })),
    targets: currentLevel.targets.map(t => ({ x: t.x, y: t.y })),
    moveCount: 0,
    pullCount: 0,
    pushCount: 0,
    history: [],
    isCompleted: false,
    startTime: Date.now(),
    elapsedTime: 0,
    isPaused: false,
  }));

  // Level progress and user stats persisted in localStorage
  const [levelProgress, setLevelProgress] = React.useState<Record<number, LevelProgress>>(() => {
    const saved = localStorage.getItem('puxaempurra_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return { 1: { unlocked: true, completed: false, stars: 0 } };
  });

  const [userStats, setUserStats] = React.useState<UserStats>(() => {
    const saved = localStorage.getItem('puxaempurra_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      levelsCompleted: 0,
      totalPushes: 0,
      totalPulls: 0,
      totalMoves: 0,
      totalTimeSpentSeconds: 0,
      perfectStars: 0,
    };
  });

  // Track elapsed timer
  React.useEffect(() => {
    if (gameState.isCompleted || currentTab !== 'game') return;

    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - prev.startTime) / 1000),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isCompleted, currentTab, gameState.startTime]);

  // Persist theme
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('puxaempurra_dark_mode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize/Load a level
  const loadLevelByIndex = (index: number) => {
    const lvl = LEVELS[index];
    if (!lvl) return;
    setCurrentLevelIndex(index);
    setGameState({
      currentLevelIndex: index,
      playerPos: { ...lvl.playerStart },
      playerFacing: 'S',
      isPullMode: false,
      crates: lvl.crates.map((c, i) => ({ id: i, x: c.x, y: c.y })),
      targets: lvl.targets.map(t => ({ x: t.x, y: t.y })),
      moveCount: 0,
      pullCount: 0,
      pushCount: 0,
      history: [],
      isCompleted: false,
      startTime: Date.now(),
      elapsedTime: 0,
      isPaused: false,
    });
    setCurrentTab('game');
  };

  // Check victory condition
  const checkVictory = (crates: { x: number; y: number }[], targets: { x: number; y: number }[]) => {
    return targets.every(t => crates.some(c => c.x === t.x && c.y === t.y));
  };

  // Core Puxa & Empurra Move Handler
  const handleMove = (dir: Direction) => {
    if (gameState.isCompleted || currentTab !== 'game') return;

    let dx = 0;
    let dy = 0;
    switch (dir) {
      case 'N': dy = -1; break;
      case 'S': dy = 1; break;
      case 'E': dx = 1; break;
      case 'W': dx = -1; break;
    }

    const currentPos = gameState.playerPos;
    const targetX = currentPos.x + dx;
    const targetY = currentPos.y + dy;

    // Check if target is a wall
    const isWallAhead = currentLevel.walls.some(w => w.x === targetX && w.y === targetY);
    if (isWallAhead) {
      // Just change facing direction
      setGameState(prev => ({ ...prev, playerFacing: dir }));
      return;
    }

    // Check if there is a crate in front
    const crateAheadIndex = gameState.crates.findIndex(c => c.x === targetX && c.y === targetY);

    if (crateAheadIndex !== -1) {
      // --- ACTION: EMPURRAR (PUSH) ---
      const crateBehindX = targetX + dx;
      const crateBehindY = targetY + dy;

      // Cannot push if cell behind crate is a wall or has another crate
      const isWallBehindCrate = currentLevel.walls.some(w => w.x === crateBehindX && w.y === crateBehindY);
      const isCrateBehindCrate = gameState.crates.some(c => c.x === crateBehindX && c.y === crateBehindY);

      if (isWallBehindCrate || isCrateBehindCrate) {
        // Blocked push
        setGameState(prev => ({ ...prev, playerFacing: dir }));
        return;
      }

      // Execute Push
      const newCrates = gameState.crates.map((c, i) =>
        i === crateAheadIndex ? { ...c, x: crateBehindX, y: crateBehindY } : { ...c }
      );
      const newPlayerPos = { x: targetX, y: targetY };
      const isCompleted = checkVictory(newCrates, gameState.targets);

      sound.playPush();

      // Check if pushed crate landed on a target
      const landedOnTarget = gameState.targets.some(t => t.x === crateBehindX && t.y === crateBehindY);
      if (landedOnTarget) {
        sound.playTargetActivated();
      }

      setGameState(prev => ({
        ...prev,
        playerPos: newPlayerPos,
        playerFacing: dir,
        crates: newCrates,
        moveCount: prev.moveCount + 1,
        pushCount: prev.pushCount + 1,
        history: [
          ...prev.history,
          {
            playerPos: { ...prev.playerPos },
            playerFacing: prev.playerFacing,
            crates: prev.crates.map(c => ({ ...c })),
            wasPull: false,
            wasPush: true,
          },
        ],
        isCompleted,
      }));

      // Update User Stats
      setUserStats(prev => ({
        ...prev,
        totalMoves: prev.totalMoves + 1,
        totalPushes: prev.totalPushes + 1,
      }));

      if (isCompleted) {
        onLevelVictory(gameState.moveCount + 1);
      }
      return;
    }

    // Target cell ahead is free.
    // Check if player is in PULL MODE and there is a crate in the opposite direction (behind player)
    if (gameState.isPullMode) {
      // Position behind player
      const oppositeX = currentPos.x - dx;
      const oppositeY = currentPos.y - dy;

      const crateBehindPlayerIndex = gameState.crates.findIndex(
        c => c.x === oppositeX && c.y === oppositeY
      );

      if (crateBehindPlayerIndex !== -1) {
        // --- ACTION: PUXAR (PULL) ---
        // Crate is dragged into player's old position
        const newCrates = gameState.crates.map((c, i) =>
          i === crateBehindPlayerIndex ? { ...c, x: currentPos.x, y: currentPos.y } : { ...c }
        );
        const newPlayerPos = { x: targetX, y: targetY };
        const isCompleted = checkVictory(newCrates, gameState.targets);

        sound.playPull();

        // Check if pulled crate landed on a target
        const landedOnTarget = gameState.targets.some(t => t.x === currentPos.x && t.y === currentPos.y);
        if (landedOnTarget) {
          sound.playTargetActivated();
        }

        setGameState(prev => ({
          ...prev,
          playerPos: newPlayerPos,
          playerFacing: dir,
          crates: newCrates,
          moveCount: prev.moveCount + 1,
          pullCount: prev.pullCount + 1,
          history: [
            ...prev.history,
            {
              playerPos: { ...prev.playerPos },
              playerFacing: prev.playerFacing,
              crates: prev.crates.map(c => ({ ...c })),
              wasPull: true,
              wasPush: false,
            },
          ],
          isCompleted,
        }));

        setUserStats(prev => ({
          ...prev,
          totalMoves: prev.totalMoves + 1,
          totalPulls: prev.totalPulls + 1,
        }));

        if (isCompleted) {
          onLevelVictory(gameState.moveCount + 1);
        }
        return;
      }
    }

    // --- NORMAL STEP MOVE ---
    sound.playMove();

    setGameState(prev => ({
      ...prev,
      playerPos: { x: targetX, y: targetY },
      playerFacing: dir,
      moveCount: prev.moveCount + 1,
      history: [
        ...prev.history,
        {
          playerPos: { ...prev.playerPos },
          playerFacing: prev.playerFacing,
          crates: prev.crates.map(c => ({ ...c })),
          wasPull: false,
          wasPush: false,
        },
      ],
    }));

    setUserStats(prev => ({
      ...prev,
      totalMoves: prev.totalMoves + 1,
    }));
  };

  // Undo last step
  const handleUndo = () => {
    if (gameState.history.length === 0 || gameState.isCompleted) return;

    setGameState(prev => {
      const history = [...prev.history];
      const lastStep = history.pop();
      if (!lastStep) return prev;

      return {
        ...prev,
        playerPos: lastStep.playerPos,
        playerFacing: lastStep.playerFacing,
        crates: lastStep.crates,
        moveCount: Math.max(0, prev.moveCount - 1),
        pullCount: lastStep.wasPull ? Math.max(0, prev.pullCount - 1) : prev.pullCount,
        pushCount: lastStep.wasPush ? Math.max(0, prev.pushCount - 1) : prev.pushCount,
        history,
      };
    });
  };

  // Restart level
  const handleRestart = () => {
    loadLevelByIndex(currentLevelIndex);
  };

  // Toggle pull mode
  const handleTogglePullMode = () => {
    setGameState(prev => ({ ...prev, isPullMode: !prev.isPullMode }));
  };

  // Victory celebration & progression saving
  const onLevelVictory = (finalMoves: number) => {
    sound.playLevelVictory();

    const par = currentLevel.parMoves;
    let stars = 1;
    if (finalMoves <= par) stars = 3;
    else if (finalMoves <= Math.ceil(par * 1.5)) stars = 2;

    const lvlId = currentLevel.id;
    const nextLvlId = lvlId + 1;

    setLevelProgress(prev => {
      const current = prev[lvlId] || { unlocked: true, completed: false, stars: 0 };
      const updated = {
        ...prev,
        [lvlId]: {
          unlocked: true,
          completed: true,
          stars: Math.max(current.stars, stars),
          bestMoves: current.bestMoves ? Math.min(current.bestMoves, finalMoves) : finalMoves,
        },
        [nextLvlId]: {
          ...(prev[nextLvlId] || {}),
          unlocked: true,
          completed: prev[nextLvlId]?.completed || false,
          stars: prev[nextLvlId]?.stars || 0,
        },
      };
      localStorage.setItem('puxaempurra_progress', JSON.stringify(updated));
      return updated;
    });

    setUserStats(prev => {
      const updated: UserStats = {
        ...prev,
        levelsCompleted: Math.max(prev.levelsCompleted, lvlId),
        perfectStars: prev.perfectStars + (stars === 3 ? 1 : 0),
        totalTimeSpentSeconds: prev.totalTimeSpentSeconds + gameState.elapsedTime,
      };
      localStorage.setItem('puxaempurra_stats', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset user stats
  const handleResetStats = () => {
    const freshStats: UserStats = {
      levelsCompleted: 0,
      totalPushes: 0,
      totalPulls: 0,
      totalMoves: 0,
      totalTimeSpentSeconds: 0,
      perfectStars: 0,
    };
    setUserStats(freshStats);
    setLevelProgress({ 1: { unlocked: true, completed: false, stars: 0 } });
    localStorage.removeItem('puxaempurra_progress');
    localStorage.removeItem('puxaempurra_stats');
    loadLevelByIndex(0);
  };

  // Global Keyboard Listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentTab !== 'game') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove('N');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove('S');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove('W');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove('E');
          break;
        case ' ':
        case 'Shift':
          e.preventDefault();
          handleTogglePullMode();
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          handleUndo();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRestart();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, gameState]);

  return (
    <div
      className={`min-h-screen w-full relative transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* 1. Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Main Screen Routing */}
      <main className="w-full h-full pt-14">
        {currentTab === 'game' && (
          <div className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* 3D WebGL Canvas */}
            <ThreeCanvas
              currentLevel={currentLevel}
              playerPos={gameState.playerPos}
              playerFacing={gameState.playerFacing}
              crates={gameState.crates}
              targets={gameState.targets}
              isPulling={gameState.isPullMode}
              cameraPreset={cameraPreset}
              isDarkMode={isDarkMode}
            />

            {/* Viewport Floating Bottom Dock */}
            <GameHUD
              currentLevel={currentLevel}
              moveCount={gameState.moveCount}
              pushCount={gameState.pushCount}
              pullCount={gameState.pullCount}
              isPullMode={gameState.isPullMode}
              canUndo={gameState.history.length > 0}
              cameraPreset={cameraPreset}
              isDarkMode={isDarkMode}
              onTogglePullMode={handleTogglePullMode}
              onUndo={handleUndo}
              onRestart={handleRestart}
              onChangeCamera={setCameraPreset}
              onPrevLevel={() => loadLevelByIndex(currentLevelIndex - 1)}
              onNextLevel={() => loadLevelByIndex(currentLevelIndex + 1)}
              hasPrevLevel={currentLevelIndex > 0}
              hasNextLevel={currentLevelIndex < LEVELS.length - 1}
            />

            {/* Mobile Touch Controller */}
            <TouchControls
              onMove={handleMove}
              isPullMode={gameState.isPullMode}
              onTogglePullMode={handleTogglePullMode}
              isDarkMode={isDarkMode}
            />

            {/* Victory Celebration Modal */}
            {gameState.isCompleted && (
              <VictoryModal
                level={currentLevel}
                moveCount={gameState.moveCount}
                timeSeconds={gameState.elapsedTime}
                stars={
                  gameState.moveCount <= currentLevel.parMoves
                    ? 3
                    : gameState.moveCount <= Math.ceil(currentLevel.parMoves * 1.5)
                    ? 2
                    : 1
                }
                hasNextLevel={currentLevelIndex < LEVELS.length - 1}
                onNextLevel={() => loadLevelByIndex(currentLevelIndex + 1)}
                onRestart={handleRestart}
                onSelectLevel={() => setCurrentTab('levels')}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        )}

        {currentTab === 'levels' && (
          <div className="min-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <LevelSelectModal
              levels={LEVELS}
              currentLevelIndex={currentLevelIndex}
              levelProgress={levelProgress}
              onSelectLevel={loadLevelByIndex}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {currentTab === 'physicsLab' && (
          <div className="min-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <PhysicsLab isDarkMode={isDarkMode} />
          </div>
        )}

        {currentTab === 'stats' && (
          <div className="min-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <StatsModal
              stats={userStats}
              totalLevels={LEVELS.length}
              onResetStats={handleResetStats}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </main>

      {/* Instructions / Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

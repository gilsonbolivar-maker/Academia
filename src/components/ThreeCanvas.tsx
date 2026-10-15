import React from 'react';
import { SceneManager } from '../three/SceneManager';
import { CameraPreset, Direction, LevelData, Position } from '../types/game';

interface ThreeCanvasProps {
  currentLevel: LevelData;
  playerPos: Position;
  playerFacing: Direction;
  crates: { id: number; x: number; y: number }[];
  targets: { x: number; y: number }[];
  isPulling: boolean;
  cameraPreset: CameraPreset;
  isDarkMode: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentLevel,
  playerPos,
  playerFacing,
  crates,
  targets,
  isPulling,
  cameraPreset,
  isDarkMode,
}) => {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const sceneManagerRef = React.useRef<SceneManager | null>(null);

  // Initialize SceneManager once on mount
  React.useEffect(() => {
    if (!mountRef.current) return;

    const manager = new SceneManager({
      container: mountRef.current,
      isDarkMode,
    });
    sceneManagerRef.current = manager;

    // Load initial level
    manager.loadLevel(currentLevel);

    return () => {
      manager.destroy();
      sceneManagerRef.current = null;
    };
  }, []);

  // Sync theme changes
  React.useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setDarkMode(isDarkMode);
    }
  }, [isDarkMode]);

  // Sync level changes
  React.useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.loadLevel(currentLevel);
      sceneManagerRef.current.updateGameState(playerPos, playerFacing, crates, targets, isPulling);
    }
  }, [currentLevel.id]);

  // Sync camera preset changes
  React.useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  // Sync dynamic game state changes (player, crates, pulling)
  React.useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateGameState(playerPos, playerFacing, crates, targets, isPulling);
    }
  }, [playerPos, playerFacing, crates, targets, isPulling]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none outline-none"
      style={{ touchAction: 'none' }}
    />
  );
};

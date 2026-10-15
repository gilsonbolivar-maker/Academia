export type Direction = 'N' | 'S' | 'E' | 'W';

export type CellType = 'EMPTY' | 'WALL' | 'TARGET' | 'HAZARD';

export interface Position {
  x: number;
  y: number;
}

export interface Crate {
  id: number;
  x: number;
  y: number;
  type?: 'standard' | 'magnetic' | 'heavy';
}

export interface Target {
  x: number;
  y: number;
  id?: number;
}

export interface LevelData {
  id: number;
  title: string;
  world: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Mestre';
  description: string;
  gridWidth: number;
  gridHeight: number;
  walls: Position[];
  targets: Position[];
  crates: { x: number; y: number }[];
  playerStart: Position;
  parMoves: number;
  parTimeSeconds: number;
}

export interface GameState {
  currentLevelIndex: number;
  playerPos: Position;
  playerFacing: Direction;
  isPullMode: boolean;
  crates: Crate[];
  targets: Target[];
  moveCount: number;
  pullCount: number;
  pushCount: number;
  history: GameHistoryStep[];
  isCompleted: boolean;
  startTime: number;
  elapsedTime: number;
  isPaused: boolean;
}

export interface GameHistoryStep {
  playerPos: Position;
  playerFacing: Direction;
  crates: Crate[];
  wasPull: boolean;
  wasPush: boolean;
}

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0 to 3
  bestMoves?: number;
  bestTimeSeconds?: number;
}

export interface UserStats {
  levelsCompleted: number;
  totalPushes: number;
  totalPulls: number;
  totalMoves: number;
  totalTimeSpentSeconds: number;
  perfectStars: number;
}

export type CameraPreset = 'isometric' | 'topDown' | 'cinematic';

export type ScreenTab = 'game' | 'levels' | 'physicsLab' | 'stats';

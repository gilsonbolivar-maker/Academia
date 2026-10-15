import React from 'react';
import { CameraPreset, LevelData } from '../types/game';
import {
  RotateCcw,
  Undo2,
  Magnet,
  Camera,
  ChevronDown,
  ChevronUp,
  SkipForward,
  SkipBack,
  Trophy,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface GameHUDProps {
  currentLevel: LevelData;
  moveCount: number;
  pushCount: number;
  pullCount: number;
  isPullMode: boolean;
  canUndo: boolean;
  cameraPreset: CameraPreset;
  isDarkMode: boolean;
  onTogglePullMode: () => void;
  onUndo: () => void;
  onRestart: () => void;
  onChangeCamera: (preset: CameraPreset) => void;
  onPrevLevel: () => void;
  onNextLevel: () => void;
  hasPrevLevel: boolean;
  hasNextLevel: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentLevel,
  moveCount,
  pushCount,
  pullCount,
  isPullMode,
  canUndo,
  cameraPreset,
  isDarkMode,
  onTogglePullMode,
  onUndo,
  onRestart,
  onChangeCamera,
  onPrevLevel,
  onNextLevel,
  hasPrevLevel,
  hasNextLevel,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Keyboard shortcut 'H' to toggle HUD
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Minimal Top Info Bar: Level Title & Par (Top Center, clean unboxed text) */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div
          className={`px-4 py-2 rounded-xl border flex items-center gap-4 shadow-sm pointer-events-auto ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-amber-500">{currentLevel.world}</span>
            <span className="text-slate-400">·</span>
            <span className="font-bold text-sm tracking-tight">{currentLevel.title}</span>
          </div>

          <div className="flex items-center gap-3 text-xs border-l pl-3 border-slate-700/50">
            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <span className="text-slate-400">Movimentos:</span>
              <span className={`font-bold ${moveCount <= currentLevel.parMoves ? 'text-emerald-400' : 'text-amber-400'}`}>
                {moveCount}
              </span>
              <span className="text-slate-500">/ {currentLevel.parMoves}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Meta Par</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Bottom Control Dock (<= 15% viewport footprint, solid surfaces, no backdrop-filter over WebGL) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[min(940px,94vw)] pointer-events-none">
        {/* Collapse / Expand Toggle Button attached to top edge */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => {
              sound.playClick();
              setIsCollapsed(prev => !prev);
            }}
            title="Alternar Visão Limpa (Tecla H)"
            className={`pointer-events-auto px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-sm transition-transform active:scale-95 border ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Mostrar Controles</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Modo Cinema [H]</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Drawer Body */}
        <div
          className={`pointer-events-auto transition-all duration-300 transform rounded-2xl border p-2.5 sm:p-3 shadow-lg ${
            isCollapsed ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          } ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            {/* Primary Action Button: MODO PUXAR (Pull Tractor Beam) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onTogglePullMode();
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 border ${
                  isPullMode
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-bold'
                    : isDarkMode
                    ? 'bg-slate-800 text-cyan-400 border-slate-700 hover:bg-slate-750'
                    : 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100'
                }`}
                title="Ativar/Desativar modo Puxar (Espaço ou Shift)"
              >
                <Magnet className={`w-4 h-4 ${isPullMode ? 'animate-bounce' : ''}`} />
                <span className="whitespace-nowrap">
                  {isPullMode ? 'PUXAR: ATIVO' : 'MODO PUXAR [Espaço]'}
                </span>
              </button>

              {/* Status Counters */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono tabular-nums text-slate-400 pl-2">
                <span>Empurrou: <strong className="text-slate-200">{pushCount}</strong></span>
                <span>·</span>
                <span>Puxou: <strong className="text-cyan-400">{pullCount}</strong></span>
              </div>
            </div>

            {/* Middle Group: Undo & Restart */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  sound.playUndo();
                  onUndo();
                }}
                disabled={!canUndo}
                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  !canUndo
                    ? 'opacity-40 cursor-not-allowed border-transparent'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Desfazer último movimento (Tecla Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desfazer [Z]</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onRestart();
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Reiniciar nível atual (Tecla R)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reiniciar [R]</span>
              </button>
            </div>

            {/* Right Group: Camera presets & Level Switching */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Camera Switcher */}
              <div
                className={`flex items-center gap-0.5 p-1 rounded-xl border text-xs ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  onClick={() => onChangeCamera('isometric')}
                  title="Visão Isométrica"
                  className={`px-2 py-1 rounded-lg transition-colors text-[11px] font-medium ${
                    cameraPreset === 'isometric'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3D Iso
                </button>
                <button
                  onClick={() => onChangeCamera('topDown')}
                  title="Visão Superior (Planta)"
                  className={`px-2 py-1 rounded-lg transition-colors text-[11px] font-medium ${
                    cameraPreset === 'topDown'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Topo
                </button>
                <button
                  onClick={() => onChangeCamera('cinematic')}
                  title="Câmera Dinâmica do Operador"
                  className={`px-2 py-1 rounded-lg transition-colors text-[11px] font-medium ${
                    cameraPreset === 'cinematic'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dinâmica
                </button>
              </div>

              {/* Prev / Next Level */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    onPrevLevel();
                  }}
                  disabled={!hasPrevLevel}
                  className={`p-2 rounded-xl text-xs border transition-colors ${
                    !hasPrevLevel
                      ? 'opacity-30 cursor-not-allowed border-transparent'
                      : isDarkMode
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                      : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Nível Anterior"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onNextLevel();
                  }}
                  disabled={!hasNextLevel}
                  className={`p-2 rounded-xl text-xs border transition-colors ${
                    !hasNextLevel
                      ? 'opacity-30 cursor-not-allowed border-transparent'
                      : isDarkMode
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                      : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Próximo Nível"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

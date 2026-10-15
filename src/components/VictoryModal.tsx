import React from 'react';
import confetti from 'canvas-confetti';
import { LevelData } from '../types/game';
import { Star, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  level: LevelData;
  moveCount: number;
  timeSeconds: number;
  stars: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onSelectLevel: () => void;
  isDarkMode: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  moveCount,
  timeSeconds,
  stars,
  hasNextLevel,
  onNextLevel,
  onRestart,
  onSelectLevel,
  isDarkMode,
}) => {
  React.useEffect(() => {
    // Launch fireworks confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#06b6d4', '#e2e8f0'],
    });
  }, []);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border text-center relative animate-in fade-in zoom-in-95 duration-200 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Trophy icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-display font-bold tracking-tight mb-1">
          Nível Concluído!
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {level.world} · {level.title}
        </p>

        {/* 3-Star Rating */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`p-2 rounded-xl transition-all ${
                i <= stars
                  ? 'text-amber-400 bg-amber-400/10 scale-110'
                  : 'text-slate-600 bg-slate-800/40 opacity-40'
              }`}
            >
              <Star className="w-7 h-7 fill-current" />
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div
          className={`grid grid-cols-2 gap-3 p-4 rounded-2xl border mb-6 text-left ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-0.5">
              Movimentos
            </span>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-lg font-bold text-amber-500">{moveCount}</span>
              <span className="text-xs text-slate-500">/ meta {level.parMoves}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-0.5">
              Tempo
            </span>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-lg font-bold text-slate-200">{formatTime(timeSeconds)}</span>
              <span className="text-xs text-slate-500">/ par {level.parTimeSeconds}s</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir</span>
          </button>

          {hasNextLevel ? (
            <button
              onClick={() => {
                sound.playClick();
                onNextLevel();
              }}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-bold transition-all active:scale-95"
            >
              <span>Próximo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onSelectLevel();
              }}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-bold transition-all active:scale-95"
            >
              <span>Ver Níveis</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

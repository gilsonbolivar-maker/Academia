import React from 'react';
import { Direction } from '../types/game';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Magnet } from 'lucide-react';
import { sound } from '../utils/audio';

interface TouchControlsProps {
  onMove: (dir: Direction) => void;
  isPullMode: boolean;
  onTogglePullMode: () => void;
  isDarkMode: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  isPullMode,
  onTogglePullMode,
  isDarkMode,
}) => {
  return (
    <div className="fixed bottom-24 right-4 z-20 flex flex-col items-center gap-1 sm:hidden pointer-events-auto">
      {/* Pull Button */}
      <button
        onClick={() => {
          sound.playClick();
          onTogglePullMode();
        }}
        className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center shadow-lg transition-transform active:scale-90 border ${
          isPullMode
            ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
            : isDarkMode
            ? 'bg-slate-800 text-cyan-400 border-slate-700'
            : 'bg-white text-cyan-700 border-slate-300'
        }`}
        title="Ativar Modo Puxar"
      >
        <Magnet className="w-5 h-5" />
      </button>

      {/* D-Pad Cross */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div />
        <button
          onClick={() => onMove('N')}
          className="w-11 h-11 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center active:bg-amber-500 active:text-slate-950"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          onClick={() => onMove('W')}
          className="w-11 h-11 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center active:bg-amber-500 active:text-slate-950"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-500">
          PAD
        </div>
        <button
          onClick={() => onMove('E')}
          className="w-11 h-11 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center active:bg-amber-500 active:text-slate-950"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        <button
          onClick={() => onMove('S')}
          className="w-11 h-11 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center active:bg-amber-500 active:text-slate-950"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>
    </div>
  );
};

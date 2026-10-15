import React from 'react';
import { LevelData, LevelProgress } from '../types/game';
import { Lock, Star, Play, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface LevelSelectModalProps {
  levels: LevelData[];
  currentLevelIndex: number;
  levelProgress: Record<number, LevelProgress>;
  onSelectLevel: (index: number) => void;
  isDarkMode: boolean;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  currentLevelIndex,
  levelProgress,
  onSelectLevel,
  isDarkMode,
}) => {
  const [selectedWorld, setSelectedWorld] = React.useState<string>('all');

  const worlds = [
    { id: 'all', label: 'Todos os Níveis' },
    { id: 'Mundo 1: Fundamentos', label: '1. Fundamentos' },
    { id: 'Mundo 2: Vetores & Alavancas', label: '2. Vetores' },
    { id: 'Mundo 3: Usina Eletromagnética', label: '3. Eletromagnética' },
    { id: 'Mundo 4: Desafio Mestre', label: '4. Mestre' },
  ];

  const filteredLevels = levels.filter(lvl => {
    if (selectedWorld === 'all') return true;
    return lvl.world === selectedWorld;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-2">
          Seleção de Níveis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Domine a coordenação de tração e impulsão em 20 quebra-cabeças espaciais progressivos.
        </p>
      </div>

      {/* World Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-6">
        {worlds.map(w => (
          <button
            key={w.id}
            onClick={() => {
              sound.playClick();
              setSelectedWorld(w.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedWorld === w.id
                ? isDarkMode
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-amber-600 text-white font-semibold'
                : isDarkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Level Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredLevels.map((lvl, idx) => {
          const originalIdx = levels.findIndex(l => l.id === lvl.id);
          const progress = levelProgress[lvl.id] || {
            unlocked: originalIdx === 0,
            completed: false,
            stars: 0,
          };
          const isCurrent = currentLevelIndex === originalIdx;

          return (
            <div
              key={lvl.id}
              onClick={() => {
                if (progress.unlocked) {
                  sound.playClick();
                  onSelectLevel(originalIdx);
                }
              }}
              className={`rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                !progress.unlocked
                  ? 'opacity-50 cursor-not-allowed bg-slate-900/40 border-slate-800'
                  : isCurrent
                  ? isDarkMode
                    ? 'border-amber-500 bg-slate-850 shadow-md ring-1 ring-amber-500/50 cursor-pointer'
                    : 'border-amber-600 bg-amber-50/50 shadow-md ring-1 ring-amber-500/50 cursor-pointer'
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850 cursor-pointer'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <div>
                {/* Header: Level ID & Difficulty */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-500">
                      Nível {lvl.id}
                    </span>
                    {progress.completed && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {lvl.difficulty}
                  </span>
                </div>

                {/* Level Title */}
                <h3 className="text-base font-bold tracking-tight mb-1 text-slate-100">
                  {lvl.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {lvl.description}
                </p>
              </div>

              {/* Bottom Footer: Stars & Best Moves / Lock */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {progress.unlocked ? (
                  <>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= progress.stars ? 'fill-current' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-400">
                      <span>Meta: {lvl.parMoves}</span>
                      {progress.bestMoves !== undefined && (
                        <span className="text-emerald-400 ml-1">({progress.bestMoves})</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Bloqueado</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

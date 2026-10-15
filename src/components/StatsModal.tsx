import React from 'react';
import { UserStats } from '../types/game';
import { Trophy, Magnet, ArrowRight, Star, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface StatsModalProps {
  stats: UserStats;
  totalLevels: number;
  onResetStats: () => void;
  isDarkMode: boolean;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  stats,
  totalLevels,
  onResetStats,
  isDarkMode,
}) => {
  const completionPercentage = Math.round((stats.levelsCompleted / totalLevels) * 100);

  const formatHours = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-2">
          Estatísticas & Desempenho
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Acompanhe seu progresso tático, histórico de tração magnética e eficiência operacional.
        </p>
      </div>

      {/* Hero Progress Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border mb-6 relative overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block mb-1">
              Classificação Operacional
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {stats.levelsCompleted >= 15
                ? 'Engenheiro Mestre Gravitacional'
                : stats.levelsCompleted >= 8
                ? 'Operador Sênior de Campo'
                : stats.levelsCompleted >= 3
                ? 'Técnico Especialista em Tração'
                : 'Cadete Operador 3D'}
            </h2>
            <p className="text-xs text-slate-400 max-w-md">
              {stats.levelsCompleted} de {totalLevels} setores desobstruídos com sucesso.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col items-center justify-center text-amber-500">
              <span className="text-2xl font-bold font-mono tabular-nums">
                {completionPercentage}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Completo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div
          className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium">Fases Concluídas</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">
            {stats.levelsCompleted} <span className="text-sm text-slate-500">/ {totalLevels}</span>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium">Estrelas Perfeitas</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
            {stats.perfectStars} <span className="text-sm text-slate-500">/ {totalLevels * 3}</span>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <ArrowRight className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium">Cargas Empurradas</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">
            {stats.totalPushes}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Magnet className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium">Cargas Puxadas</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400">
            {stats.totalPulls}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium">Total de Passos</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">
            {stats.totalMoves}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium">Tempo em Missão</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums">
            {formatHours(stats.totalTimeSpentSeconds)}
          </div>
        </div>
      </div>

      {/* Reset Stats Option */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (window.confirm('Deseja realmente zerar todo o histórico de estatísticas?')) {
              sound.playClick();
              onResetStats();
            }
          }}
          className="px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Resetar Estatísticas</span>
        </button>
      </div>
    </div>
  );
};

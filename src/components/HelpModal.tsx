import React from 'react';
import { X, Magnet, ArrowRight, CornerDownLeft, Keyboard, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border relative max-h-[90vh] overflow-y-auto no-scrollbar ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
            Manual de Operação
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Aprenda a dominar o feixe magnético e as mecânicas de Puxar e Empurrar.
        </p>

        {/* Core Mechanics */}
        <div className="space-y-4 mb-6">
          {/* Empurrar */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight mb-1">
                1. Empurrar (Propulsão)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mova o robô operador diretamente contra uma caixa de carga livre. Se o espaço atrás dela estiver vazio, ela deslizará 1 quadrante à frente.
              </p>
            </div>
          </div>

          {/* Puxar */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-cyan-50/50 border-cyan-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Magnet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight mb-1 text-cyan-400">
                2. Puxar (Tração Magnética)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fique adjacente à caixa, ative o <strong>Modo Puxar</strong> (tecla <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">Espaço</kbd> ou botão virtual) e dê ré! O feixe trator arrastará a carga até o ponto onde você estava.
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts List */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            <span>Atalhos de Teclado</span>
          </h4>

          <div
            className={`grid grid-cols-2 gap-2 p-3 rounded-2xl border text-xs ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Mover Operador</span>
              <span className="font-mono font-bold text-slate-200">W, A, S, D / Setas</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Modo Puxar</span>
              <span className="font-mono font-bold text-cyan-400">Espaço / Shift</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Desfazer Passo</span>
              <span className="font-mono font-bold text-slate-200">Z</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Reiniciar Nível</span>
              <span className="font-mono font-bold text-slate-200">R</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Modo Cinema (Zen)</span>
              <span className="font-mono font-bold text-slate-200">H</span>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-bold transition-all active:scale-98"
        >
          Entendido, Começar!
        </button>
      </div>
    </div>
  );
};

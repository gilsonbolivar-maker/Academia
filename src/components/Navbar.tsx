import React from 'react';
import { ScreenTab } from '../types/game';
import { Sun, Moon, Volume2, VolumeX, HelpCircle, Gamepad2, Layers, Compass, BarChart2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  onOpenHelp,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const navItems: { id: ScreenTab; label: string; icon: React.ReactNode }[] = [
    { id: 'game', label: 'Arena 3D', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'levels', label: 'Níveis', icon: <Layers className="w-4 h-4" /> },
    { id: 'physicsLab', label: 'Lab Física', icon: <Compass className="w-4 h-4" /> },
    { id: 'stats', label: 'Estatísticas', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 border-b ${
        isDarkMode
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onSelectTab('game')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
              <span className="font-display font-bold text-sm tracking-tighter">3D</span>
            </div>
            <span className="font-display font-bold text-base tracking-tight whitespace-nowrap">
              PuxaEmpurra
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTab(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? isDarkMode
                      ? 'bg-slate-800 text-amber-400 font-semibold'
                      : 'bg-slate-100 text-amber-700 font-semibold'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              handleToggleMute();
            }}
            title={isMuted ? 'Ativar som' : 'Silenciar'}
            className={`p-2 rounded-lg text-xs transition-colors ${
              isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Controle de Áudio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleDarkMode();
            }}
            title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className={`p-2 rounded-lg text-xs transition-colors ${
              isDarkMode
                ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
            }`}
            aria-label="Alternar Tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenHelp();
            }}
            title="Como Jogar & Guia"
            className={`p-2 rounded-lg text-xs transition-colors ${
              isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Ajuda e Instruções"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

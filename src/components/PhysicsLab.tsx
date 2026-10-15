import React from 'react';
import { Play, Pause, RotateCcw, Compass, ArrowRight, Gauge, Activity } from 'lucide-react';
import { sound } from '../utils/audio';

interface PhysicsLabProps {
  isDarkMode: boolean;
}

export const PhysicsLab: React.FC<PhysicsLabProps> = ({ isDarkMode }) => {
  // Physical parameters
  const [mass, setMass] = React.useState<number>(100); // kg
  const [pushForce, setPushForce] = React.useState<number>(350); // N (direction -> positive X)
  const [pullForce, setPullForce] = React.useState<number>(0); // N (direction <- negative X)
  const [surfaceFriction, setSurfaceFriction] = React.useState<number>(0.25); // coefficient mu
  const [surfaceName, setSurfaceName] = React.useState<string>('Madeira');

  // Simulation dynamic state
  const [isRunning, setIsRunning] = React.useState<boolean>(false);
  const [position, setPosition] = React.useState<number>(0); // meters
  const [velocity, setVelocity] = React.useState<number>(0); // m/s
  const [acceleration, setAcceleration] = React.useState<number>(0); // m/s²
  const [appliedForceNet, setAppliedForceNet] = React.useState<number>(350);
  const [frictionForce, setFrictionForce] = React.useState<number>(0);
  const [netForce, setNetForce] = React.useState<number>(0);

  const requestRef = React.useRef<number>(0);
  const lastTimeRef = React.useRef<number>(0);

  // Surfaces presets
  const surfaces = [
    { name: 'Gelo', mu: 0.05, desc: 'Atrito Quase Nulo' },
    { name: 'Madeira', mu: 0.25, desc: 'Atrito Moderado' },
    { name: 'Concreto', mu: 0.55, desc: 'Atrito Alto' },
    { name: 'Borracha', mu: 0.85, desc: 'Atrito Extremo' },
  ];

  const handleSelectSurface = (s: typeof surfaces[0]) => {
    sound.playClick();
    setSurfaceFriction(s.mu);
    setSurfaceName(s.name);
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    setPosition(0);
    setVelocity(0);
    setAcceleration(0);
  };

  // Physics calculation step
  React.useEffect(() => {
    const g = 9.81;
    const normalForce = mass * g;
    const maxFriction = surfaceFriction * normalForce;

    // Applied net: Push pushes to the right (+), Pull pulls to the left (-)
    const fApp = pushForce - pullForce;
    setAppliedForceNet(fApp);

    let fFric = 0;
    let fNet = 0;
    let a = 0;

    if (Math.abs(velocity) < 0.001) {
      // Static regime
      if (Math.abs(fApp) <= maxFriction) {
        fFric = -fApp;
        fNet = 0;
        a = 0;
      } else {
        fFric = -Math.sign(fApp) * maxFriction;
        fNet = fApp + fFric;
        a = fNet / mass;
      }
    } else {
      // Kinetic regime
      fFric = -Math.sign(velocity) * maxFriction;
      fNet = fApp + fFric;
      a = fNet / mass;
    }

    setFrictionForce(fFric);
    setNetForce(fNet);
    setAcceleration(a);
  }, [mass, pushForce, pullForce, surfaceFriction, velocity]);

  // Simulation loop
  const updatePhysics = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    if (isRunning) {
      const g = 9.81;
      const normalForce = mass * g;
      const maxFriction = surfaceFriction * normalForce;
      const fApp = pushForce - pullForce;

      setVelocity(prevV => {
        let nextV = prevV;
        if (Math.abs(prevV) < 0.001 && Math.abs(fApp) <= maxFriction) {
          nextV = 0;
        } else {
          const fFric = prevV === 0 ? -Math.sign(fApp) * maxFriction : -Math.sign(prevV) * maxFriction;
          const fNetCalc = fApp + fFric;
          const aCalc = fNetCalc / mass;
          nextV = prevV + aCalc * dt;

          // Stop if friction caused velocity sign change while no external force drives it
          if (Math.sign(prevV) !== 0 && Math.sign(nextV) !== Math.sign(prevV) && Math.abs(fApp) <= maxFriction) {
            nextV = 0;
          }
        }
        return nextV;
      });

      setPosition(prevP => {
        const nextP = prevP + velocity * dt;
        return Math.max(-50, Math.min(50, nextP));
      });
    }

    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(requestRef.current);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              Laboratório de Física: Puxa vs Empurra
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Simulação interativa das Leis de Newton. Teste o equilíbrio entre força de tração, empuxo, massa e atrito.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setIsRunning(prev => !prev);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Executar Simulação</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Resetar Posição"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2D Interactive Vector Track Visualizer */}
      <div
        className={`rounded-3xl p-6 border mb-6 relative overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-mono">
          <span>PISTA DE TESTES DINÂMICOS</span>
          <span>Posição: {position.toFixed(2)} m</span>
        </div>

        {/* Visual Track */}
        <div className="relative h-44 w-full bg-slate-950/40 rounded-2xl border border-slate-800/80 flex items-center px-8 overflow-hidden">
          {/* Surface texture indicator */}
          <div className="absolute inset-x-0 bottom-0 h-4 bg-slate-800 border-t border-slate-700 flex items-center justify-around text-[10px] text-slate-400 font-mono">
            <span>Superfície: {surfaceName} (μ = {surfaceFriction.toFixed(2)})</span>
          </div>

          {/* Center Zero Marker */}
          <div className="absolute left-1/2 top-4 bottom-4 w-px bg-slate-700 dashed" />

          {/* Dynamic Cargo Box */}
          <div
            className="absolute transition-transform duration-75 flex flex-col items-center"
            style={{
              left: `calc(50% + ${position * 8}px)`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Vector Arrows Indicator Overlay */}
            <div className="flex items-center gap-1 mb-2 text-[10px] font-mono">
              {pushForce > 0 && (
                <span className="text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                  Empurra +{pushForce}N →
                </span>
              )}
              {pullForce > 0 && (
                <span className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">
                  ← Puxa -{pullForce}N
                </span>
              )}
            </div>

            {/* Crate Object */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-400/80 shadow-lg flex flex-col items-center justify-center text-slate-100 relative">
              <span className="text-[10px] font-bold tracking-tight uppercase text-amber-200">
                CARGA
              </span>
              <span className="text-sm font-mono font-bold">{mass} kg</span>

              {/* Wheels */}
              <div className="absolute -bottom-2 -left-1 w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
              <div className="absolute -bottom-2 -right-1 w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
            </div>

            {/* Friction vector arrow */}
            {Math.abs(frictionForce) > 1 && (
              <div className="mt-1 text-[10px] font-mono text-rose-400">
                Atrito: {frictionForce.toFixed(0)}N
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Physics Readout Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div
          className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Força Resultante
          </span>
          <div className="text-xl sm:text-2xl font-display font-bold font-mono tabular-nums text-amber-400">
            {netForce.toFixed(1)} N
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">F_res = F_app + F_atrito</span>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Aceleração
          </span>
          <div className="text-xl sm:text-2xl font-display font-bold font-mono tabular-nums text-cyan-400">
            {acceleration.toFixed(2)} m/s²
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">a = F_res / m</span>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Velocidade Atual
          </span>
          <div className="text-xl sm:text-2xl font-display font-bold font-mono tabular-nums text-emerald-400">
            {velocity.toFixed(2)} m/s
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">v = v0 + a·t</span>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Deslocamento
          </span>
          <div className="text-xl sm:text-2xl font-display font-bold font-mono tabular-nums text-slate-100">
            {position.toFixed(2)} m
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Distância percorrida</span>
        </div>
      </div>

      {/* Sliders and Configurations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Forces Control Column */}
        <div
          className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <span>Forças de Ação: Empurrar vs Puxar</span>
          </h3>

          {/* Push Force Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Força de Empurrar (Propulsão →)</span>
              <span className="font-mono tabular-nums font-bold text-amber-400">
                {pushForce} N
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={800}
              step={10}
              value={pushForce}
              onChange={e => setPushForce(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Pull Force Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Força de Puxar (Tração Magnética ←)</span>
              <span className="font-mono tabular-nums font-bold text-cyan-400">
                {pullForce} N
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={800}
              step={10}
              value={pullForce}
              onChange={e => setPullForce(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Mass Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Massa da Carga</span>
              <span className="font-mono tabular-nums font-bold text-slate-200">
                {mass} kg
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={mass}
              onChange={e => setMass(Number(e.target.value))}
              className="w-full accent-slate-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Surface Friction Column */}
        <div
          className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Atrito e Superfície de Contato</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {surfaces.map(s => (
              <button
                key={s.name}
                onClick={() => handleSelectSurface(s)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  surfaceFriction === s.mu
                    ? isDarkMode
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-amber-50 border-amber-500 text-amber-800'
                    : isDarkMode
                    ? 'bg-slate-850 border-slate-750 text-slate-300 hover:border-slate-650'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs">{s.name}</div>
                <div className="text-[11px] text-slate-400">μ = {s.mu.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500 mt-1">{s.desc}</div>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
            <p className="leading-relaxed">
              <strong>Princípio Físico:</strong> Quando a Força de Empurrar supera a Força de Puxar somada ao atrito estático máximo (f = μ·N), o objeto entra em aceleração positiva. Se ambas as forças forem iguais, o sistema permanece em repouso dinâmico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface SimulationState {
  isRunning: boolean;
  scenario: string;
  vehicleDensity: number;
  speedFactor: number;
  emergencyPriority: boolean;
  autoMode: boolean;
  runtime: number;
  signalMode: 'baseline' | 'actuated' | 'ai_optimized';
  co2Saved: number;
  totalCO2: number;
  avgWaitTime: number;
}

interface DashboardHeaderProps {
  simulation: SimulationState;
  onSimulationChange: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  simulation,
  onSimulationChange
}) => {
  const formatRuntime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSimulation = () => {
    onSimulationChange(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      runtime: prev.isRunning ? 0 : prev.runtime,
    }));
  };

  const getStrategyLabel = (mode: string) => {
    switch (mode) {
      case 'ai_optimized': return 'FLOWFIX AI ⚡';
      case 'actuated': return 'ACTUATED';
      default: return 'STATIC CYCLE';
    }
  };

  return (
    <header className="h-[48px] border-b border-[#1c2333] bg-[#0a0c12] px-4 flex items-center justify-between select-none font-mono">
      {/* Left: Branding & Blinking Indicator */}
      <div className="flex items-center gap-4">
        <div className="text-xs font-bold text-[#e2f0ff] tracking-wider font-condensed">
          FLOWFIX // CITY GRID v1.4
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#4a5a6a] font-bold">
          <span className={`w-2.5 h-2.5 bg-[#00ff88] animate-blink inline-block`} style={{ animationDuration: '1.2s' }} />
          <span>● SYSTEM ACTIVE</span>
        </div>
        <div className="text-[10px] text-[#4a5a6a] border-l border-[#1c2333] pl-4 font-mono font-semibold">
          RUNTIME: <span className="text-[#e2f0ff]">{formatRuntime(simulation.runtime)}</span>
        </div>
      </div>

      {/* Center: Monospace Pill Telemetry indicators */}
      <div className="hidden md:flex items-center gap-5 text-[9px] text-[#4a5a6a] font-bold">
        <div className="flex items-center gap-1.5">
          <span>STRATEGY:</span>
          <span className="text-[#00d4ff] bg-[#1c2333]/50 px-2 py-0.5 border border-[#1c2333]">
            {getStrategyLabel(simulation.signalMode)}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span>SCENARIO:</span>
          <span className="text-[#ffaa00] bg-[#1c2333]/50 px-2 py-0.5 border border-[#1c2333]">
            {simulation.scenario.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>SYS HEALTH:</span>
          <span className="text-[#00ff88] bg-[#1c2333]/50 px-2 py-0.5 border border-[#1c2333]">
            {simulation.isRunning ? '098.4%' : '100.0%'}
          </span>
        </div>
      </div>

      {/* Right: Danger bypass button */}
      <div>
        <button
          onClick={handleToggleSimulation}
          className={`px-3 py-1.5 text-[10px] font-bold tracking-wider transition-all border ${
            simulation.isRunning
              ? 'border-[#ff3355] text-[#ff3355] hover:bg-[#ff3355] hover:text-black'
              : 'border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-black'
          }`}
        >
          {simulation.isRunning ? '■ STOP SYSTEM' : '▶ START SYSTEM'}
        </button>
      </div>
    </header>
  );
};
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

interface Intersection {
  id: string;
  name: string;
  x: number;
  y: number;
  vehicleCount: number;
  averageSpeed: number;
  signalState: 'green' | 'yellow' | 'red';
  congestionLevel: 'normal' | 'moderate' | 'heavy';
  lastUpdated: Date;
}

interface ControlPanelProps {
  simulation: SimulationState;
  onSimulationChange: React.Dispatch<React.SetStateAction<SimulationState>>;
  intersections: Intersection[];
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  simulation,
  onSimulationChange,
  intersections,
  onReset,
}) => {
  const handleToggleSimulation = () => {
    onSimulationChange(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      runtime: prev.isRunning ? 0 : prev.runtime,
    }));
  };

  const handleSignalModeChange = (mode: 'baseline' | 'actuated' | 'ai_optimized') => {
    onSimulationChange(prev => ({
      ...prev,
      signalMode: mode,
    }));
  };

  const handleScenarioChange = (scenario: string) => {
    onSimulationChange(prev => ({
      ...prev,
      scenario,
      vehicleDensity: scenario === 'morning' ? 80 : scenario === 'evening' ? 90 : scenario === 'accident' ? 40 : 50,
      speedFactor: scenario === 'accident' ? 35 : 70,
    }));
  };

  const totalVehicles = intersections.reduce((sum, int) => sum + int.vehicleCount, 0);
  const avgSpeed = intersections.length > 0 
    ? Math.round(intersections.reduce((sum, int) => sum + int.averageSpeed, 0) / intersections.length)
    : 0;

  const padNumber = (num: number, size: number = 3) => {
    let s = num.toString();
    while (s.length < size) s = "0" + s;
    return s;
  };

  return (
    <div className="panel-cell select-none font-mono">
      {/* Label header */}
      <div className="border-b border-[#1c2333] px-3 py-1.5 text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase bg-[#0e1219]">
        ◆ SYSTEM_CONTROLS // COMMAND_ARRAY
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#1c2333]">
        {/* Zone 1: Scenario Toggle Buttons */}
        <div className="p-4 space-y-3">
          <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase">
            ZONE_01 // SYSTEM PRESETS
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['morning', 'afternoon', 'evening', 'accident'] as const).map(sc => (
              <button
                key={sc}
                onClick={() => handleScenarioChange(sc)}
                className={`py-2 px-2 text-center text-[10px] font-bold uppercase transition-all border ${
                  simulation.scenario === sc
                    ? 'bg-[#00d4ff] border-[#00d4ff] text-black'
                    : 'border-[#1c2333] bg-[#0a0c12] text-[#4a5a6a] hover:border-[#4a5a6a] hover:text-[#c8d8e8]'
                }`}
              >
                {sc === 'afternoon' ? 'AFTERNOON' : sc === 'morning' ? 'MORNING' : sc === 'evening' ? 'EVENING' : 'ACCIDENT'}
              </button>
            ))}
          </div>
        </div>

        {/* Zone 2: Live Tuning ranges */}
        <div className="p-4 space-y-4">
          <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase">
            ZONE_02 // GRID PARAMETERS
          </div>
          
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-[#4a5a6a]">SPAWN LOAD</span>
                <span className="text-[#e2f0ff]">{padNumber(simulation.vehicleDensity)}%</span>
              </div>
              <input
                type="range"
                value={simulation.vehicleDensity}
                onChange={(e) => onSimulationChange(prev => ({ ...prev, vehicleDensity: parseInt(e.target.value) }))}
                max="100"
                step="5"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-[#4a5a6a]">FLOW INDEX</span>
                <span className="text-[#e2f0ff]">{padNumber(simulation.speedFactor)}%</span>
              </div>
              <input
                type="range"
                value={simulation.speedFactor}
                onChange={(e) => onSimulationChange(prev => ({ ...prev, speedFactor: parseInt(e.target.value) }))}
                max="100"
                step="5"
              />
            </div>
          </div>
        </div>

        {/* Zone 3: Signal Strategy segmented controls */}
        <div className="p-4 space-y-3">
          <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase">
            ZONE_03 // ALGORITHM SCHEDULER
          </div>
          <div className="flex flex-col gap-2">
            {[
              { mode: 'baseline', label: 'STATIC CYCLE' },
              { mode: 'actuated', label: 'ACTUATED SENSORS' },
              { mode: 'ai_optimized', label: 'FLOWFIX AI' },
            ].map(({ mode, label }) => {
              const isActive = simulation.signalMode === mode;
              const isAi = mode === 'ai_optimized';
              return (
                <button
                  key={mode}
                  onClick={() => handleSignalModeChange(mode as any)}
                  className={`py-2 px-3 text-left text-[10px] font-bold uppercase transition-all border flex items-center justify-between ${
                    isActive
                      ? (isAi ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]' : 'bg-[#1c2333] border-[#1e3a5f] text-white')
                      : 'border-[#1c2333] bg-transparent text-[#4a5a6a] hover:border-[#4a5a6a]'
                  }`}
                >
                  <span>{label}</span>
                  {isAi && (
                    <span className={`text-[8px] px-1 py-0.5 ${isActive ? 'bg-[#00d4ff] text-black' : 'bg-[#1c2333] text-[#4a5a6a]'}`}>
                      ⚡ REINFORCED
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone 4: Emergency Trigger & Eco Metrics */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase">
              ZONE_04 // EVP SIGNAL OVERRIDE
            </div>
            
            <button
              onClick={() => onSimulationChange(prev => ({ ...prev, emergencyPriority: !prev.emergencyPriority }))}
              className={`w-full py-3.5 text-center text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                simulation.emergencyPriority
                  ? 'bg-[#ff3355] border-[#ff3355] text-black animate-border-pulse'
                  : 'bg-transparent border-[#ff3355] text-[#ff3355] hover:bg-[#ff3355]/10'
              }`}
            >
              {simulation.emergencyPriority ? '◈ EVP ACTIVE (HOLD)' : '◈ EVP ENGAGE'}
            </button>
          </div>

          {/* Eco metrics bar column */}
          <div className="space-y-3">
            <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase">
              CARBON TELEMETRY
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-[9px] text-[#4a5a6a]">SAVED</span>
                <span className="text-sm font-bold text-[#00ff88]">{simulation.co2Saved.toFixed(3)} kg CO₂</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-[#1c2333]/50 pt-1 font-mono">
                <span className="text-[9px] text-[#4a5a6a]">NET EMIT</span>
                <span className="text-xs font-bold text-[#e2f0ff]">{(totalVehicles * 0.12).toFixed(2)} g/s</span>
              </div>
              
              {/* Comparative bars */}
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center gap-1.5 text-[8px] text-[#4a5a6a]">
                  <span className="w-6 inline-block font-mono">AI:</span>
                  <div className="flex-1 bg-[#1c2333] h-1.5 relative">
                    <div 
                      className="bg-[#00ff88] h-full transition-all duration-500" 
                      style={{ width: `${simulation.signalMode === 'ai_optimized' ? '45%' : simulation.signalMode === 'actuated' ? '70%' : '85%'}` }} 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[8px] text-[#4a5a6a]">
                  <span className="w-6 inline-block font-mono">BASE:</span>
                  <div className="flex-1 bg-[#1c2333] h-1.5 relative">
                    <div className="bg-[#ffaa00] h-full w-[90%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';

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
  spawnRates: { north: number; south: number; east: number; west: number };
}

interface IntersectionPanelProps {
  intersection: Intersection | undefined;
  onSignalChange: (id: string, newState: 'green' | 'yellow' | 'red') => void;
  autoMode: boolean;
  onSpawnRateChange?: (intersectionId: string, direction: 'north' | 'south' | 'east' | 'west', value: number) => void;
  onPedestrianCrossing?: (intersectionId: string) => void;
  pedestrianActive?: boolean;
}

export const IntersectionPanel: React.FC<IntersectionPanelProps> = ({
  intersection,
  onSignalChange,
  autoMode,
  onSpawnRateChange,
  onPedestrianCrossing,
  pedestrianActive = false,
}) => {
  if (!intersection) {
    return (
      <div className="panel-cell h-[520px] flex flex-col select-none">
        <div className="border-b border-[#1c2333] px-3 py-2 text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase font-mono">
          ◆ NODE_TELEMETRY // OFFLINE
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#4a5a6a]">
          <div className="font-mono text-xs uppercase tracking-wider">NO ACTIVE NODE SELECTED</div>
          <div className="font-mono text-[10px] text-[#4a5a6a] mt-2 max-w-[200px] leading-relaxed">
            SELECT ◇ NODE ON MONITOR GRAPH FOR REALTIME INTERSECTION OVERRIDES.
          </div>
        </div>
      </div>
    );
  }

  // Node ID translation (e.g. int-a -> NODE_A)
  const nodeId = intersection.id.replace('int-', 'NODE_').toUpperCase();
  const streetName = intersection.name.split(' & ')[0].toUpperCase();

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'heavy': return 'text-[#ff3355]';
      case 'moderate': return 'text-[#ffaa00]';
      default: return 'text-[#00ff88]';
    }
  };

  const padNumber = (num: number, size: number = 3) => {
    let s = num.toString();
    while (s.length < size) s = "0" + s;
    return s;
  };

  return (
    <div className="panel-cell h-[520px] flex flex-col select-none">
      {/* Title block */}
      <div className="border-b border-[#1c2333] px-3 py-2 flex justify-between items-center bg-[#0e1219]">
        <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase font-mono">
          ◆ {nodeId} // {streetName}
        </div>
        <div className={`text-[9px] font-bold font-mono uppercase ${getCongestionColor(intersection.congestionLevel)}`}>
          {intersection.congestionLevel}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-none">
        {/* Monospace hard table data layout */}
        <div className="border border-[#1c2333] bg-[#050508] font-mono text-xs text-[#e2f0ff] overflow-hidden">
          <div className="flex justify-between border-b border-[#1c2333] px-3 py-2">
            <span className="text-[#4a5a6a]">VEHICLES</span>
            <span className="font-bold">{padNumber(intersection.vehicleCount)}</span>
          </div>
          <div className="flex justify-between border-b border-[#1c2333] px-3 py-2">
            <span className="text-[#4a5a6a]">AVG SPEED</span>
            <span className="font-bold">{padNumber(intersection.averageSpeed)} km/h</span>
          </div>
          <div className="flex justify-between border-b border-[#1c2333] px-3 py-2">
            <span className="text-[#4a5a6a]">CONGESTION</span>
            <span className={`font-bold ${getCongestionColor(intersection.congestionLevel)}`}>
              {intersection.congestionLevel.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#1c2333] px-3 py-2 items-center">
            <span className="text-[#4a5a6a]">EW PHASE</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-2 h-2 inline-block ${
                intersection.signalState === 'green' ? 'bg-[#00ff88]' : (intersection.signalState === 'yellow' ? 'bg-[#ffaa00]' : 'bg-[#ff3355]')
              }`} />
              <span className="capitalize">{intersection.signalState.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex justify-between px-3 py-2 items-center">
            <span className="text-[#4a5a6a]">NS PHASE</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-2 h-2 inline-block ${
                intersection.signalState === 'red' ? 'bg-[#00ff88]' : (intersection.signalState === 'green' ? 'bg-[#ff3355]' : 'bg-[#ffaa00]')
              }`} />
              <span className="capitalize">
                {intersection.signalState === 'green' ? 'RED' : (intersection.signalState === 'red' ? 'GREEN' : 'YELLOW')}
              </span>
            </div>
          </div>
        </div>

        {/* Manual Light Override Trigger */}
        {!autoMode && (
          <div className="space-y-1.5 border border-[#1c2333] p-2.5 bg-[#0e1219]">
            <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase font-mono">
              MANUAL PHASE OVERRIDE
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSignalChange(intersection.id, 'red')}
                className={`py-1 text-center font-mono text-[10px] font-bold border transition-colors ${
                  intersection.signalState === 'red'
                    ? 'bg-[#ff3355] border-[#ff3355] text-black'
                    : 'border-[#ff3355] text-[#ff3355] hover:bg-[#ff3355]/10'
                }`}
              >
                RED
              </button>
              <button
                onClick={() => onSignalChange(intersection.id, 'yellow')}
                className={`py-1 text-center font-mono text-[10px] font-bold border transition-colors ${
                  intersection.signalState === 'yellow'
                    ? 'bg-[#ffaa00] border-[#ffaa00] text-black'
                    : 'border-[#ffaa00] text-[#ffaa00] hover:bg-[#ffaa00]/10'
                }`}
              >
                YELLOW
              </button>
              <button
                onClick={() => onSignalChange(intersection.id, 'green')}
                className={`py-1 text-center font-mono text-[10px] font-bold border transition-colors ${
                  intersection.signalState === 'green'
                    ? 'bg-[#00ff88] border-[#00ff88] text-black'
                    : 'border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/10'
                }`}
              >
                GREEN
              </button>
            </div>
          </div>
        )}

        {/* Directional spawn editor sliders */}
        {onSpawnRateChange && (
          <div className="space-y-3 pt-2">
            <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase font-mono">
              ◇ DIRECTIONAL SPAWN LOAD WEIGHTS
            </div>
            
            <div className="space-y-2.5">
              {[
                { key: 'north', label: 'N' },
                { key: 'south', label: 'S' },
                { key: 'east', label: 'E' },
                { key: 'west', label: 'W' },
              ].map(({ key, label }) => {
                const val = intersection.spawnRates[key as 'north' | 'south' | 'east' | 'west'];
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-[#4a5a6a] font-bold">
                      <span>{key.toUpperCase()} FLOW</span>
                      <span className="text-[#e2f0ff]">{label} {padNumber(val)}%</span>
                    </div>
                    <input
                      type="range"
                      value={val}
                      onChange={(e) => onSpawnRateChange(intersection.id, key as any, parseInt(e.target.value))}
                      max="100"
                      step="5"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pedestrian Crossing System */}
        {onPedestrianCrossing && (
          <div className="pt-2">
            <button
              onClick={() => onPedestrianCrossing(intersection.id)}
              className={`w-full py-2.5 text-center font-mono text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                pedestrianActive 
                  ? 'bg-[#ffaa00] border-[#ffaa00] text-black animate-pulse' 
                  : 'bg-transparent border-[#1c2333] text-[#4a5a6a] hover:border-slate-750 hover:text-[#e2f0ff]'
              }`}
            >
              {pedestrianActive ? '■ PEDESTRIAN PHASE IN QUEUE' : '◆ PEDESTRIAN CROSSING CALL'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
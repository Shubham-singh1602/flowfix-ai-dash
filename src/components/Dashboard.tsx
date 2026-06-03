import React, { useState, useEffect, useCallback } from 'react';
import { TrafficMap } from './TrafficMap';
import { IntersectionPanel } from './IntersectionPanel';
import { ControlPanel } from './ControlPanel';
import { TrafficCharts } from './TrafficCharts';
import { AlertsPanel } from './AlertsPanel';
import { DashboardHeader } from './DashboardHeader';

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
  signalTimer: number;
  pedestrianActive: boolean;
  pedestrianTimer: number;
}

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

interface Alert {
  id: string;
  type: string;
  message: string;
  intersectionId?: string;
  timestamp: Date;
  severity: 'high' | 'medium' | 'info';
}

interface ChartDataEntry {
  time: string;
  volume: number;
  speed: number;
}

const INITIAL_INTERSECTIONS: Intersection[] = [
  {
    id: 'int-a',
    name: 'Main St & Oak Ave',
    x: 25,
    y: 30,
    vehicleCount: 0,
    averageSpeed: 45,
    signalState: 'green',
    congestionLevel: 'normal',
    lastUpdated: new Date(),
    spawnRates: { north: 50, south: 50, east: 50, west: 50 },
    signalTimer: 0,
    pedestrianActive: false,
    pedestrianTimer: 0,
  },
  {
    id: 'int-b',
    name: 'Central Blvd & Pine St',
    x: 60,
    y: 45,
    vehicleCount: 0,
    averageSpeed: 45,
    signalState: 'red',
    congestionLevel: 'normal',
    lastUpdated: new Date(),
    spawnRates: { north: 50, south: 50, east: 50, west: 50 },
    signalTimer: 0,
    pedestrianActive: false,
    pedestrianTimer: 0,
  },
  {
    id: 'int-c',
    name: 'Commerce Dr & Elm St',
    x: 40,
    y: 70,
    vehicleCount: 0,
    averageSpeed: 45,
    signalState: 'green',
    congestionLevel: 'normal',
    lastUpdated: new Date(),
    spawnRates: { north: 50, south: 50, east: 50, west: 50 },
    signalTimer: 0,
    pedestrianActive: false,
    pedestrianTimer: 0,
  },
  {
    id: 'int-d',
    name: 'Park Ave & Maple St',
    x: 75,
    y: 25,
    vehicleCount: 0,
    averageSpeed: 45,
    signalState: 'red',
    congestionLevel: 'normal',
    lastUpdated: new Date(),
    spawnRates: { north: 50, south: 50, east: 50, west: 50 },
    signalTimer: 0,
    pedestrianActive: false,
    pedestrianTimer: 0,
  },
];

const Dashboard: React.FC = () => {
  const [selectedIntersection, setSelectedIntersection] = useState<string | null>(null);
  const [intersections, setIntersections] = useState<Intersection[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    scenario: 'afternoon',
    vehicleDensity: 50,
    speedFactor: 70,
    emergencyPriority: false,
    autoMode: true,
    runtime: 0,
    signalMode: 'ai_optimized',
    co2Saved: 0,
    totalCO2: 0,
    avgWaitTime: 8,
  });
  const [trafficData, setTrafficData] = useState<ChartDataEntry[]>([]);

  useEffect(() => {
    setIntersections(INITIAL_INTERSECTIONS);
    setSelectedIntersection(INITIAL_INTERSECTIONS[0].id);

    const initialChartData = Array.from({ length: 12 }, (_, i) => ({
      time: `${i + 1}:00`,
      volume: 8 + Math.floor(Math.random() * 12),
      speed: 38 + Math.floor(Math.random() * 8),
    }));
    setTrafficData(initialChartData);
  }, []);

  const handleReset = () => {
    setIntersections(INITIAL_INTERSECTIONS.map(int => ({
      ...int,
      spawnRates: { north: 50, south: 50, east: 50, west: 50 },
      signalState: int.id === 'int-a' || int.id === 'int-c' ? 'green' : 'red',
      signalTimer: 0,
      pedestrianActive: false,
      pedestrianTimer: 0,
    })));
    setSimulation({
      isRunning: false,
      scenario: 'afternoon',
      vehicleDensity: 50,
      speedFactor: 70,
      emergencyPriority: false,
      autoMode: true,
      runtime: 0,
      signalMode: 'ai_optimized',
      co2Saved: 0,
      totalCO2: 0,
      avgWaitTime: 8,
    });
    setAlerts([]);

    // Set a quiet system log instead of standard toast
    const resetAlert: Alert = {
      id: `sys-reset-${Date.now()}`,
      type: 'SYSTEM RESET',
      message: 'ALL COMMAND PARAMETERS RESTORED TO COLD INITIAL DEFAULTS',
      timestamp: new Date(),
      severity: 'info',
    };
    setAlerts(prev => [resetAlert, ...prev.slice(0, 4)]);
  };

  const handlePedestrianCrossing = (intersectionId: string) => {
    setIntersections(prev => prev.map(int => {
      if (int.id === intersectionId) {
        if (int.pedestrianActive) return int;

        const newAlert: Alert = {
          id: `ped-${Date.now()}-${int.id}`,
          type: 'PEDESTRIAN ACTUATION',
          message: `MANUAL CROSSING REQUEST ENGAGED AT ${int.name.split(' & ')[0].toUpperCase()}`,
          intersectionId: int.id,
          timestamp: new Date(),
          severity: 'info',
        };
        setAlerts(prevAlerts => [newAlert, ...prevAlerts.slice(0, 5)]);

        return {
          ...int,
          pedestrianActive: true,
          pedestrianTimer: 6,
        };
      }
      return int;
    }));
  };

  const handleSpawnRateChange = (
    intersectionId: string,
    direction: 'north' | 'south' | 'east' | 'west',
    value: number
  ) => {
    setIntersections(prev => prev.map(int => {
      if (int.id === intersectionId) {
        return {
          ...int,
          spawnRates: {
            ...int.spawnRates,
            [direction]: value,
          },
        };
      }
      return int;
    }));
  };

  const handleManualSignalChange = (intersectionId: string, newState: 'green' | 'yellow' | 'red') => {
    setIntersections(prev => prev.map(int => {
      if (int.id === intersectionId) {
        return {
          ...int,
          signalState: newState,
          signalTimer: 0,
        };
      }
      return int;
    }));
  };

  const handleSimulationUpdate = useCallback((metrics: {
    totalVehicles: number;
    averageSpeed: number;
    congestedCount: number;
    co2Saved: number;
    violations: Array<{ id: string; type: string; message: string; timestamp: Date }>;
    emergencyActive: boolean;
    queues: Record<string, number>;
  }) => {
    setSimulation(prev => ({
      ...prev,
      co2Saved: metrics.co2Saved,
    }));

    setIntersections(prev => prev.map(int => {
      const queueSize = metrics.queues[int.id] || 0;
      let congestion: 'normal' | 'moderate' | 'heavy' = 'normal';
      if (queueSize > 5) congestion = 'heavy';
      else if (queueSize > 2) congestion = 'moderate';

      const estSpeed = Math.max(10, Math.round(50 - (queueSize * 6) + (Math.random() * 4 - 2)));

      return {
        ...int,
        vehicleCount: queueSize,
        averageSpeed: estSpeed,
        congestionLevel: congestion,
        lastUpdated: new Date(),
      };
    }));

    // Logging violations directly into Alerts scrolling feed, no toasts popups
    if (metrics.violations.length > 0) {
      metrics.violations.forEach(v => {
        const newAlert: Alert = {
          id: v.id,
          type: v.type,
          message: v.message,
          timestamp: v.timestamp,
          severity: 'medium',
        };
        setAlerts(prevAlerts => [newAlert, ...prevAlerts.slice(0, 5)]);
      });
    }

    if (metrics.emergencyActive) {
      const alertExists = alerts.some(a => a.type === 'EVP ACTIVE');
      if (!alertExists) {
        const newAlert: Alert = {
          id: `evp-${Date.now()}`,
          type: 'EVP ACTIVE',
          message: 'EMERGENCY TRANZIT CORRIDOR ACTIVATED // EAST-WEST SIGNALS LOCKED',
          timestamp: new Date(),
          severity: 'high',
        };
        setAlerts(prevAlerts => [newAlert, ...prevAlerts.slice(0, 5)]);
      }
    } else {
      setAlerts(prevAlerts => prevAlerts.filter(a => a.type !== 'EVP ACTIVE'));
    }
  }, [alerts]);

  useEffect(() => {
    if (!simulation.isRunning) return;

    const interval = setInterval(() => {
      setSimulation(prev => ({ ...prev, runtime: prev.runtime + 1 }));

      setIntersections(prevIntersections => {
        const isEmergencyPriority = simulation.emergencyPriority;

        return prevIntersections.map(int => {
          let nextState = int.signalState;
          let nextTimer = int.signalTimer + 1;
          let nextPedActive = int.pedestrianActive;
          let nextPedTimer = int.pedestrianTimer;

          if (nextPedActive && nextPedTimer > 0) {
            nextPedTimer -= 1;
            if (nextPedTimer === 0) {
              nextPedActive = false;
              nextState = 'green';
              nextTimer = 0;
            } else {
              return {
                ...int,
                signalState: 'red' as const,
                signalTimer: nextTimer,
                pedestrianActive: nextPedActive,
                pedestrianTimer: nextPedTimer,
              };
            }
          }

          if (isEmergencyPriority && (int.id === 'int-a' || int.id === 'int-b')) {
            return {
              ...int,
              signalState: 'green' as const,
              signalTimer: 0,
            };
          }

          if (simulation.autoMode) {
            const mode = simulation.signalMode;

            if (mode === 'baseline') {
              if (int.signalState === 'green' && nextTimer >= 12) {
                nextState = 'yellow';
                nextTimer = 0;
              } else if (int.signalState === 'yellow' && nextTimer >= 3) {
                nextState = 'red';
                nextTimer = 0;
              } else if (int.signalState === 'red' && nextTimer >= 12) {
                nextState = 'green';
                nextTimer = 0;
              }
            } else if (mode === 'actuated') {
              const queueSize = int.vehicleCount;
              if (nextTimer >= 6) {
                if (int.signalState === 'green' && queueSize > 4) {
                  nextState = 'yellow';
                  nextTimer = 0;
                } else if (int.signalState === 'red' && queueSize < 2) {
                  nextState = 'green';
                  nextTimer = 0;
                }
              }
              if (int.signalState === 'yellow' && nextTimer >= 2) {
                nextState = 'red';
                nextTimer = 0;
              }
            } else if (mode === 'ai_optimized') {
              const localQueue = int.vehicleCount;
              const isEWGreen = int.signalState === 'green';

              if (nextTimer >= 5) {
                if (isEWGreen && localQueue > 3) {
                  nextState = 'yellow';
                  nextTimer = 0;
                } else if (int.signalState === 'red' && localQueue > 4) {
                  nextState = 'green';
                  nextTimer = 0;
                }
              }

              if (int.signalState === 'yellow' && nextTimer >= 2) {
                nextState = isEWGreen ? 'red' : 'green';
                nextTimer = 0;
              }
            }
          }

          return {
            ...int,
            signalState: nextState,
            signalTimer: nextTimer,
            pedestrianActive: nextPedActive,
            pedestrianTimer: nextPedTimer,
          };
        });
      });

      setTrafficData(prev => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const totalSimVehicles = intersections.reduce((sum, int) => sum + int.vehicleCount, 0) + (Math.floor(Math.random() * 4) + 2);
        const avgSimSpeed = intersections.length > 0 
          ? intersections.reduce((sum, int) => sum + int.averageSpeed, 0) / intersections.length
          : 38;

        const newEntry: ChartDataEntry = {
          time: timeStr,
          volume: totalSimVehicles,
          speed: Math.round(avgSimSpeed),
        };

        return [...prev.slice(-11), newEntry];
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.signalMode, simulation.autoMode, simulation.emergencyPriority, intersections]);

  return (
    <div className="min-h-screen bg-[#050508] text-[#c8d8e8] flex flex-col font-mono select-none overflow-x-hidden">
      {/* 1. HEADER HUD (Borderless top strip) */}
      <DashboardHeader 
        simulation={simulation}
        onSimulationChange={setSimulation}
      />
      
      <main className="flex-1 p-3 space-y-3 flex flex-col justify-between">
        {/* 2. Grid (desktop, 1400px+) */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 flex-grow">
          {/* MAP (col 1-2 of 4) */}
          <div className="xl:col-span-2 panel-cell h-[520px] flex flex-col">
            <div className="border-b border-[#1c2333] px-3 py-1.5 text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase bg-[#0e1219]">
              ◆ MONITOR_MAP // GRID_VECTOR_GRAPH
            </div>
            <div className="flex-1 relative">
              <TrafficMap 
                intersections={intersections}
                selectedIntersection={selectedIntersection}
                onIntersectionClick={setSelectedIntersection}
                isSimulationRunning={simulation.isRunning}
                simulation={simulation}
                onSimulationUpdate={handleSimulationUpdate}
              />
            </div>
          </div>

          {/* TELEMETRY NODE (col 3) */}
          <div className="xl:col-span-1">
            <IntersectionPanel 
               intersection={intersections.find(i => i.id === selectedIntersection)}
               onSignalChange={handleManualSignalChange}
               autoMode={simulation.autoMode}
               onSpawnRateChange={handleSpawnRateChange}
               onPedestrianCrossing={handlePedestrianCrossing}
               pedestrianActive={intersections.find(i => i.id === selectedIntersection)?.pedestrianActive}
            />
          </div>

          {/* ANALYTICS (col 4) */}
          <div className="xl:col-span-1 panel-cell h-[520px] flex flex-col p-3 pt-0">
            <div className="border-b border-[#1c2333] px-1 py-1.5 text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase bg-[#0e1219] -mx-3 mb-2.5 pl-3">
              ◆ TELEMETRY_ANALYTICS // NETWORK_DATA
            </div>
            <div className="flex-1">
              <TrafficCharts 
                data={trafficData}
                intersections={intersections}
              />
            </div>
          </div>
        </div>

        {/* 3. ALERT TICKER (Horizontal scrolling marquee) */}
        <AlertsPanel 
          alerts={alerts} 
          onAlertClick={(alertId) => {
            const alert = alerts.find(a => a.id === alertId);
            if (alert && alert.intersectionId) setSelectedIntersection(alert.intersectionId);
          }}
          onClearAlert={(alertId) => setAlerts(prev => prev.filter(a => a.id !== alertId))}
        />

        {/* 4. CONTROL CENTER (Full width bottom panel) */}
        <ControlPanel 
          simulation={simulation}
          onSimulationChange={setSimulation}
          intersections={intersections}
          onReset={handleReset}
        />
      </main>
    </div>
  );
};

export default Dashboard;
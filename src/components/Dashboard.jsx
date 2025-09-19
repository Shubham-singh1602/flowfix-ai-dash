import React, { useState, useEffect } from 'react';
import { TrafficMap } from './TrafficMap';
import { IntersectionPanel } from './IntersectionPanel';
import { ControlPanel } from './ControlPanel';
import { TrafficCharts } from './TrafficCharts';
import { AlertsPanel } from './AlertsPanel';
import { DashboardHeader } from './DashboardHeader';
import { Activity, MapPin, BarChart3, Settings } from 'lucide-react';

const Dashboard = () => {
  const [selectedIntersection, setSelectedIntersection] = useState(null);
  const [intersections, setIntersections] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [simulation, setSimulation] = useState({
    isRunning: false,
    scenario: 'afternoon',
    vehicleDensity: 50,
    speedFactor: 70,
    emergencyPriority: false,
    autoMode: true,
    runtime: 0,
  });
  const [trafficData, setTrafficData] = useState([]);

  // Initialize intersections
  useEffect(() => {
    const initialIntersections = [
      {
        id: 'int-a',
        name: 'Main St & Oak Ave',
        x: 25,
        y: 30,
        vehicleCount: 12,
        averageSpeed: 35,
        signalState: 'green',
        congestionLevel: 'normal',
        lastUpdated: new Date(),
      },
      {
        id: 'int-b',
        name: 'Central Blvd & Pine St',
        x: 60,
        y: 45,
        vehicleCount: 28,
        averageSpeed: 22,
        signalState: 'yellow',
        congestionLevel: 'moderate',
        lastUpdated: new Date(),
      },
      {
        id: 'int-c',
        name: 'Commerce Dr & Elm St',
        x: 40,
        y: 70,
        vehicleCount: 45,
        averageSpeed: 15,
        signalState: 'red',
        congestionLevel: 'heavy',
        lastUpdated: new Date(),
      },
      {
        id: 'int-d',
        name: 'Park Ave & Maple St',
        x: 75,
        y: 25,
        vehicleCount: 8,
        averageSpeed: 42,
        signalState: 'green',
        congestionLevel: 'normal',
        lastUpdated: new Date(),
      },
    ];

    setIntersections(initialIntersections);
    setSelectedIntersection(initialIntersections[0].id);

    // Initialize chart data
    const initialChartData = Array.from({ length: 12 }, (_, i) => ({
      time: `${i + 1}:00`,
      volume: Math.floor(Math.random() * 50) + 10,
      speed: Math.floor(Math.random() * 30) + 20,
    }));
    setTrafficData(initialChartData);
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!simulation.isRunning) return;

    const interval = setInterval(() => {
      setSimulation(prev => ({ ...prev, runtime: prev.runtime + 1 }));

      // Update intersection data based on simulation parameters
      setIntersections(prev => prev.map(intersection => {
        const baseVariation = (Math.random() - 0.5) * 10;
        const scenarioMultiplier = getScenarioMultiplier(simulation.scenario);
        const densityEffect = simulation.vehicleDensity / 100;
        
        const newVehicleCount = Math.max(0, Math.floor(
          intersection.vehicleCount + baseVariation * scenarioMultiplier * densityEffect
        ));
        
        const newAverageSpeed = Math.max(5, Math.floor(
          (50 - newVehicleCount * 0.8) * (simulation.speedFactor / 100)
        ));

        const newCongestionLevel = 
          newVehicleCount < 15 ? 'normal' :
          newVehicleCount < 35 ? 'moderate' : 'heavy';

        // Auto signal control
        let newSignalState = intersection.signalState;
        if (simulation.autoMode) {
          newSignalState = getOptimalSignalState(newVehicleCount, newCongestionLevel);
        }

        return {
          ...intersection,
          vehicleCount: newVehicleCount,
          averageSpeed: newAverageSpeed,
          signalState: newSignalState,
          congestionLevel: newCongestionLevel,
          lastUpdated: new Date(),
        };
      }));

      // Check for alerts
      checkForAlerts();

      // Update chart data
      setTrafficData(prev => {
        const newEntry = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          volume: intersections.reduce((sum, int) => sum + int.vehicleCount, 0) / intersections.length,
          speed: intersections.reduce((sum, int) => sum + int.averageSpeed, 0) / intersections.length,
        };
        return [...prev.slice(-11), newEntry];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.scenario, simulation.vehicleDensity, simulation.speedFactor, simulation.autoMode, intersections]);

  const getScenarioMultiplier = (scenario) => {
    switch (scenario) {
      case 'morning': return 1.5;
      case 'evening': return 1.8;
      case 'accident': return 2.5;
      default: return 1.0;
    }
  };

  const getOptimalSignalState = (vehicleCount, congestionLevel) => {
    if (congestionLevel === 'heavy') return 'green';
    if (congestionLevel === 'moderate') return Math.random() > 0.5 ? 'yellow' : 'green';
    return vehicleCount < 10 ? 'green' : 'yellow';
  };

  const checkForAlerts = () => {
    intersections.forEach(intersection => {
      if (intersection.congestionLevel === 'heavy' && Math.random() > 0.7) {
        const newAlert = {
          id: `alert-${Date.now()}-${intersection.id}`,
          type: 'congestion',
          message: `Heavy congestion detected at ${intersection.name}`,
          intersectionId: intersection.id,
          timestamp: new Date(),
          severity: 'high',
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      }

      if (intersection.averageSpeed < 20 && Math.random() > 0.8) {
        const newAlert = {
          id: `alert-${Date.now()}-${intersection.id}`,
          type: 'speed',
          message: `Low average speed (${intersection.averageSpeed} km/h) at ${intersection.name}`,
          intersectionId: intersection.id,
          timestamp: new Date(),
          severity: 'medium',
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader 
        simulation={simulation}
        onSimulationChange={setSimulation}
      />
      
      <main className="p-4 space-y-4">
        {/* Alerts Panel */}
        <AlertsPanel 
          alerts={alerts} 
          onAlertClick={(alertId) => {
            const alert = alerts.find(a => a.id === alertId);
            if (alert) setSelectedIntersection(alert.intersectionId);
          }}
          onClearAlert={(alertId) => setAlerts(prev => prev.filter(a => a.id !== alertId))}
        />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Traffic Map */}
          <div className="xl:col-span-2">
            <div className="bg-card rounded-lg shadow-panel p-4 h-[600px]">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Traffic Map</h2>
              </div>
              <TrafficMap 
                intersections={intersections}
                selectedIntersection={selectedIntersection}
                onIntersectionClick={setSelectedIntersection}
                isSimulationRunning={simulation.isRunning}
              />
            </div>
          </div>

          {/* Intersection Panel */}
          <div className="xl:col-span-1">
            <IntersectionPanel 
              intersection={intersections.find(i => i.id === selectedIntersection)}
              onSignalChange={(intersectionId, newState) => {
                if (!simulation.autoMode) {
                  setIntersections(prev => prev.map(int => 
                    int.id === intersectionId 
                      ? { ...int, signalState: newState }
                      : int
                  ));
                }
              }}
              autoMode={simulation.autoMode}
            />
          </div>

          {/* Charts */}
          <div className="xl:col-span-1">
            <div className="bg-card rounded-lg shadow-panel p-4 h-[600px]">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Traffic Analytics</h2>
              </div>
              <TrafficCharts 
                data={trafficData}
                intersections={intersections}
              />
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <ControlPanel 
          simulation={simulation}
          onSimulationChange={setSimulation}
          intersections={intersections}
        />
      </main>
    </div>
  );
};

export default Dashboard;
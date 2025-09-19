import React from 'react';
import { Play, Pause, RotateCcw, Settings, Zap, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export const ControlPanel = ({
  simulation,
  onSimulationChange,
  intersections
}) => {
  const handleToggleSimulation = () => {
    onSimulationChange({
      ...simulation,
      isRunning: !simulation.isRunning,
      runtime: simulation.isRunning ? 0 : simulation.runtime,
    });
  };

  const handleReset = () => {
    onSimulationChange({
      ...simulation,
      isRunning: false,
      vehicleDensity: 50,
      speedFactor: 70,
      emergencyPriority: false,
      autoMode: true,
      runtime: 0,
    });
  };

  const getScenarioLabel = (scenario) => {
    switch (scenario) {
      case 'morning': return 'Morning Peak';
      case 'afternoon': return 'Afternoon Normal';
      case 'evening': return 'Evening Rush';
      case 'accident': return 'Accident Simulation';
      default: return 'Unknown';
    }
  };

  const totalVehicles = intersections.reduce((sum, int) => sum + int.vehicleCount, 0);
  const avgSpeed = intersections.length > 0 
    ? Math.round(intersections.reduce((sum, int) => sum + int.averageSpeed, 0) / intersections.length)
    : 0;
  const congestionCount = intersections.filter(int => int.congestionLevel === 'heavy').length;

  return (
    <Card className="shadow-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Simulation Control Panel
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Controls */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">Main Controls</h3>
            
            <Button
              onClick={handleToggleSimulation}
              size="lg"
              variant={simulation.isRunning ? "destructive" : "default"}
              className="w-full gap-2 font-semibold"
            >
              {simulation.isRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Stop Simulation
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start Simulation
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scenario</label>
              <Select
                value={simulation.scenario}
                onValueChange={(value) =>
                  onSimulationChange({
                    ...simulation,
                    scenario: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">🌅 Morning Peak</SelectItem>
                  <SelectItem value="afternoon">☀️ Afternoon Normal</SelectItem>
                  <SelectItem value="evening">🌆 Evening Rush</SelectItem>
                  <SelectItem value="accident">🚨 Accident Simulation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">Parameters</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Vehicle Density</label>
                  <span className="text-sm text-muted-foreground">{simulation.vehicleDensity}%</span>
                </div>
                <Slider
                  value={[simulation.vehicleDensity]}
                  onValueChange={([value]) =>
                    onSimulationChange({ ...simulation, vehicleDensity: value })
                  }
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Speed Factor</label>
                  <span className="text-sm text-muted-foreground">{simulation.speedFactor}%</span>
                </div>
                <Slider
                  value={[simulation.speedFactor]}
                  onValueChange={([value]) =>
                    onSimulationChange({ ...simulation, speedFactor: value })
                  }
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-dashboard-panel rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Emergency Priority</span>
                </div>
                <Switch
                  checked={simulation.emergencyPriority}
                  onCheckedChange={(checked) =>
                    onSimulationChange({ ...simulation, emergencyPriority: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-dashboard-panel rounded-lg">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Auto Mode</span>
                </div>
                <Switch
                  checked={simulation.autoMode}
                  onCheckedChange={(checked) =>
                    onSimulationChange({ ...simulation, autoMode: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">System Status</h3>
            
            <div className="space-y-3">
              <div className="bg-dashboard-panel p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    simulation.isRunning 
                      ? 'bg-control-active text-white' 
                      : 'bg-control-inactive text-muted-foreground'
                  }`}>
                    {simulation.isRunning ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>
              </div>

              <div className="bg-dashboard-panel p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Scenario</span>
                  <span className="text-sm font-medium">{getScenarioLabel(simulation.scenario)}</span>
                </div>
              </div>

              <div className="bg-dashboard-panel p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mode</span>
                  <span className="text-sm font-medium">
                    {simulation.autoMode ? 'Automatic' : 'Manual'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">Live Statistics</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gradient-primary p-3 rounded-lg text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Total Vehicles</span>
                </div>
                <div className="text-xl font-bold animate-data-update">{totalVehicles}</div>
              </div>

              <div className="bg-dashboard-panel p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Speed</span>
                  <span className="font-bold animate-data-update">{avgSpeed} km/h</span>
                </div>
              </div>

              <div className="bg-dashboard-panel p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Congested</span>
                  <span className={`font-bold animate-data-update ${
                    congestionCount > 0 ? 'text-traffic-red' : 'text-traffic-green'
                  }`}>
                    {congestionCount} / {intersections.length}
                  </span>
                </div>
              </div>

              <div className="bg-dashboard-panel p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Runtime</span>
                  <span className="font-mono text-sm font-bold">
                    {Math.floor(simulation.runtime / 60).toString().padStart(2, '0')}:
                    {(simulation.runtime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
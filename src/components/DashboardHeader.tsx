import React from 'react';
import { Activity, Play, Pause, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimulationState } from './Dashboard';

interface DashboardHeaderProps {
  simulation: SimulationState;
  onSimulationChange: (simulation: SimulationState) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  simulation,
  onSimulationChange
}) => {
  const formatRuntime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSimulation = () => {
    onSimulationChange({
      ...simulation,
      isRunning: !simulation.isRunning,
      runtime: simulation.isRunning ? 0 : simulation.runtime,
    });
  };

  return (
    <header className="bg-dashboard-header border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Traffic Control Dashboard</h1>
            <p className="text-sm text-muted-foreground">Real-time traffic monitoring and optimization</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Runtime Display */}
          <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{formatRuntime(simulation.runtime)}</span>
          </div>

          {/* Simulation Status */}
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            simulation.isRunning 
              ? 'bg-control-active text-white' 
              : 'bg-control-inactive text-muted-foreground'
          }`}>
            {simulation.isRunning ? 'ACTIVE' : 'STANDBY'}
          </div>

          {/* Quick Start/Stop */}
          <Button
            onClick={handleToggleSimulation}
            variant={simulation.isRunning ? "destructive" : "default"}
            size="sm"
            className="gap-2"
          >
            {simulation.isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
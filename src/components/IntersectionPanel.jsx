import React from 'react';
import { MapPin, Car, Gauge, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const IntersectionPanel = ({
  intersection,
  onSignalChange,
  autoMode
}) => {
  if (!intersection) {
    return (
      <Card className="h-[600px] shadow-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Intersection
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          Click on an intersection to view details
        </CardContent>
      </Card>
    );
  }

  const getSignalColor = (state) => {
    switch (state) {
      case 'red': return 'text-traffic-red';
      case 'yellow': return 'text-traffic-yellow';
      case 'green': return 'text-traffic-green';
      default: return 'text-muted-foreground';
    }
  };

  const getCongestionColor = (level) => {
    switch (level) {
      case 'heavy': return 'text-traffic-red bg-traffic-red/10';
      case 'moderate': return 'text-traffic-yellow bg-traffic-yellow/10';
      default: return 'text-traffic-green bg-traffic-green/10';
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card className="h-[600px] shadow-panel">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {intersection.name}
        </CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Updated: {formatTime(intersection.lastUpdated)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Traffic Signal */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Traffic Signal</h3>
          <div className="flex justify-center mb-4">
            <div className="bg-card-foreground/10 p-4 rounded-lg">
              <div className="space-y-2">
                <div className={`w-6 h-6 rounded-full mx-auto ${
                  intersection.signalState === 'red' ? 'bg-traffic-red shadow-traffic-red' : 'bg-muted/30'
                } ${intersection.signalState === 'red' ? 'animate-pulse-glow' : ''}`} />
                <div className={`w-6 h-6 rounded-full mx-auto ${
                  intersection.signalState === 'yellow' ? 'bg-traffic-yellow shadow-traffic-yellow animate-traffic-blink' : 'bg-muted/30'
                }`} />
                <div className={`w-6 h-6 rounded-full mx-auto ${
                  intersection.signalState === 'green' ? 'bg-traffic-green shadow-traffic-green' : 'bg-muted/30'
                } ${intersection.signalState === 'green' ? 'animate-pulse-glow' : ''}`} />
              </div>
            </div>
          </div>

          {/* Manual Controls */}
          {!autoMode && (
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant={intersection.signalState === 'red' ? 'destructive' : 'outline'}
                onClick={() => onSignalChange(intersection.id, 'red')}
              >
                Red
              </Button>
              <Button
                size="sm"
                variant={intersection.signalState === 'yellow' ? 'default' : 'outline'}
                onClick={() => onSignalChange(intersection.id, 'yellow')}
                className={intersection.signalState === 'yellow' ? 'bg-traffic-yellow text-black' : ''}
              >
                Yellow
              </Button>
              <Button
                size="sm"
                variant={intersection.signalState === 'green' ? 'default' : 'outline'}
                onClick={() => onSignalChange(intersection.id, 'green')}
                className={intersection.signalState === 'green' ? 'bg-traffic-green text-white' : ''}
              >
                Green
              </Button>
            </div>
          )}
        </div>

        {/* Traffic Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Status</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dashboard-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Car className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Vehicles</span>
              </div>
              <div className="text-2xl font-bold animate-data-update">
                {intersection.vehicleCount}
              </div>
            </div>

            <div className="bg-dashboard-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Avg Speed</span>
              </div>
              <div className="text-2xl font-bold animate-data-update">
                {intersection.averageSpeed}
                <span className="text-sm font-normal text-muted-foreground ml-1">km/h</span>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-lg ${getCongestionColor(intersection.congestionLevel)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Congestion Level</span>
              <span className="font-bold capitalize">{intersection.congestionLevel}</span>
            </div>
          </div>
        </div>

        {/* Traffic Trend Chart */}
        <div>
          <h4 className="text-sm font-medium mb-2">Traffic Trend</h4>
          <div className="h-16 bg-dashboard-panel rounded p-2">
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'hsl(var(--traffic-green))', stopOpacity: 0.8 }} />
                  <stop offset="50%" style={{ stopColor: 'hsl(var(--traffic-yellow))', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: 'hsl(var(--traffic-red))', stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="url(#trendGradient)"
                strokeWidth="2"
                points="0,40 20,35 40,30 60,25 80,35 100,30"
                className="animate-slide-up"
              />
              <circle cx="100" cy="30" r="2" fill="hsl(var(--primary))" className="animate-pulse-glow" />
            </svg>
          </div>
        </div>

        {/* Auto Mode Indicator */}
        <div className={`p-3 rounded-lg border ${autoMode ? 'bg-control-active/10 border-control-active/30' : 'bg-control-inactive/10 border-control-inactive/30'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto Mode</span>
            <div className="flex items-center gap-2">
              {autoMode ? <ToggleRight className="h-5 w-5 text-control-active" /> : <ToggleLeft className="h-5 w-5 text-control-inactive" />}
              <span className={`text-sm ${autoMode ? 'text-control-active' : 'text-control-inactive'}`}>
                {autoMode ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
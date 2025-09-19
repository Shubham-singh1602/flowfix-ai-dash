import React from 'react';
import { Car, Navigation } from 'lucide-react';

export const TrafficMap = ({
  intersections,
  selectedIntersection,
  onIntersectionClick,
  isSimulationRunning
}) => {
  const getIntersectionColor = (intersection) => {
    switch (intersection.congestionLevel) {
      case 'heavy': return 'bg-traffic-red shadow-traffic-red';
      case 'moderate': return 'bg-traffic-yellow shadow-traffic-yellow';
      default: return 'bg-traffic-green shadow-traffic-green';
    }
  };

  const getSignalColor = (signalState) => {
    switch (signalState) {
      case 'red': return 'bg-traffic-red';
      case 'yellow': return 'bg-traffic-yellow';
      case 'green': return 'bg-traffic-green';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="relative w-full h-full bg-dashboard-panel rounded-lg border border-border overflow-hidden">
      {/* Map Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="text-muted-foreground">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Roads */}
      <div className="absolute inset-0">
        {/* Horizontal roads */}
        <div className="absolute top-[25%] left-0 right-0 h-2 bg-muted-foreground/30"></div>
        <div className="absolute top-[50%] left-0 right-0 h-2 bg-muted-foreground/30"></div>
        <div className="absolute top-[75%] left-0 right-0 h-2 bg-muted-foreground/30"></div>
        
        {/* Vertical roads */}
        <div className="absolute top-0 bottom-0 left-[30%] w-2 bg-muted-foreground/30"></div>
        <div className="absolute top-0 bottom-0 left-[60%] w-2 bg-muted-foreground/30"></div>
      </div>

      {/* Moving Vehicles */}
      {isSimulationRunning && (
        <>
          <Car className="absolute h-4 w-4 text-primary animate-vehicle-move" style={{ top: '24%', left: '-20px' }} />
          <Car className="absolute h-4 w-4 text-primary animate-vehicle-move" style={{ top: '49%', left: '-20px', animationDelay: '2s' }} />
          <Car className="absolute h-4 w-4 text-primary animate-vehicle-move" style={{ top: '74%', left: '-20px', animationDelay: '4s' }} />
        </>
      )}

      {/* Intersections */}
      {intersections.map((intersection) => (
        <div
          key={intersection.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{
            left: `${intersection.x}%`,
            top: `${intersection.y}%`,
          }}
          onClick={() => onIntersectionClick(intersection.id)}
        >
          {/* Intersection Marker */}
          <div
            className={`
              w-8 h-8 rounded-full border-2 border-white transition-all duration-smooth
              ${getIntersectionColor(intersection)}
              ${selectedIntersection === intersection.id ? 'scale-125 animate-pulse-glow' : ''}
              ${intersection.congestionLevel === 'heavy' ? 'animate-pulse-glow' : ''}
              hover:scale-110 group-hover:animate-bounce-in
            `}
          >
            {/* Traffic Signal Indicator */}
            <div
              className={`
                w-2 h-2 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                ${getSignalColor(intersection.signalState)}
                ${intersection.signalState === 'yellow' ? 'animate-traffic-blink' : ''}
              `}
            />
          </div>

          {/* Intersection Label */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-smooth">
            <div className="bg-card text-card-foreground text-xs px-2 py-1 rounded shadow-panel whitespace-nowrap">
              <div className="font-medium">{intersection.name}</div>
              <div className="text-muted-foreground">
                {intersection.vehicleCount} vehicles • {intersection.averageSpeed} km/h
              </div>
            </div>
          </div>

          {/* Selection Indicator */}
          {selectedIntersection === intersection.id && (
            <div className="absolute inset-0 w-12 h-12 -m-2 border-2 border-primary rounded-full animate-pulse-glow" />
          )}
        </div>
      ))}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-card p-2 rounded shadow-panel">
          <Navigation className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card p-3 rounded shadow-panel">
        <h4 className="text-sm font-medium mb-2">Traffic Levels</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-traffic-green shadow-traffic-green" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-traffic-yellow shadow-traffic-yellow" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-traffic-red shadow-traffic-red" />
            <span>Heavy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
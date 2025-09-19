import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

export const TrafficCharts = ({ data, intersections }) => {
  const intersectionData = intersections.map(intersection => ({
    name: intersection.name.split(' & ')[0], // Shortened names for display
    vehicles: intersection.vehicleCount,
    speed: intersection.averageSpeed,
    congestionLevel: intersection.congestionLevel,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-panel">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'speed' ? ' km/h' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getBarColor = (congestionLevel) => {
    switch (congestionLevel) {
      case 'heavy': return 'hsl(var(--traffic-red))';
      case 'moderate': return 'hsl(var(--traffic-yellow))';
      default: return 'hsl(var(--traffic-green))';
    }
  };

  return (
    <div className="space-y-6 h-full">
      {/* Traffic Volume Over Time */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-medium">Volume Trend</h4>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Speed Over Time */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-success" />
          <h4 className="text-sm font-medium">Speed Trend</h4>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: 'hsl(var(--success))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intersections Comparison */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Intersection Status</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intersectionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-panel">
                        <p className="text-sm font-medium mb-2">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          Vehicles: {data.vehicles} • Speed: {data.speed} km/h
                        </p>
                        <p className={`text-xs capitalize font-medium ${
                          data.congestionLevel === 'heavy' ? 'text-traffic-red' :
                          data.congestionLevel === 'moderate' ? 'text-traffic-yellow' :
                          'text-traffic-green'
                        }`}>
                          {data.congestionLevel} congestion
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="vehicles" 
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-dashboard-panel p-2 rounded">
          <div className="text-muted-foreground">Active Signals</div>
          <div className="font-bold">{intersections.filter(i => i.signalState === 'green').length}</div>
        </div>
        <div className="bg-dashboard-panel p-2 rounded">
          <div className="text-muted-foreground">Avg Response</div>
          <div className="font-bold">2.3s</div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

interface ChartDataEntry {
  time: string;
  volume: number;
  speed: number;
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

interface TrafficChartsProps {
  data: ChartDataEntry[];
  intersections: Intersection[];
}

export const TrafficCharts: React.FC<TrafficChartsProps> = ({ data, intersections }) => {
  const intersectionData = intersections.map(intersection => ({
    name: intersection.id.replace('int-', 'NODE_').toUpperCase(),
    vehicles: intersection.vehicleCount,
    speed: intersection.averageSpeed,
  }));

  // Calculate telemetry values for the top stats strip
  const totalVehicles = intersections.reduce((sum, int) => sum + int.vehicleCount, 0);
  const avgSpeed = intersections.length > 0 
    ? Math.round(intersections.reduce((sum, int) => sum + int.averageSpeed, 0) / intersections.length)
    : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0e1219] border border-[#1c2333] p-2 text-[10px] font-mono text-[#e2f0ff]">
          <div>TIME: {payload[0].payload.time}</div>
          {payload.map((p: any, idx: number) => (
            <div key={idx} style={{ color: p.stroke || p.fill }} className="font-bold">
              {p.name.toUpperCase()}: {p.value.toFixed(1)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 h-full flex flex-col justify-between select-none font-mono">
      {/* Stats strip above charts */}
      <div className="border border-[#1c2333] bg-[#0e1219] px-2.5 py-1.5 text-[9px] font-bold text-[#c8d8e8] flex justify-between tracking-wide">
        <span>ECO EFF  94.8%</span>
        <span className="text-[#4a5a6a]">|</span>
        <span>AI RESP  1.8s</span>
        <span className="text-[#4a5a6a]">|</span>
        <span>LOAD  {padNumber(totalVehicles)} VEH</span>
      </div>

      {/* Traffic Volume Trend (Line Chart) */}
      <div className="space-y-1">
        <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase">
          ◆ VOLUME_TREND // GRID LOAD
        </div>
        <div className="h-[95px] bg-[#050508] border border-[#1c2333] p-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="#1c2333" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: '#4a5a6a' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: '#4a5a6a' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1c2333', strokeWidth: 1 }} />
              <Line 
                type="linear" // sharp linear type
                dataKey="volume" 
                name="Volume"
                stroke="#00d4ff" // --accent-cyan
                strokeWidth={1}
                dot={false}
                activeDot={{ 
                  r: 3, 
                  fill: '#00d4ff',
                  stroke: '#050508',
                  strokeWidth: 1.5
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Speed Trend (Line Chart) */}
      <div className="space-y-1">
        <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase">
          ◆ VELOCITY_INDEX // KM/H
        </div>
        <div className="h-[95px] bg-[#050508] border border-[#1c2333] p-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="#1c2333" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: '#4a5a6a' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: '#4a5a6a' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1c2333', strokeWidth: 1 }} />
              <Line 
                type="linear" 
                dataKey="speed" 
                name="Velocity"
                stroke="#00ff88" // --accent-emerald
                strokeWidth={1}
                dot={false}
                activeDot={{ 
                  r: 3, 
                  fill: '#00ff88',
                  stroke: '#050508',
                  strokeWidth: 1.5
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intersections Queue Comparison (Bar Chart) */}
      <div className="space-y-1">
        <div className="text-[9px] font-bold text-[#4a5a6a] tracking-wider uppercase">
          ◆ QUEUE_LOAD // NODE COMPARISON
        </div>
        <div className="h-[110px] bg-[#050508] border border-[#1c2333] p-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intersectionData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid stroke="#1c2333" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 7, fill: '#4a5a6a' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: '#4a5a6a' }}
              />
              <Tooltip 
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const payData = payload[0].payload;
                    return (
                      <div className="bg-[#0e1219] border border-[#1c2333] p-2 text-[10px] font-mono text-[#e2f0ff]">
                        <div className="font-bold">{payData.name}</div>
                        <div className="text-[#00d4ff] mt-0.5">QUEUE: {payData.vehicles}</div>
                        <div className="text-[#ffaa00]">SPEED: {payData.speed} KM/H</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="vehicles" 
                name="Queue Size"
                fill="#7c3aed" // --accent-violet
                radius={0} // sharp bars: no corners!
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const padNumber = (num: number, size: number = 3) => {
  let s = num.toString();
  while (s.length < size) s = "0" + s;
  return s;
};
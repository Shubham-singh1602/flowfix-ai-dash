import React from 'react';

interface Alert {
  id: string;
  type: string;
  message: string;
  intersectionId?: string;
  timestamp: Date;
  severity: 'high' | 'medium' | 'info';
}

interface AlertsPanelProps {
  alerts: Alert[];
  onAlertClick: (id: string) => void;
  onClearAlert: (id: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getAlertColorClass = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('SPEEDING')) return 'text-[#ffaa00]'; // --accent-amber
    if (t.includes('RED LIGHT') || t.includes('VIOLATION')) return 'text-[#ff3355]'; // --accent-rose
    if (t.includes('EVP') || t.includes('EMERGENCY')) return 'text-[#7c3aed]'; // --accent-violet
    if (t.includes('PEDESTRIAN')) return 'text-[#00d4ff]'; // --accent-cyan
    return 'text-[#c8d8e8]';
  };

  // Construct scrolling ticker line
  // If there are no alerts, display a system heartbeat log
  const tickerItems = alerts.length > 0 ? alerts : [
    {
      id: 'default-1',
      type: 'SYSTEM HEARTBEAT',
      message: 'TELEMETRY CHANNELS SYNCHRONIZED // FLOW CONTROL ONLINE',
      timestamp: new Date()
    },
    {
      id: 'default-2',
      type: 'GRID HEALTH',
      message: 'ALL INTERSECTIONS REPORTING STABLE QUEUE PRESETS',
      timestamp: new Date()
    }
  ];

  return (
    <div className="h-[32px] border-y border-[#1c2333] bg-[#0e1219] flex items-center select-none font-mono overflow-hidden">
      {/* Left indicator cell (locks in position) */}
      <div className="h-full px-3 bg-[#0a0c12] border-r border-[#1c2333] flex items-center gap-1.5 z-10 shrink-0">
        <span className="w-1.5 h-1.5 bg-[#ff3355] rounded-full animate-blink" />
        <span className="text-[9px] font-bold text-[#4a5a6a] tracking-wider">◆ LIVE FEED</span>
      </div>

      {/* Marquee channel */}
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div className="animate-marquee flex gap-12 pl-[100%] items-center">
          {tickerItems.map((alert) => {
            const colorClass = getAlertColorClass(alert.type);
            return (
              <span key={alert.id} className="text-[10px] font-bold tracking-wide flex items-center gap-2">
                <span className="text-[#4a5a6a] font-mono">[{formatTime(alert.timestamp)}]</span>
                <span className={`${colorClass} font-mono uppercase`}>{alert.type}</span>
                <span className="text-[#c8d8e8]">//</span>
                <span className="text-[#e2f0ff] font-mono">{alert.message.toUpperCase()}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { AlertTriangle, Clock, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrafficAlert } from './Dashboard';

interface AlertsPanelProps {
  alerts: TrafficAlert[];
  onAlertClick: (alertId: string) => void;
  onClearAlert: (alertId: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAlertClick,
  onClearAlert
}) => {
  if (alerts.length === 0) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'medium': return 'bg-warning/10 border-warning/30 text-warning';
      default: return 'bg-muted/10 border-muted/30 text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-2 animate-slide-up">
      {alerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className={`
            p-3 rounded-lg border cursor-pointer transition-all duration-smooth
            hover:scale-[1.02] hover:shadow-panel
            ${getSeverityColor(alert.severity)}
            ${alert.severity === 'high' ? 'animate-pulse-glow' : ''}
          `}
          onClick={() => onAlertClick(alert.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium capitalize">{alert.type} Alert</span>
                  <span className="text-xs px-2 py-0.5 bg-background/50 rounded-full">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
                <p className="text-sm opacity-90 line-clamp-2">{alert.message}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onClearAlert(alert.id);
              }}
              className="h-6 w-6 p-0 hover:bg-background/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}

      {alerts.length > 3 && (
        <div className="text-center">
          <Button variant="outline" size="sm" className="text-xs">
            View {alerts.length - 3} more alerts
          </Button>
        </div>
      )}
    </div>
  );
};
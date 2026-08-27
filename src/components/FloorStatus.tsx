import { useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { stations as initialStations, alerts as initialAlerts } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import type { Station, Alert } from '@/types/weldcloud';

export function FloorStatus() {
  const [stations] = useState<Station[]>(initialStations);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev: Alert[]) =>
      prev.map((a: Alert) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const unacknowledged = alerts.filter((a: Alert) => !a.acknowledged);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-1">
          Supervisor · Cell B · 06:14 PM · Voice alerts push to earpiece
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-hi)]">Cell B — 4 stations</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stations.map((station: Station) => (
          <div
            key={station.id}
            className={`p-4 rounded-lg border ${
              station.heatInput && station.heatInput > 1.0
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-[var(--c-raised)] border-[var(--c-border)]'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <div
                className={`w-8 h-16 rounded-sm ${
                  station.status === 'arc-on'
                    ? station.heatInput && station.heatInput > 1.0
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                    : station.status === 'pre-weld'
                    ? 'bg-yellow-500/50'
                    : 'bg-[var(--c-border)]'
                }`}
              />
            </div>
            <div className="text-center">
              <div
                className={`text-sm font-bold ${
                  station.heatInput && station.heatInput > 1.0 ? 'text-yellow-500' : 'text-[var(--text-hi)]'
                }`}
              >
                {station.heatInput?.toFixed(2) || '—'}
              </div>
              <div className="text-xs text-[var(--text-dim)]">{station.id}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {stations.map((station: Station) => (
          <div
            key={station.id}
            className={`p-4 rounded-lg border ${
              station.heatInput && station.heatInput > 1.0
                ? 'bg-yellow-500/5 border-yellow-500/20'
                : 'bg-[var(--c-raised)] border-[var(--c-border)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm font-bold text-[var(--text-hi)]">{station.id}</div>
                  <div className="text-xs text-[var(--text-lo)]">{station.welder}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        station.status === 'arc-on'
                          ? 'bg-green-500'
                          : station.status === 'pre-weld'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}
                    />
                    <span className="text-xs text-[var(--text-dim)]">
                      {station.status === 'arc-on'
                        ? 'Arc on'
                        : station.status === 'pre-weld'
                        ? 'Pre-weld'
                        : 'Idle'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-[var(--text-dim)]">WPS Conform.</div>
                <div
                  className={`text-lg font-bold ${
                    station.wpsConformance && station.wpsConformance < 80
                      ? 'text-yellow-500'
                      : 'text-[var(--text-hi)]'
                  }`}
                >
                  {station.wpsConformance ? `${station.wpsConformance}%` : '—'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {unacknowledged.length > 0 && (
        <div className="space-y-3">
          {unacknowledged.map((alert: Alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-hi)] font-medium">{alert.message}</p>
                  <p className="text-xs text-[var(--text-lo)] mt-0.5">
                    Voice alert sent to earpiece · {alert.time} · no acknowledgement
                  </p>
                </div>
              </div>
              <Button
                onClick={() => acknowledgeAlert(alert.id)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
              >
                Acknowledge
              </Button>
            </div>
          ))}
        </div>
      )}

      {unacknowledged.length === 0 && (
        <div className="flex items-center justify-center gap-2 p-6 text-[var(--text-verified)]">
          <Check className="w-5 h-5" />
          <span className="text-sm">All alerts acknowledged</span>
        </div>
      )}
    </div>
  );
}
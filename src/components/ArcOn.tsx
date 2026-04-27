import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { machineSpec } from '@/data/mockData';

interface ArcOnProps {
  arcTime: number;
  onPause: () => void;
  onComplete: () => void;
}

export function ArcOn({ arcTime, onPause, onComplete }: ArcOnProps) {
  const [readings, setReadings] = useState({
    voltage: 23.8,
    current: 212,
    travel: 31,
    heatInput: 1.04,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setReadings(() => ({
        voltage: Number((23.5 + Math.random() * 0.8).toFixed(1)),
        current: Math.floor(208 + Math.random() * 10),
        travel: Math.floor(30 + Math.random() * 3),
        heatInput: Number((1.02 + Math.random() * 0.05).toFixed(2)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 mb-3">
          <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div className="text-xs font-bold text-green-500 uppercase tracking-[0.2em] mb-2">Arc On</div>
        <div className="text-5xl md:text-6xl font-bold text-white font-mono tracking-tight">
          {formatTime(arcTime)}
        </div>
        <div className="text-sm text-gray-400 mt-2">W-014 · 3G butt · fill pass</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Voltage</div>
          <div className="text-2xl font-bold text-white">
            {readings.voltage}<span className="text-sm text-gray-500 font-normal"> V</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Current</div>
          <div className="text-2xl font-bold text-white">
            {readings.current}<span className="text-sm text-gray-500 font-normal"> A</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Travel</div>
          <div className="text-2xl font-bold text-yellow-500">
            {readings.travel}<span className="text-sm text-gray-500 font-normal"> cm/min</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Heat In</div>
          <div className="text-2xl font-bold text-yellow-500">
            {readings.heatInput}<span className="text-sm text-gray-500 font-normal"> kJ/mm</span>
          </div>
        </div>
      </div>

      {readings.heatInput > 1.0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-500">
            Heat input over WPS limit — increase travel to 34 cm/min
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Voice Commands Active</div>
          <div className="space-y-2">
            <button
              onClick={onPause}
              className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg transition-colors text-left"
            >
              <span className="px-2 py-1 bg-[#2a2a2a] rounded text-xs text-yellow-500 font-mono">"pause"</span>
              <span className="text-sm text-gray-400">Pause and hold arc record</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg transition-colors text-left">
              <span className="px-2 py-1 bg-[#2a2a2a] rounded text-xs text-yellow-500 font-mono">"deviation"</span>
              <span className="text-sm text-gray-400">Flag a deviation and describe</span>
            </button>
            <button
              onClick={onComplete}
              className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg transition-colors text-left"
            >
              <span className="px-2 py-1 bg-[#2a2a2a] rounded text-xs text-yellow-500 font-mono">"complete"</span>
              <span className="text-sm text-gray-400">Mark arc done (confirm required)</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Live · Fleet · 4 Hz</div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Machine</span>
                <span className="text-white font-medium">{machineSpec.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Layer</span>
                <span className="text-white font-medium">{machineSpec.layer}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Deposition</span>
                <span className="text-white font-medium">{machineSpec.deposition}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">WPS heat max</span>
                <span className="text-yellow-500 font-medium">{machineSpec.wpsHeatMax}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
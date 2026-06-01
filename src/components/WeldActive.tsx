import { useState, useEffect } from 'react';
import { AlertTriangle, Check, Play, ChevronDown, ChevronUp, Package, ArrowRight, Zap } from 'lucide-react';
import { Weld, Part } from '@/types/weldcloud';
import { gasSpec, machineSpec } from '@/data/mockData';
import { DrawingWithHighlight } from './DrawingWithHighlight';
import { Badge } from '@/components/ui/badge';

interface WeldActiveProps {
  mode: 'setup' | 'arc';
  onStartArc: () => void;
  onTogglePause: () => void;
  onComplete: () => void;
  onDoneNext: () => void;
  onChooseDifferent: () => void;
  onVerify: (id: string) => void;
  allVerified: boolean;
  selectedWeld: Weld | null;
  parts: Part[];
  onSelectWeld: (weld: Weld) => void;
  arcTime: number;
  isPaused: boolean;
  nextWeld: Weld | null;
}

export function WeldActive({
  mode,
  onStartArc,
  onTogglePause,
  onComplete,
  onDoneNext,
  onChooseDifferent,
  onVerify,
  allVerified,
  selectedWeld,
  parts,
  onSelectWeld,
  arcTime,
  isPaused,
  nextWeld,
}: WeldActiveProps) {
  if (mode === 'setup') {
    return (
      <WeldActiveSetup
        onStartArc={onStartArc}
        onVerify={onVerify}
        allVerified={allVerified}
        selectedWeld={selectedWeld}
        parts={parts}
        onSelectWeld={onSelectWeld}
      />
    );
  }

  return (
    <WeldActiveArc
      onTogglePause={onTogglePause}
      onComplete={onComplete}
      onDoneNext={onDoneNext}
      onChooseDifferent={onChooseDifferent}
      selectedWeld={selectedWeld}
      parts={parts}
      arcTime={arcTime}
      isPaused={isPaused}
      nextWeld={nextWeld}
    />
  );
}

/* ───────── SETUP VIEW ───────── */

function WeldActiveSetup({
  onStartArc,
  onVerify,
  allVerified,
  selectedWeld,
  parts,
  onSelectWeld,
}: Omit<WeldActiveProps, 'mode' | 'onTogglePause' | 'onComplete' | 'onDoneNext' | 'arcTime' | 'isPaused' | 'nextWeld'>) {
  const currentPart = selectedWeld
    ? parts.find(p => p.id === selectedWeld.partNumber)
    : undefined;
  
  const allWelds = currentPart?.welds || [];
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);

  const togglePart = (e: React.MouseEvent, partId: string) => {
    e.stopPropagation();
    setExpandedPartId((current) => (current === partId ? null : partId));
  };

  return (
    <div className="p-4 md:p-6">
      {/* Top header with weld info + WPS badges + Start Arc */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {selectedWeld?.id || '—'} · {selectedWeld?.jointType || '—'}
          </h1>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#2a2a2a]">
              {selectedWeld?.wps}
            </span>
            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded border border-yellow-500/20 font-mono">
              {selectedWeld?.process}
            </span>
            <button
              onClick={onStartArc}
              disabled={!allVerified}
              className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
                allVerified
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                  : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Arc
            </button>
          </div>
        </div>
      </div>

      {/* Part Drawing */}
      <div className="mb-6">
        <DrawingWithHighlight selectedWeld={selectedWeld} currentPart={currentPart} />
      </div>

      {/* All welds on this part */}
      {allWelds.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
            Welds on this part — tap to switch
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {allWelds.map((weld) => {
              const isCurrent = weld.id === selectedWeld?.id;
              return (
                <button
                  key={weld.id}
                  onClick={() => !isCurrent && onSelectWeld(weld)}
                  disabled={isCurrent}
                  className={`relative text-center p-4 rounded-xl transition-colors ${
                    isCurrent
                      ? 'bg-yellow-500/10 border border-yellow-500/40 cursor-default'
                      : 'bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-yellow-500/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-mono border ${
                    isCurrent
                      ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                      : 'text-gray-500 bg-[#141414] border-[#2a2a2a]'
                  }`}>
                    {weld.process}
                  </span>

                  <div className={`text-3xl font-bold mb-1 ${
                    isCurrent ? 'text-white' : 'text-gray-400'
                  }`}>
                    {weld.id}
                  </div>

                  <div className={`text-[11px] mb-3 ${
                    isCurrent ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {weld.jointType}
                  </div>

                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className={`text-[9px] px-2 py-0.5 rounded ${
                      isCurrent ? 'text-gray-400 bg-[#141414]' : 'text-gray-600 bg-[#141414]'
                    }`}>
                      {weld.wps}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded ${
                      isCurrent ? 'text-gray-400 bg-[#141414]' : 'text-gray-600 bg-[#141414]'
                    }`}>
                      {weld.duration} min
                    </span>
                    {weld.priority && (
                      <span className={`text-[9px] px-2 py-0.5 rounded ${
                        isCurrent ? 'text-red-400 bg-red-500/10' : 'text-red-900 bg-red-500/5'
                      }`}>
                        Priority
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom: Gas confirmed + Gas spec */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <span className="text-yellow-500">🎤</span>
              <span className="font-mono">"gas confirmed"</span>
            </div>
            <div className="bg-[#141414] rounded-lg p-4">
              <p className="text-sm text-white font-medium mb-3">
                Confirm Ar/CO₂ 80/20 shielding gas present and connected?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onVerify('c4')}
                  className="flex flex-col items-center justify-center gap-1 p-4 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                >
                  <span className="text-white text-lg">✓</span>
                  <span className="text-white font-medium">Yes</span>
                  <span className="text-[10px] text-green-200">Say 'yes' or tap</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1 p-4 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg transition-colors">
                  <span className="text-white text-lg">✕</span>
                  <span className="text-white font-medium">No</span>
                  <span className="text-[10px] text-gray-400">Say 'no' or tap</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">WPS-A36-3G · Gas Spec</div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Mix</span>
                <span className="text-white font-medium">{gasSpec.mix}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Flow rate</span>
                <span className="text-white font-medium">{gasSpec.flowRate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Min pressure</span>
                <span className="text-white font-medium">{gasSpec.minPressure}</span>
              </div>
            </div>
          </div>
          
          {!allVerified && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-500">
                Scan all consumables in the right panel before starting arc.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── ARC VIEW ───────── */

function WeldActiveArc({
  onTogglePause,
  onComplete,
  onDoneNext,
  onChooseDifferent,
  selectedWeld,
  parts,
  arcTime,
  isPaused,
  nextWeld,
}: Omit<WeldActiveProps, 'mode' | 'onStartArc' | 'onVerify' | 'allVerified' | 'onSelectWeld'>) {
  const currentPart = selectedWeld
    ? parts.find(p => p.id === selectedWeld.partNumber)
    : undefined;

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
      {/* Compact Drawing */}
      <div className="mb-6">
        <DrawingWithHighlight selectedWeld={selectedWeld} currentPart={currentPart} compact />
      </div>

      {/* Arc Indicator + Timer */}
      <div className="mb-6 text-center">
        <button
          onClick={onTogglePause}
          className="inline-flex flex-col items-center justify-center group cursor-pointer"
        >
          <div
            className={`w-16 h-16 rounded-full border-2 mb-3 flex items-center justify-center transition-all duration-300 ${
              isPaused
                ? 'bg-yellow-500/10 border-yellow-500'
                : 'bg-green-500/10 border-green-500'
            }`}
          >
            {isPaused ? (
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
          <div
            className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 transition-colors ${
              isPaused ? 'text-yellow-500' : 'text-green-500'
            }`}
          >
            {isPaused ? 'Arc Paused' : 'Arc On'}
          </div>
        </button>
        <div className="text-5xl md:text-6xl font-bold text-white font-mono tracking-tight">
          {formatTime(arcTime)}
        </div>
        <div className="text-sm text-gray-400 mt-2">W-014 · 3G butt · fill pass</div>
      </div>

      {isPaused ? (
        /* Paused state: action buttons */
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={onDoneNext}
            className="w-full flex flex-col items-center justify-center gap-1 p-6 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300 rounded-xl transition-colors"
          >
            <span className="text-black font-bold text-2xl">Done</span>
            <span className="text-black/70 text-sm font-medium">Start next weld</span>
          </button>
          
          <button
            onClick={onChooseDifferent}
            className="w-full flex items-center justify-center p-4 bg-[#2a2a2a] hover:bg-[#333333] border border-[#3a3a3a] rounded-xl transition-colors text-white font-medium"
          >
            Choose different weld
          </button>
        </div>
      ) : (
        /* Running state: live readings + commands */
        <>
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
                  onClick={onTogglePause}
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
        </>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { AlertTriangle, Check, Play, ChevronDown, ChevronUp, Package, ArrowRight, Zap, ArrowLeft, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { Weld, Part, CompletedWeld } from '@/types/weldcloud';
import { gasSpec, machineSpec } from '@/data/mockData';
import { DrawingWithHighlight } from './DrawingWithHighlight';
import { CompletedWelds } from './CompletedWelds';
import { Badge } from '@/components/ui/badge';

interface WeldActiveProps {
  mode: 'setup' | 'arc';
  onStartArc: () => void;
  onTogglePause: () => void;
  onComplete: () => void;
  onDoneNext: () => void;
  onChooseDifferent: () => void;
  onBackToQueue: () => void;
  onVerify: (id: string) => void;
  allVerified: boolean;
  /** False when the work order's flags don't require consumable verification */
  verificationNeeded?: boolean;
  /** False when the work order has no sign-off step */
  showSign?: boolean;
  selectedWeld: Weld | null;
  parts: Part[];
  onSelectWeld: (weld: Weld) => void;
  arcTime: number;
  isPaused: boolean;
  nextWeld: Weld | null;
  completedWelds?: CompletedWeld[];
  onGoToReview: () => void;
  lastCompletedPartId?: string | null;
}

export function WeldActive({
  mode,
  onStartArc,
  onTogglePause,
  onComplete,
  onDoneNext,
  onChooseDifferent,
  onBackToQueue,
  onVerify,
  allVerified,
  verificationNeeded = true,
  showSign = true,
  selectedWeld,
  parts,
  onSelectWeld,
  arcTime,
  isPaused,
  nextWeld,
  completedWelds,
  onGoToReview,
  lastCompletedPartId,
}: WeldActiveProps) {
  // No active weld — show completion screen. This covers both "just finished a part,
  // other parts still queued" and "all assigned welds done".
  if (!selectedWeld) {
    return (
      <AllWeldsComplete
        completedWelds={completedWelds || []}
        onGoToReview={onGoToReview}
        onBackToQueue={onBackToQueue}
        remainingParts={parts}
        lastCompletedPartId={lastCompletedPartId}
        showSign={showSign}
      />
    );
  }

  if (mode === 'setup') {
    return (
      <WeldActiveSetup
        onStartArc={onStartArc}
        onVerify={onVerify}
        allVerified={allVerified}
        verificationNeeded={verificationNeeded}
        selectedWeld={selectedWeld}
        parts={parts}
        onSelectWeld={onSelectWeld}
        onBackToQueue={onBackToQueue}
        completedWelds={completedWelds}
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

/* ───────── ALL WELDS COMPLETE ───────── */

function AllWeldsComplete({
  completedWelds,
  onGoToReview,
  onBackToQueue,
  remainingParts,
  lastCompletedPartId,
  showSign,
}: {
  completedWelds: CompletedWeld[];
  onGoToReview: () => void;
  onBackToQueue: () => void;
  remainingParts: Part[];
  lastCompletedPartId?: string | null;
  showSign: boolean;
}) {
  const hasRemainingParts = remainingParts.length > 0;

  // When a single part was just completed (and more remain), scope the summary to that part.
  const summaryWelds =
    hasRemainingParts && lastCompletedPartId
      ? completedWelds.filter((cw) => cw.weld.partNumber === lastCompletedPartId)
      : completedWelds;

  const totalArcTime = summaryWelds.reduce(
    (sum, cw) => sum + cw.arcs.reduce((a, arc) => a + arc.duration, 0),
    0
  );

  const uniqueParts = [...new Set(summaryWelds.map((cw) => cw.weld.partNumber))];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const heading = hasRemainingParts
    ? `Part ${lastCompletedPartId ?? uniqueParts[0] ?? ''} complete`.trim()
    : uniqueParts.length === 1
    ? `You've completed ${uniqueParts[0]}`
    : "You've completed all assigned welds";

  return (
    <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {heading}
        </h1>

        <p className="text-sm text-gray-400 mb-6">
          {summaryWelds.length} weld{summaryWelds.length !== 1 ? 's' : ''} finished
          {!hasRemainingParts && uniqueParts.length > 1 ? ` across ${uniqueParts.length} parts` : ''}
          {' · '}
          {formatTime(totalArcTime)} total arc time
          {hasRemainingParts && (
            <>
              {' · '}
              {remainingParts.length} part{remainingParts.length !== 1 ? 's' : ''} still in queue
            </>
          )}
        </p>

        <div className="space-y-3">
          <button
            onClick={onBackToQueue}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-colors ${
              hasRemainingParts
                ? 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300 text-black font-bold text-base'
                : 'bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] text-gray-300 font-medium text-sm'
            }`}
          >
            <ArrowLeft className={hasRemainingParts ? 'w-5 h-5' : 'w-4 h-4'} />
            {hasRemainingParts ? 'Choose next task' : 'Back to task queue'}
          </button>

          {showSign && (
            <button
              onClick={onGoToReview}
              className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-colors ${
                hasRemainingParts
                  ? 'bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] text-gray-300 font-medium text-sm'
                  : 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300 text-black font-bold text-base'
              }`}
            >
              <ClipboardCheck className={hasRemainingParts ? 'w-4 h-4' : 'w-5 h-5'} />
              Review and sign welds
            </button>
          )}
        </div>

        <div className="mt-6 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Completed Summary</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xl font-bold text-white">{summaryWelds.length}</div>
              <div className="text-xs text-gray-500">Welds</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white font-mono">{formatTime(totalArcTime)}</div>
              <div className="text-xs text-gray-500">Arc Time</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {hasRemainingParts ? remainingParts.length : uniqueParts.length}
              </div>
              <div className="text-xs text-gray-500">{hasRemainingParts ? 'Remaining' : 'Parts'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── SETUP VIEW ───────── */

function WeldActiveSetup({
  onStartArc,
  onVerify,
  allVerified,
  verificationNeeded = true,
  selectedWeld,
  parts,
  onSelectWeld,
  onBackToQueue,
  completedWelds,
}: Omit<WeldActiveProps, 'mode' | 'onTogglePause' | 'onComplete' | 'onDoneNext' | 'onChooseDifferent' | 'arcTime' | 'isPaused' | 'nextWeld' | 'onGoToReview' | 'showSign'>) {
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
      {/* Top header with back button + weld info + WPS badges */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBackToQueue}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {selectedWeld?.id || '—'} · {selectedWeld?.jointType || '—'}
          </h1>
          
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <span className="text-xs text-gray-400 bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#2a2a2a]">
              {selectedWeld?.wps}
            </span>
            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded border border-yellow-500/20 font-mono">
              {selectedWeld?.process}
            </span>
          </div>
        </div>
      </div>

      {/* Part Drawing */}
      <div className="mb-6">
        <DrawingWithHighlight selectedWeld={selectedWeld} currentPart={currentPart} />
      </div>

      {/* Start Arc button - centered below drawing */}
      <div className="flex justify-center mb-6">
        <button
          onClick={onStartArc}
          disabled={!allVerified}
          className={`px-8 py-3 rounded-xl font-bold text-base transition-colors ${
            allVerified
              ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20'
              : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
          }`}
        >
          Start Arc
        </button>
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

      {/* Completed welds — moved here below the in-progress welds */}
      {completedWelds && completedWelds.length > 0 && (
        <div className="mb-6">
          <CompletedWelds completedWelds={completedWelds} />
        </div>
      )}

      {/* Bottom: Gas confirmed + Gas spec */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {verificationNeeded ? (
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
          ) : (
            <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">No consumable verification required</p>
                  <p className="text-xs text-gray-500">
                    This work order's traceability level doesn't require lot verification — ready to start.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">{selectedWeld?.wps} · Gas Spec</div>
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
          
          {verificationNeeded && !allVerified && (
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
}: Omit<WeldActiveProps, 'mode' | 'onStartArc' | 'onVerify' | 'allVerified' | 'onSelectWeld' | 'onBackToQueue' | 'completedWelds' | 'onGoToReview'>) {
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
      {/* Top header with weld info + WPS badges — shown in Arc On too */}
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
          </div>
        </div>
      </div>

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
        <div className="text-sm text-gray-400 mt-2">
          {selectedWeld?.id} · {selectedWeld?.jointType}
        </div>
      </div>

      {isPaused ? (
        /* Paused state: action buttons */
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={onDoneNext}
            className="w-full flex flex-col items-center justify-center gap-1 p-6 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300 rounded-xl transition-colors"
          >
            <span className="text-black font-bold text-2xl">Done</span>
            <span className="text-black/70 text-sm font-medium">
              {nextWeld ? `Start ${nextWeld.id} · ${nextWeld.jointType}` : 'Mark part complete · choose next task'}
            </span>
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
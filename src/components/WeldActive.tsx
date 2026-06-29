import { useState, useEffect } from 'react';
import { AlertTriangle, Check, Play, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Package, ArrowRight, Zap, ArrowLeft, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { Weld, Part, CompletedWeld } from '@/types/weldcloud';
import { machineSpec, parts as initialParts } from '@/data/mockData';
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
  // Use the immutable initial part list so the strip always shows every weld,
  // even after completed ones are removed from the live `parts` state.
  const allWelds = selectedWeld
    ? (initialParts.find(p => p.id === selectedWeld.partNumber)?.welds ?? [])
    : [];
  const completedWeldIds = new Set((completedWelds || []).map(cw => cw.weld.id));
  const doneCount = allWelds.filter(w => completedWeldIds.has(w.id)).length;

  const VISIBLE = 4;
  const [weldOffset, setWeldOffset] = useState(0);

  // Auto-snap the window so the active weld is always on its "page" (groups of 4).
  // When the user moves to weld index 4, the strip jumps to show 4–7, etc.
  useEffect(() => {
    const idx = allWelds.findIndex(w => w.id === selectedWeld?.id);
    if (idx >= 0) setWeldOffset(Math.floor(idx / VISIBLE) * VISIBLE);
  }, [selectedWeld?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleWelds = allWelds.slice(weldOffset, weldOffset + VISIBLE);
  const canPrev = weldOffset > 0;
  const canNext = weldOffset + VISIBLE < allWelds.length;
  const needsPager = allWelds.length > VISIBLE;

  if (!selectedWeld) {
    return (
      <AllWeldsComplete
        completedWelds={completedWelds || []}
        onGoToReview={onGoToReview}
        onBackToQueue={onBackToQueue}
        remainingParts={parts}
        lastCompletedPartId={lastCompletedPartId}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* ── Sticky weld progress / navigation strip ── */}
      <div className="sticky top-0 z-20 bg-[var(--c-surface)] border-b border-[var(--c-border)] px-4 py-2.5">
        <div className="flex items-center gap-2">

          {/* Back to queue */}
          <button
            onClick={onBackToQueue}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--c-raised)] hover:bg-[var(--c-border)] border border-[var(--c-border)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-lo)]" />
          </button>

          {/* Prev page */}
          {needsPager && (
            <button
              onClick={() => setWeldOffset(o => Math.max(0, o - 1))}
              disabled={!canPrev}
              className={`shrink-0 w-7 h-7 flex items-center justify-center rounded border transition-colors ${
                canPrev
                  ? 'bg-[var(--c-raised)] border-[var(--c-border)] hover:bg-[var(--c-elevated)] text-[var(--text-lo)]'
                  : 'border-[var(--c-border)] text-[var(--text-dim)] opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Weld pills */}
          <div className="flex-1 grid grid-cols-4 gap-1.5">
            {visibleWelds.map(weld => {
              const isCompleted = completedWeldIds.has(weld.id);
              const isCurrent = weld.id === selectedWeld.id;
              return (
                <button
                  key={weld.id}
                  onClick={() => !isCurrent && onSelectWeld(weld)}
                  disabled={isCurrent}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors text-left ${
                    isCurrent
                      ? 'bg-[var(--c-weld-active)] border-[var(--c-weld-active-border)] cursor-default'
                      : isCompleted
                      ? 'bg-[var(--c-raised)] border-[var(--c-border)] opacity-70 hover:opacity-100'
                      : 'bg-[var(--c-raised)] border-[var(--c-border)] opacity-55 hover:opacity-100 hover:border-yellow-500/30'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-3 h-3 shrink-0 text-[var(--text-verified)]" />
                  ) : (
                    <span className={`w-2.5 h-2.5 shrink-0 rounded-full border ${
                      isCurrent ? 'bg-yellow-500 border-yellow-500' : 'border-[var(--c-border)]'
                    }`} />
                  )}
                  <span className={`text-xs font-bold truncate ${
                    isCurrent ? 'text-[var(--text-hi)]' : isCompleted ? 'text-[var(--text-dim)]' : 'text-[var(--text-lo)]'
                  }`}>
                    {weld.id}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next page */}
          {needsPager && (
            <button
              onClick={() => setWeldOffset(o => Math.min(allWelds.length - VISIBLE, o + 1))}
              disabled={!canNext}
              className={`shrink-0 w-7 h-7 flex items-center justify-center rounded border transition-colors ${
                canNext
                  ? 'bg-[var(--c-raised)] border-[var(--c-border)] hover:bg-[var(--c-elevated)] text-[var(--text-lo)]'
                  : 'border-[var(--c-border)] text-[var(--text-dim)] opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* WPS · process · progress */}
          <div className="shrink-0 flex items-center gap-2 ml-1 pl-2 border-l border-[var(--c-border)]">
            <span className="text-[10px] text-[var(--text-dim)] font-mono hidden sm:inline">
              {selectedWeld.wps}
            </span>
            <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded font-mono border border-yellow-500/20">
              {selectedWeld.process}
            </span>
            <span className="text-[10px] text-[var(--text-dim)] tabular-nums">
              {doneCount}/{allWelds.length}
            </span>
          </div>

        </div>
      </div>

      {/* Mode content */}
      {mode === 'setup' ? (
        <WeldActiveSetup
          onStartArc={onStartArc}
          onVerify={onVerify}
          allVerified={allVerified}
          selectedWeld={selectedWeld}
          parts={parts}
          onSelectWeld={onSelectWeld}
          onBackToQueue={onBackToQueue}
          completedWelds={completedWelds}
        />
      ) : (
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
      )}
    </div>
  );
}

/* ───────── ALL WELDS COMPLETE ───────── */

function AllWeldsComplete({
  completedWelds,
  onGoToReview,
  onBackToQueue,
  remainingParts,
  lastCompletedPartId,
}: {
  completedWelds: CompletedWeld[];
  onGoToReview: () => void;
  onBackToQueue: () => void;
  remainingParts: Part[];
  lastCompletedPartId?: string | null;
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
          <CheckCircle2 className="w-10 h-10 text-[var(--text-verified)]" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-hi)] mb-2">
          {heading}
        </h1>

        <p className="text-sm text-[var(--text-lo)] mb-6">
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
                : 'bg-[var(--c-raised)] hover:bg-[var(--c-elevated)] border border-[var(--c-border)] text-[var(--text-md)] font-medium text-sm'
            }`}
          >
            <ArrowLeft className={hasRemainingParts ? 'w-5 h-5' : 'w-4 h-4'} />
            {hasRemainingParts ? 'Choose next task' : 'Back to task queue'}
          </button>

          <button
            onClick={onGoToReview}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-colors ${
              hasRemainingParts
                ? 'bg-[var(--c-raised)] hover:bg-[var(--c-elevated)] border border-[var(--c-border)] text-[var(--text-md)] font-medium text-sm'
                : 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300 text-black font-bold text-base'
            }`}
          >
            <ClipboardCheck className={hasRemainingParts ? 'w-4 h-4' : 'w-5 h-5'} />
            Review and sign welds
          </button>
        </div>

        <div className="mt-6 p-4 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-xl">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-2">Completed Summary</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xl font-bold text-[var(--text-hi)]">{summaryWelds.length}</div>
              <div className="text-xs text-[var(--text-dim)]">Welds</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--text-hi)] font-mono">{formatTime(totalArcTime)}</div>
              <div className="text-xs text-[var(--text-dim)]">Arc Time</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--text-hi)]">
                {hasRemainingParts ? remainingParts.length : uniqueParts.length}
              </div>
              <div className="text-xs text-[var(--text-dim)]">{hasRemainingParts ? 'Remaining' : 'Parts'}</div>
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
  allVerified,
  selectedWeld,
  parts,
  onSelectWeld,
  onBackToQueue,
  completedWelds,
}: Omit<WeldActiveProps, 'mode' | 'onTogglePause' | 'onComplete' | 'onDoneNext' | 'onChooseDifferent' | 'arcTime' | 'isPaused' | 'nextWeld' | 'onGoToReview'>) {
  const currentPart = selectedWeld
    ? parts.find(p => p.id === selectedWeld.partNumber)
    : undefined;

  return (
    <div className="p-4 md:p-6">
      {/* Weld title */}
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-hi)]">
          {selectedWeld?.id || '—'} · {selectedWeld?.jointType || '—'}
        </h1>
      </div>

      {/* Part Drawing */}
      <div className="mb-4">
        <DrawingWithHighlight selectedWeld={selectedWeld} currentPart={currentPart} />
      </div>

      {/* Start Arc button - full width for easy tap on tablet */}
      <div className="mb-4">
        <button
          onClick={onStartArc}
          disabled={!allVerified}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
            allVerified
              ? 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300 text-black shadow-lg shadow-yellow-500/20'
              : 'bg-[var(--c-border)] text-[var(--text-dim)] cursor-not-allowed'
          }`}
        >
          Start Arc
        </button>
      </div>

      {/* Completed welds — moved here below the in-progress welds */}
      {completedWelds && completedWelds.length > 0 && (
        <div className="mb-6">
          <CompletedWelds completedWelds={completedWelds} />
        </div>
      )}
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
              isPaused ? 'text-yellow-500' : 'text-[var(--text-verified)]'
            }`}
          >
            {isPaused ? 'Arc Paused' : 'Arc On'}
          </div>
        </button>
        <div className="text-5xl md:text-6xl font-bold text-[var(--text-hi)] font-mono tracking-tight">
          {formatTime(arcTime)}
        </div>
        <div className="text-sm text-[var(--text-lo)] mt-2">W-014 · 3G butt · fill pass</div>
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
            className="w-full flex items-center justify-center p-4 bg-[var(--c-border)] hover:bg-[var(--c-hover)] border border-[var(--c-border)] rounded-xl transition-colors text-[var(--text-hi)] font-medium"
          >
            Choose different weld
          </button>
        </div>
      ) : (
        /* Running state: live readings + commands */
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Voltage</div>
              <div className="text-2xl font-bold text-[var(--text-hi)]">
                {readings.voltage}<span className="text-sm text-[var(--text-dim)] font-normal"> V</span>
              </div>
            </div>
            <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Current</div>
              <div className="text-2xl font-bold text-[var(--text-hi)]">
                {readings.current}<span className="text-sm text-[var(--text-dim)] font-normal"> A</span>
              </div>
            </div>
            <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Travel</div>
              <div className="text-2xl font-bold text-yellow-500">
                {readings.travel}<span className="text-sm text-[var(--text-dim)] font-normal"> cm/min</span>
              </div>
            </div>
            <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Heat In</div>
              <div className="text-2xl font-bold text-yellow-500">
                {readings.heatInput}<span className="text-sm text-[var(--text-dim)] font-normal"> kJ/mm</span>
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
            <div className="lg:col-span-2" />

            <div className="space-y-4">
              <div className="p-4 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg">
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-3">Live · Fleet · 4 Hz</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-lo)]">Machine</span>
                    <span className="text-[var(--text-hi)] font-medium">{machineSpec.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-lo)]">Layer</span>
                    <span className="text-[var(--text-hi)] font-medium">{machineSpec.layer}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-lo)]">Deposition</span>
                    <span className="text-[var(--text-hi)] font-medium">{machineSpec.deposition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-lo)]">WPS heat max</span>
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
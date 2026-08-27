import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Play, ChevronDown, ChevronUp, Package, ArrowRight, Zap, ArrowLeft, CheckCircle2, ClipboardCheck, Users } from 'lucide-react';
import { Weld, Part, CompletedWeld, PrerequisiteProcess, Arc, Consumable } from '@/types/weldcloud';
import { gasSpec } from '@/data/mockData';
import { DrawingWithHighlight } from './DrawingWithHighlight';
import { CompletedWelds } from './CompletedWelds';
import { Badge } from '@/components/ui/badge';

interface WeldActiveProps {
  mode: 'setup' | 'arc';
  onStartArc: () => void;
  onTogglePause: () => void;
  onComplete: () => void;
  onDoneNext: () => void;
  onBackToQueue: () => void;
  onVerify: (id: string) => void;
  allVerified: boolean;
  prerequisites?: PrerequisiteProcess[];
  selectedWeld: Weld | null;
  parts: Part[];
  arcTime: number;
  arcs: Arc[];
  consumables: Consumable[];
  isPaused: boolean;
  nextWeld: Weld | null;
  completedWelds?: CompletedWeld[];
  onGoToReview: () => void;
  lastCompletedPartId?: string | null;
}

const PASS_NAMES = ['Root', 'Fill', 'Cap'];

function currentPassLabel(arcs: Arc[]) {
  return PASS_NAMES[Math.min(arcs.length, PASS_NAMES.length - 1)];
}

function fillerLabel(consumables: Consumable[]) {
  const wire = consumables.find(c => c.name.toLowerCase().includes('wire'));
  return wire ? wire.name.replace(/^Wire\s+/i, '') : '—';
}

export function WeldActive({
  mode,
  onStartArc,
  onTogglePause,
  onComplete,
  onDoneNext,
  onBackToQueue,
  onVerify,
  allVerified,
  prerequisites,
  selectedWeld,
  parts,
  arcTime,
  arcs,
  consumables,
  isPaused,
  nextWeld,
  completedWelds,
  onGoToReview,
  lastCompletedPartId,
}: WeldActiveProps) {
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

  const currentPass = currentPassLabel(arcs);
  const filler = fillerLabel(consumables);

  return (
    <div className="flex flex-col">
      {mode === 'setup' ? (
        <WeldActiveSetup
          onStartArc={onStartArc}
          onVerify={onVerify}
          allVerified={allVerified}
          prerequisites={prerequisites}
          selectedWeld={selectedWeld}
          parts={parts}
          currentPass={currentPass}
          filler={filler}
          completedWelds={completedWelds}
        />
      ) : (
        <WeldActiveArc
          onTogglePause={onTogglePause}
          onComplete={onComplete}
          onDoneNext={onDoneNext}
          selectedWeld={selectedWeld}
          parts={parts}
          arcTime={arcTime}
          currentPass={currentPass}
          filler={filler}
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
          <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-2">Completed Summary</div>
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

/* ───────── WELD INFO HEADER ───────── */
/* Persistent across setup and arc — same slot, same fields, so the layout doesn't jump as the welder moves through the flow */

function WeldInfoHeader({ weld, currentPass, filler }: { weld: Weld | null; currentPass: string; filler: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl md:text-2xl">
        <span className="font-bold text-[var(--text-hi)]">{weld?.id || '—'}</span>
        <span className="font-normal text-[var(--text-lo)]"> · {weld?.jointType || '—'}</span>
      </h1>
      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-sm font-normal text-[var(--text-lo)]">
        <span>{currentPass} pass</span>
        <span className="text-[var(--text-dim)]">·</span>
        <span>Filler {filler}</span>
        <span className="text-[var(--text-dim)]">·</span>
        <span>{weld?.process || '—'}</span>
        <span className="text-[var(--text-dim)]">·</span>
        <span>{weld?.wps || '—'}</span>
        <span className="text-[var(--text-dim)]">·</span>
        <span>{weld?.duration ?? '—'} min</span>
      </div>
    </div>
  );
}

/* ───────── SETUP VIEW ───────── */

function WeldActiveSetup({
  onStartArc,
  allVerified,
  prerequisites,
  selectedWeld,
  parts,
  currentPass,
  filler,
  completedWelds,
}: Omit<WeldActiveProps, 'mode' | 'onTogglePause' | 'onComplete' | 'onDoneNext' | 'arcTime' | 'arcs' | 'consumables' | 'isPaused' | 'nextWeld' | 'onGoToReview' | 'onBackToQueue'> & { currentPass: string; filler: string }) {
  const currentPart = selectedWeld
    ? parts.find(p => p.id === selectedWeld.partNumber)
    : undefined;

  const pendingPrerequisites = (prerequisites || []).filter(p => p.status !== 'done');
  const canStart = allVerified && pendingPrerequisites.length === 0;

  return (
    <div className="p-4 md:p-6">
      <WeldInfoHeader weld={selectedWeld} currentPass={currentPass} filler={filler} />

      {/* Part Drawing */}
      <div className="mb-4">
        <DrawingWithHighlight selectedWeld={selectedWeld} currentPart={currentPart} />
      </div>

      {/* Blocked-on-other-welders notice */}
      {pendingPrerequisites.length > 0 && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <Users className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-500">
            Waiting on {pendingPrerequisites.map(p => `${p.label} (${p.welder})`).join(' & ')} — mark complete in the sidebar to unlock Start Arc
          </p>
        </div>
      )}

      {/* Start Arc button - full width for easy tap on tablet */}
      <div className="mb-4">
        <button
          onClick={onStartArc}
          disabled={!canStart}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
            canStart
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
  selectedWeld,
  parts,
  arcTime,
  currentPass,
  filler,
  isPaused,
  nextWeld,
}: Omit<WeldActiveProps, 'mode' | 'onStartArc' | 'onVerify' | 'allVerified' | 'arcs' | 'consumables' | 'onBackToQueue' | 'completedWelds' | 'onGoToReview'> & { currentPass: string; filler: string }) {
  const currentPart = selectedWeld
    ? parts.find(p => p.id === selectedWeld.partNumber)
    : undefined;

  const [readings, setReadings] = useState({
    voltage: 23.8,
    current: 212,
    travel: 31,
    heatInput: 1.04,
  });

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPausedRef.current) return;
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
      <WeldInfoHeader weld={selectedWeld} currentPass={currentPass} filler={filler} />

      {/* Compact Drawing */}
      <div className="mb-4">
        <DrawingWithHighlight selectedWeld={selectedWeld} currentPart={currentPart} compact />
      </div>

      {/* Primary controls — split as soon as welding starts; "Done" only becomes usable once paused */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          onClick={onTogglePause}
          className="flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-colors bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300 text-black shadow-lg shadow-yellow-500/20"
        >
          <span className="w-6 h-6 rounded-full border-2 border-black/50 flex items-center justify-center shrink-0">
            <span className={`rounded-full bg-black/70 ${isPaused ? 'w-2.5 h-2.5' : 'w-3 h-3 animate-pulse'}`} />
          </span>
          {isPaused ? 'Resume Arc' : 'Pause Arc'}
          <span className="text-black/40">·</span>
          <span className="font-mono">{formatTime(arcTime)}</span>
        </button>
        <button
          onClick={onDoneNext}
          disabled={!isPaused}
          className={`flex flex-col items-center justify-center gap-1 py-4 rounded-xl font-bold transition-colors ${
            isPaused
              ? 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300 text-black shadow-lg shadow-yellow-500/20 cursor-pointer'
              : 'border border-[var(--c-border)]/50 bg-[var(--c-raised)]/40 cursor-not-allowed'
          }`}
        >
          <span className={`font-bold text-lg ${isPaused ? 'text-black' : 'text-[var(--text-dim)]'}`}>Done</span>
          <span className={`text-xs font-medium text-center ${isPaused ? 'text-black/60' : 'text-[var(--text-dim)]/60'}`}>
            {nextWeld ? `Start ${nextWeld.id}` : 'Mark part complete'}
          </span>
        </button>
      </div>

      {/* Live readings — stay mounted and frozen when paused so the layout never jumps */}
      <div className={isPaused ? 'grayscale opacity-40 pointer-events-none transition-all' : 'transition-all'}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-1">Voltage</div>
            <div className="text-2xl font-bold text-[var(--text-hi)]">
              {readings.voltage}<span className="text-sm text-[var(--text-dim)] font-normal"> V</span>
            </div>
          </div>
          <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-1">Current</div>
            <div className="text-2xl font-bold text-[var(--text-hi)]">
              {readings.current}<span className="text-sm text-[var(--text-dim)] font-normal"> A</span>
            </div>
          </div>
          <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-1">Travel</div>
            <div className="text-2xl font-bold text-yellow-500">
              {readings.travel}<span className="text-sm text-[var(--text-dim)] font-normal"> cm/min</span>
            </div>
          </div>
          <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-1">Heat In</div>
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

        <WeldTagsPanel selectedWeld={selectedWeld} currentPart={currentPart} filler={filler} />
      </div>
    </div>
  );
}

/* ───────── WELD TAGS ───────── */

function TagField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs text-[var(--text-lo)] mb-1">{label}</div>
      <div className="text-sm font-medium text-[var(--text-hi)] truncate">{value || 'Not set'}</div>
    </div>
  );
}

function WeldTagsPanel({
  selectedWeld,
  currentPart,
  filler,
}: {
  selectedWeld: Weld | null;
  currentPart: Part | undefined;
  filler: string;
}) {
  const fieldGrid = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4';

  return (
    <div className="p-4 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg">
      <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-4">Weld tags</div>

      <div className="mb-4">
        <div className="text-sm font-semibold text-[var(--text-hi)] mb-3">Information</div>
        <div className={`${fieldGrid} mb-4`}>
          <TagField label="Operator" value="M. Costa" />
          <TagField label="WPS" value={selectedWeld?.wps} />
          <TagField label="Work order" value="Not set" />
          <TagField label="Assembly" value={currentPart?.name} />
          <TagField label="Part" value={currentPart?.id} />
          <TagField label="Weld ID" value={selectedWeld?.id} />
        </div>
        <div className={fieldGrid}>
          <TagField label="WPS Parameter ID" value="Not set" />
          <TagField label="Tags" value="Not set" />
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--c-border)]">
        <div className="text-sm font-semibold text-[var(--text-hi)] mb-3">Consumption data</div>
        <div className={`${fieldGrid} mb-4`}>
          <TagField label="Filler metal" value={filler} />
          <TagField label="Flux" value="Not set" />
          <TagField label="Gas types" value={gasSpec.mix} />
        </div>
        <div className={fieldGrid}>
          <TagField label="Lot number" value="L24-08812" />
          <TagField label="Lot number" value="Not set" />
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Weld, CompletedWeld } from '@/types/weldcloud';
import { parts as initialParts } from '@/data/mockData';

interface WeldNavigatorProps {
  selectedWeld: Weld | null;
  completedWelds?: CompletedWeld[];
  onSelectWeld: (weld: Weld) => void;
  onBackToQueue: () => void;
}

export function WeldNavigator({ selectedWeld, completedWelds, onSelectWeld, onBackToQueue }: WeldNavigatorProps) {
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

  if (!selectedWeld) return null;

  const visibleWelds = allWelds.slice(weldOffset, weldOffset + VISIBLE);
  const canPrev = weldOffset > 0;
  const canNext = weldOffset + VISIBLE < allWelds.length;
  const needsPager = allWelds.length > VISIBLE;

  return (
    <div className="bg-[var(--c-surface)] border-b border-[var(--c-border)] px-4 py-2.5">
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
          <span className="text-xs text-[var(--text-dim)] font-mono hidden sm:inline">
            {selectedWeld.wps}
          </span>
          <span className="text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded font-mono border border-yellow-500/20">
            {selectedWeld.process}
          </span>
          <span className="text-xs text-[var(--text-dim)] tabular-nums">
            {doneCount}/{allWelds.length}
          </span>
        </div>

      </div>
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown, ChevronUp, Play, Check, Send } from 'lucide-react';
import { Part, Weld, CompletedWeld } from '@/types/weldcloud';
import { Badge } from '@/components/ui/badge';
import { initialParts } from '@/data/mockData';

interface TaskQueueProps {
  parts: Part[];
  onSelectWeld: (weld: Weld) => void;
  completedWelds: CompletedWeld[];
  onSendPartForReview: (partId: string) => void;
}

export function TaskQueue({ parts, onSelectWeld, completedWelds, onSendPartForReview }: TaskQueueProps) {
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);

  const completedWeldIds = new Set(completedWelds.map((cw) => cw.weld.id));
  const totalInitialWelds = initialParts.reduce((sum, p) => sum + p.welds.length, 0);
  const completedCount = completedWeldIds.size;
  const allDone = completedCount === totalInitialWelds && totalInitialWelds > 0;

  const remainingPartIds = new Set(parts.map(p => p.id));
  const firstActiveIndex = initialParts.findIndex(ip => remainingPartIds.has(ip.id));

  const togglePart = (e: React.MouseEvent, partId: string) => {
    e.stopPropagation();
    setExpandedPartId((current) => (current === partId ? null : partId));
  };

  const startPart = (initialPart: Part) => {
    const activePart = parts.find(p => p.id === initialPart.id);
    if (activePart && activePart.welds.length > 0) {
      onSelectWeld(activePart.welds[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-1">
          M. Costa · Welder · Queue assigned by K. Park · 06:30
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-hi)]">
          {allDone
            ? 'All welds completed'
            : completedCount > 0
            ? `${initialParts.length} part${initialParts.length !== 1 ? 's' : ''} — ${totalInitialWelds - completedCount} weld${totalInitialWelds - completedCount !== 1 ? 's' : ''} remaining`
            : `${initialParts.length} part${initialParts.length !== 1 ? 's' : ''} — ${totalInitialWelds} welds ready`}
        </h1>
      </div>

      <div className="space-y-4">
        {initialParts.map((initialPart, partIndex) => {
          const isFullyCompleted = initialPart.welds.every(w => completedWeldIds.has(w.id));
          const isNextActive = partIndex === firstActiveIndex;
          const isSentForReview = isFullyCompleted && initialPart.welds.every(w => {
            const cw = completedWelds.find(cw => cw.weld.id === w.id);
            return cw?.locked === true;
          });
          const isExpanded = expandedPartId === initialPart.id;

          // Get remaining welds count for this part from active parts state
          const activePart = parts.find(p => p.id === initialPart.id);
          const remainingWeldsCount = activePart ? activePart.welds.length : 0;

          return (
            <div
              key={initialPart.id}
              className={`border rounded-xl overflow-hidden transition-colors ${
                isFullyCompleted
                  ? 'bg-[var(--c-raised)] border-green-500/20'
                  : 'bg-[var(--c-raised)] border-[var(--c-border)]'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                      isFullyCompleted
                        ? 'bg-green-500/10'
                        : isNextActive
                        ? 'bg-yellow-500 text-black'
                        : 'bg-[var(--c-border)] text-[var(--text-lo)]'
                    }`}
                  >
                    {isFullyCompleted ? (
                      <Check className="w-6 h-6 text-[var(--text-verified)]" />
                    ) : (
                      partIndex + 1
                    )}
                  </div>

                  {/* Part info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[var(--text-hi)] font-semibold text-lg">{initialPart.id}</span>
                      {initialPart.name && (
                        <span className="text-sm text-[var(--text-lo)] truncate">· {initialPart.name}</span>
                      )}
                      <span className="text-base text-[var(--text-lo)]">
                        {initialPart.welds.length} {initialPart.welds.length === 1 ? 'weld' : 'welds'}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Send for review button */}
                    <button
                      onClick={() => {
                        if (isFullyCompleted && !isSentForReview) {
                          onSendPartForReview(initialPart.id);
                        }
                      }}
                      disabled={!isFullyCompleted || isSentForReview}
                      className={`h-14 px-4 rounded-xl flex items-center gap-2 justify-center text-xs font-semibold transition-all ${
                        isSentForReview
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default'
                          : isFullyCompleted
                          ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20 cursor-pointer'
                          : 'bg-[var(--c-border)] text-[var(--text-dim)] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isSentForReview ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Sent
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Send for review
                        </>
                      )}
                    </button>

                    {/* Play button */}
                    <button
                      onClick={() => startPart(initialPart)}
                      disabled={isFullyCompleted}
                      className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        isFullyCompleted
                          ? 'bg-[var(--c-border)] opacity-40 cursor-not-allowed'
                          : isNextActive
                          ? 'bg-yellow-500 hover:bg-yellow-400 hover:scale-105 shadow-lg shadow-yellow-500/20'
                          : 'bg-[var(--c-border)] hover:bg-[var(--c-hover)]'
                      }`}
                    >
                      <Play
                        className={`w-6 h-6 ${!isFullyCompleted && isNextActive ? 'text-black' : 'text-[var(--text-hi)]'} ml-0.5`}
                      />
                    </button>
                  </div>
                </div>

                {/* Weld pills + expand toggle */}
                <button
                  onClick={(e) => togglePart(e, initialPart.id)}
                  className="w-full mt-4 pt-3 border-t border-[var(--c-border)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {initialPart.welds.map((weld) => {
                        const isCompleted = completedWeldIds.has(weld.id);
                        return (
                          <span
                            key={weld.id}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono border ${
                              isCompleted
                                ? 'bg-green-500/10 text-[var(--text-verified)] border-green-500/20'
                                : weld.priority
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-[var(--c-elevated)] text-[var(--text-lo)] border-[var(--c-border)]'
                            }`}
                          >
                            {isCompleted && <Check className="w-3 h-3 mr-1" />}
                            {weld.id}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)] shrink-0 ml-2">
                      <span>{isExpanded ? 'Hide welds' : 'View welds'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {/* Expanded weld list */}
              {isExpanded && (
                <div className="border-t border-[var(--c-border)] px-4 pb-4 pt-3 bg-[#141414]/50">
                  <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-3">
                    {isFullyCompleted ? 'All welds completed' : 'Welds assigned — tap one to start'}
                  </div>
                  <div className="space-y-2">
                    {initialPart.welds.map((weld, weldIndex) => {
                      const isCompleted = completedWeldIds.has(weld.id);
                      const activePartWelds = activePart?.welds ?? [];
                      const isNextWeld =
                        !isFullyCompleted &&
                        weldIndex === initialPart.welds.findIndex((w) => !completedWeldIds.has(w.id)) &&
                        !isCompleted &&
                        isNextActive;

                      return (
                        <button
                          key={weld.id}
                          onClick={() => !isCompleted && onSelectWeld(weld)}
                          disabled={isCompleted}
                          className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors group ${
                            isCompleted
                              ? 'bg-green-500/5 border-green-500/20 opacity-50 cursor-default'
                              : isNextWeld
                              ? 'bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10'
                              : 'bg-[var(--c-raised)] border-[var(--c-border)] hover:bg-[var(--c-elevated)]'
                          }`}
                        >
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                              <Check className="w-4 h-4 text-[var(--text-verified)]" />
                            </div>
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isNextWeld
                                  ? 'bg-yellow-500 text-black'
                                  : 'bg-[var(--c-border)] text-[var(--text-lo)] group-hover:text-[var(--text-hi)]'
                              }`}
                            >
                              {weldIndex + 1}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-medium ${
                                  isCompleted ? 'text-[var(--text-verified)]' : 'text-[var(--text-hi)]'
                                }`}
                              >
                                {weld.id}
                              </span>
                              <span className="text-xs text-[var(--text-dim)]">{weld.jointType}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-[var(--text-dim)] bg-[var(--c-surface)] px-2 py-0.5 rounded">
                                {weld.wps}
                              </span>
                              <span className="text-xs text-[var(--text-dim)] bg-[var(--c-surface)] px-2 py-0.5 rounded">
                                {weld.duration} min
                              </span>
                              <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono border border-yellow-500/20">
                                {weld.process}
                              </span>
                              {weld.priority && (
                                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                                  Priority
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isCompleted && (
                            <span className="text-xs font-medium text-[var(--text-verified)] uppercase tracking-wider shrink-0">
                              Done
                            </span>
                          )}
                          {isNextWeld && (
                            <span className="text-xs font-medium text-yellow-500 uppercase tracking-wider shrink-0">
                              Next
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

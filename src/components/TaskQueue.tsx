import { useState } from 'react';
import { ChevronDown, ChevronUp, Play, Check } from 'lucide-react';
import { Part, Weld, CompletedWeld } from '@/types/weldcloud';
import { Badge } from '@/components/ui/badge';
import { ProcessBadges } from './ProcessBadges';
import { initialParts } from '@/data/mockData';

interface TaskQueueProps {
  parts: Part[];
  onSelectWeld: (weld: Weld) => void;
  completedWelds: CompletedWeld[];
}

export function TaskQueue({ parts, onSelectWeld, completedWelds }: TaskQueueProps) {
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
  const [completedPartsExpanded, setCompletedPartsExpanded] = useState(false);

  const completedWeldIds = new Set(completedWelds.map((cw) => cw.weld.id));

  const totalWelds = parts.reduce((sum, part) => sum + part.welds.length, 0);

  // Parts where ALL original welds are completed
  const completedParts = initialParts.filter((part) =>
    part.welds.every((w) => completedWeldIds.has(w.id))
  );

  const togglePart = (e: React.MouseEvent, partId: string) => {
    e.stopPropagation();
    setExpandedPartId((current) => (current === partId ? null : partId));
  };

  const startPart = (part: Part) => {
    if (part.welds.length > 0) {
      onSelectWeld(part.welds[0]);
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
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">
          M. Costa · Welder · Queue assigned by K. Park · 06:30
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-hi)]">
          {parts.length > 0
            ? `${parts.length} parts — ${totalWelds} welds ready`
            : completedParts.length > 0
            ? 'All parts completed'
            : 'No parts assigned'}
        </h1>
      </div>

      {/* Active Parts */}
      <div className="space-y-4">
        {parts.map((part, partIndex) => {
          const isExpanded = expandedPartId === part.id;

          // Show all original welds with completion status
          const originalPart = initialParts.find((p) => p.id === part.id);
          const displayWelds = originalPart?.welds || part.welds;

          return (
            <div
              key={part.id}
              className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-xl overflow-hidden transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                        partIndex === 0
                          ? 'bg-yellow-500 text-black'
                          : 'bg-[var(--c-border)] text-[var(--text-lo)]'
                      }`}
                    >
                      {partIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[var(--text-hi)] font-semibold text-lg">{part.id}</span>
                        {part.name && (
                          <span className="text-sm text-[var(--text-lo)] truncate">· {part.name}</span>
                        )}
                        <span className="text-base text-[var(--text-lo)]">
                          {part.welds.length} {part.welds.length === 1 ? 'weld' : 'welds'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => startPart(part)}
                    className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      partIndex === 0
                        ? 'bg-yellow-500 hover:bg-yellow-400 hover:scale-105 shadow-lg shadow-yellow-500/20'
                        : 'bg-[var(--c-border)] hover:bg-[var(--c-hover)]'
                    }`}
                  >
                    <Play className={`w-6 h-6 ${partIndex === 0 ? 'text-black' : 'text-[var(--text-hi)]'} ml-0.5`} />
                  </button>
                </div>

                {/* Collapsed weld pills — ALL welds shown with checkmarks */}
                <button
                  onClick={(e) => togglePart(e, part.id)}
                  className="w-full mt-4 pt-3 border-t border-[var(--c-border)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {displayWelds.map((weld) => {
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
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-3">
                    Welds assigned — tap one to start
                  </div>
                  <div className="space-y-2">
                    {displayWelds.map((weld, weldIndex) => {
                      const isCompleted = completedWeldIds.has(weld.id);
                      const isNextWeld =
                        partIndex === 0 &&
                        weldIndex === displayWelds.findIndex((w) => !completedWeldIds.has(w.id)) &&
                        !isCompleted;

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
                              <span className="text-xs text-[var(--text-dim)]">
                                {weld.jointType}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-surface)] px-2 py-0.5 rounded">
                                {weld.wps}
                              </span>
                              <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-surface)] px-2 py-0.5 rounded">
                                {weld.duration} min
                              </span>
                              <ProcessBadges weld={weld} />
                              {weld.priority && (
                                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                                  Priority
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isCompleted && (
                            <span className="text-[10px] font-medium text-[var(--text-verified)] uppercase tracking-wider shrink-0">
                              Done
                            </span>
                          )}
                          {isNextWeld && (
                            <span className="text-[10px] font-medium text-yellow-500 uppercase tracking-wider shrink-0">
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

      {/* Completed Parts Section */}
      {completedParts.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setCompletedPartsExpanded(!completedPartsExpanded)}
            className="w-full flex items-center justify-between p-4 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-xl hover:bg-[var(--c-elevated)] transition-colors mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-[var(--text-verified)]" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-[var(--text-hi)]">Completed Parts</h2>
                <p className="text-xs text-[var(--text-dim)]">
                  {completedParts.length} part{completedParts.length !== 1 ? 's' : ''} finished
                </p>
              </div>
            </div>
            {completedPartsExpanded ? (
              <ChevronUp className="w-5 h-5 text-[var(--text-dim)]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--text-dim)]" />
            )}
          </button>

          {completedPartsExpanded && (
            <div className="space-y-4">
              {completedParts.map((part) => {
                const partCompletedWelds = completedWelds.filter((cw) =>
                  part.welds.some((pw) => pw.id === cw.weld.id)
                );
                const totalArcTime = partCompletedWelds.reduce(
                  (sum, cw) => sum + cw.arcs.reduce((a, arc) => a + arc.duration, 0),
                  0
                );

                return (
                  <div
                    key={part.id}
                    className="bg-green-500/5 border border-green-500/20 rounded-xl overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-sm font-bold shrink-0">
                          <Check className="w-6 h-6 text-[var(--text-verified)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[var(--text-hi)] font-semibold text-base">{part.id}</span>
                            <span className="text-sm text-[var(--text-lo)]">· {part.name}</span>
                          </div>
                          <div className="text-sm text-[var(--text-lo)] mt-0.5">
                            {part.description}
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-[var(--text-verified)] bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                              {part.welds.length} welds completed
                            </span>
                            {totalArcTime > 0 && (
                              <span className="text-xs text-[var(--text-dim)] bg-[var(--c-surface)] px-2 py-0.5 rounded">
                                {formatTime(totalArcTime)} arc time
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Completed weld pills */}
                      <div className="mt-4 pt-3 border-t border-green-500/10">
                        <div className="flex items-center gap-2 flex-wrap">
                          {part.welds.map((weld) => (
                            <span
                              key={weld.id}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono border bg-green-500/10 text-[var(--text-verified)] border-green-500/20"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {weld.id}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
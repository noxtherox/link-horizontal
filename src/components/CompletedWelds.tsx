import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, BadgeCheck, ArrowRight } from 'lucide-react';
import { CompletedWeld } from '@/types/weldcloud';

interface CompletedWeldsProps {
  completedWelds: CompletedWeld[];
}

export function CompletedWelds({ completedWelds }: CompletedWeldsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const methodLabel = (method: CompletedWeld['method']) => {
    switch (method) {
      case 'done':
        return { text: 'Done', icon: <Check className="w-3 h-3" />, color: 'text-[var(--text-verified)] bg-green-500/10 border-green-500/20' };
      case 'choose-different':
        return { text: 'Skipped', icon: <ArrowRight className="w-3 h-3" />, color: 'text-[var(--text-lo)] bg-[var(--c-elevated)] border-[var(--c-border)]' };
      case 'signed':
        return { text: 'Signed', icon: <BadgeCheck className="w-3 h-3" />, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' };
    }
  };

  if (completedWelds.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-xl hover:bg-[var(--c-elevated)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-[var(--text-verified)]" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-[var(--text-hi)]">
              Completed welds
            </div>
            <div className="text-xs text-[var(--text-dim)]">
              {completedWelds.length} weld{completedWelds.length !== 1 ? 's' : ''} finished today
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-dim)]">
            {completedWelds.reduce((sum, cw) => sum + cw.arcs.reduce((a, arc) => a + arc.duration, 0), 0) > 0 && (
              <>
                Total arc time {formatTime(completedWelds.reduce((sum, cw) => sum + cw.arcs.reduce((a, arc) => a + arc.duration, 0), 0))}
              </>
            )}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-dim)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-dim)]" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {completedWelds.map((cw, index) => {
            const meta = methodLabel(cw.method);
            const totalDuration = cw.arcs.reduce((sum, arc) => sum + arc.duration, 0);
            return (
              <div
                key={`${cw.weld.id}-${index}`}
                className="flex items-center gap-3 p-3 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--c-border)] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[var(--text-lo)]">
                    {completedWelds.length - index}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[var(--text-hi)]">{cw.weld.id}</span>
                    <span className="text-xs text-[var(--text-dim)]">{cw.weld.jointType}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-[var(--text-dim)] bg-[var(--c-surface)] px-2 py-0.5 rounded border border-[var(--c-border)]">
                      {cw.weld.partNumber}
                    </span>
                    <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono border border-yellow-500/20">
                      {cw.weld.process}
                    </span>
                    <span className="text-xs text-[var(--text-dim)]">
                      {cw.arcs.length} arc{cw.arcs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${meta.color}`}>
                    {meta.icon}
                    {meta.text}
                  </div>
                  <div className="text-xs text-[var(--text-dim)] mt-1">
                    Arc {formatTime(totalDuration)} · {cw.completedAt}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
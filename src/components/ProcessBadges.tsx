import { Weld } from '@/types/weldcloud';
import { assignedSteps, unassignedSteps } from '@/utils/weldProcess';

interface ProcessBadgesProps {
  weld: Weld;
  muted?: boolean;
}

// Renders one badge per process the welder is assigned on this weld. When the
// WPS has multiple processes, each badge also shows the passes it covers, and
// steps welded by someone else collapse into a single dim "by others" badge.
export function ProcessBadges({ weld, muted }: ProcessBadgesProps) {
  const assigned = assignedSteps(weld);
  const unassigned = unassignedSteps(weld);
  const multiProcess = weld.processes.length > 1;

  const badgeClass = muted
    ? 'text-[10px] text-[var(--text-lo)] bg-[var(--c-elevated)] px-1.5 py-0.5 rounded font-mono border border-[var(--c-border)]'
    : 'text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded font-mono border border-yellow-500/20';

  return (
    <>
      {assigned.map((step) => (
        <span key={step.process} className={badgeClass}>
          {step.process}
          {multiProcess ? ` · ${step.passes.join('/')}` : ''}
        </span>
      ))}
      {unassigned.length > 0 && (
        <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-surface)] px-1.5 py-0.5 rounded font-mono border border-[var(--c-border)]">
          {unassigned.map((s) => s.process).join(' + ')} by others
        </span>
      )}
    </>
  );
}

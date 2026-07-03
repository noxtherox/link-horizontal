import { Check, Clock, Layers, CheckCircle2 } from 'lucide-react';
import { Weld } from '@/types/weldcloud';
import { getProcessScope } from '@/utils/weldProcess';

interface ProcessScopeBannerProps {
  weld: Weld;
}

// Shown above Start Arc: tells the welder which part of the WPS process stack
// this task covers, and where the other processes stand.
export function ProcessScopeBanner({ weld }: ProcessScopeBannerProps) {
  const scope = getProcessScope(weld);

  const styles = {
    full: {
      container: 'bg-[var(--c-raised)] border-[var(--c-border)]',
      icon: <Layers className="w-5 h-5 text-yellow-500 shrink-0" />,
      text: 'text-[var(--text-hi)]',
    },
    'first-only': {
      container: 'bg-[var(--c-raised)] border-yellow-500/30',
      icon: <Layers className="w-5 h-5 text-yellow-500 shrink-0" />,
      text: 'text-[var(--text-hi)]',
    },
    proceed: {
      container: 'bg-green-500/5 border-green-500/30',
      icon: <CheckCircle2 className="w-5 h-5 text-[var(--text-verified)] shrink-0" />,
      text: 'text-[var(--text-hi)]',
    },
    waiting: {
      container: 'bg-yellow-500/10 border-yellow-500/30',
      icon: <Clock className="w-5 h-5 text-yellow-500 shrink-0" />,
      text: 'text-yellow-500',
    },
  }[scope.kind];

  const multiProcess = weld.processes.length > 1;

  return (
    <div className={`p-4 rounded-xl border ${styles.container}`}>
      <div className="flex items-center gap-3">
        {styles.icon}
        <p className={`text-sm font-medium ${styles.text}`}>{scope.message}</p>
      </div>

      {multiProcess && (
        <div className="mt-3 pt-3 border-t border-[var(--c-border)] space-y-1.5">
          {weld.processes.map((step, idx) => (
            <div key={step.process} className="flex items-center gap-2 text-xs">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  step.completed
                    ? 'bg-green-500/10 text-[var(--text-verified)]'
                    : step.assigned
                    ? 'bg-yellow-500 text-black'
                    : 'bg-[var(--c-border)] text-[var(--text-lo)]'
                }`}
              >
                {step.completed ? <Check className="w-3 h-3" /> : idx + 1}
              </span>
              <span className="font-mono text-[var(--text-md)]">{step.process}</span>
              <span className="text-[var(--text-dim)]">{step.passes.join(' / ')}</span>
              <span
                className={`ml-auto shrink-0 ${
                  step.completed
                    ? 'text-[var(--text-verified)]'
                    : step.assigned
                    ? 'text-yellow-500 font-semibold'
                    : 'text-[var(--text-dim)]'
                }`}
              >
                {step.completed
                  ? `Done · ${step.welder ?? ''}`.trim()
                  : step.assigned
                  ? 'You'
                  : step.welder ?? 'Other station'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

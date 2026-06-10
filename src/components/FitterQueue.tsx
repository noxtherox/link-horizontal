import { useState } from 'react';
import { Check, ClipboardCheck, Hourglass } from 'lucide-react';
import { User } from '@/types/weldcloud';
import { FitUpTask, OperatorFlow } from '@/hooks/useOperatorFlow';
import { getPreset } from '@/data/presets';

const FIT_UP_CHECKS = ['Tack welds placed', 'Alignment within tolerance', 'Root gap per WPS'];

export function FitterQueue({ flow, currentUser }: { flow: OperatorFlow; currentUser: User }) {
  const open = flow.fitUpTasks.filter((t) => !t.status);
  const awaiting = flow.fitUpTasks.filter((t) => t.status === 'pending-approval');

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          {currentUser.name} · Fitter · Station 1
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {open.length > 0
            ? `${open.length} joint${open.length !== 1 ? 's' : ''} to fit`
            : 'All fit-up work done'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Marking a joint ready releases its weld to the welder queue
          {awaiting.length > 0 ? ` · ${awaiting.length} awaiting inspector sign-off` : ''}
        </p>
      </div>

      <div className="space-y-3">
        {open.map((task) => (
          <FitUpCard key={task.key} task={task} onReady={() => flow.markFitUpReady(task)} />
        ))}

        {awaiting.map((task) => (
          <div
            key={task.key}
            className="p-4 bg-[#1a1a1a] border border-yellow-500/20 rounded-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Hourglass className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{task.key}</span>
                {task.weld && <span className="text-xs text-gray-500">{task.weld.jointType}</span>}
                <span className="text-xs text-gray-500">· {task.part.name}</span>
              </div>
              <span className="text-xs text-yellow-500">Fit-up done — awaiting inspector sign-off</span>
            </div>
          </div>
        ))}

        {open.length === 0 && awaiting.length === 0 && (
          <div className="p-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-center">
            <ClipboardCheck className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No open fit-up tasks. Work appears here for work orders with fit-up tracking enabled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FitUpCard({ task, onReady }: { task: FitUpTask; onReady: () => void }) {
  const [checks, setChecks] = useState<Set<string>>(new Set());
  const preset = getPreset(task.workOrder.presetId);
  const Icon = preset.icon;
  const allChecked = FIT_UP_CHECKS.every((c) => checks.has(c));
  const needsApproval = task.workOrder.flags.fitUpTracking === 'gated-inspected';

  const toggle = (check: string) =>
    setChecks((prev) => {
      const next = new Set(prev);
      if (next.has(check)) next.delete(check);
      else next.add(check);
      return next;
    });

  return (
    <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-base font-bold text-white">{task.key}</span>
        {task.weld ? (
          <>
            <span className="text-xs text-gray-500">{task.weld.jointType}</span>
            <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded font-mono">
              {task.weld.process}
            </span>
            <span className="text-[10px] text-gray-500 bg-[#141414] px-1.5 py-0.5 rounded">
              {task.weld.wps}
            </span>
          </>
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
            Whole part
          </span>
        )}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <Icon className="w-3.5 h-3.5 text-yellow-500" />
          {task.workOrder.id}
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-3">
        {task.part.id} · {task.part.name}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        {FIT_UP_CHECKS.map((check) => {
          const done = checks.has(check);
          return (
            <button
              key={check}
              onClick={() => toggle(check)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                done
                  ? 'bg-green-500/10 border-green-500/40 text-green-400'
                  : 'bg-[#1f1f1f] border-[#2a2a2a] text-gray-400 hover:bg-[#2a2a2a]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  done ? 'bg-green-500 text-black' : 'bg-[#2a2a2a]'
                }`}
              >
                {done && <Check className="w-3 h-3" />}
              </span>
              {check}
            </button>
          );
        })}
      </div>

      <button
        onClick={onReady}
        disabled={!allChecked}
        className={`w-full p-3.5 rounded-xl font-bold text-sm transition-colors ${
          allChecked
            ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
            : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
        }`}
      >
        {allChecked
          ? needsApproval
            ? 'Mark ready — send to fit-up inspection'
            : 'Mark ready — release weld'
          : 'Complete all checks first'}
      </button>
    </div>
  );
}

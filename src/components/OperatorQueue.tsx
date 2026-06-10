import { useState } from 'react';
import { ChevronDown, ChevronUp, Play, Check, Lock, AlertTriangle, Zap, Inbox, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Part, User, WorkOrder } from '@/types/weldcloud';
import { OperatorFlow, QueuePartItem, QueueWorkOrderGroup } from '@/hooks/useOperatorFlow';
import { FLAG_OPTION_LABELS, getPreset } from '@/data/presets';

interface OperatorQueueProps {
  flow: OperatorFlow;
  currentUser: User;
}

export function OperatorQueue({ flow, currentUser }: OperatorQueueProps) {
  const { queue } = flow;
  const totalRemaining = queue.flatMap((g) => g.parts).reduce((s, p) => s + p.remaining, 0);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          {currentUser.name} · {currentUser.role} · Station 1
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {totalRemaining > 0 ? `${totalRemaining} tasks across ${queue.length} work orders` : 'All assigned work complete'}
        </h1>
      </div>

      {flow.hasWeldFirstWork && (
        <UnattributedTray flow={flow} />
      )}

      <div className="space-y-6">
        {queue.map((group) => (
          <WorkOrderGroup key={group.workOrder.id} group={group} flow={flow} />
        ))}
      </div>
    </div>
  );
}

/* ───────── Work order group ───────── */

function workOrderChips(wo: WorkOrder): string[] {
  const f = wo.flags;
  return [
    FLAG_OPTION_LABELS[`weldGranularity:${f.weldGranularity}`],
    f.inspectionScope === 'sample'
      ? `${f.samplePercent}% inspected`
      : `${FLAG_OPTION_LABELS[`inspectionScope:${f.inspectionScope}`]} inspection`,
    ...(f.taskDirection === 'weld-first' ? ['Weld first'] : []),
    ...(f.signOffRigor !== 'none' ? [`Sign: ${FLAG_OPTION_LABELS[`signOffRigor:${f.signOffRigor}`]}`] : []),
  ];
}

function WorkOrderGroup({ group, flow }: { group: QueueWorkOrderGroup; flow: OperatorFlow }) {
  const preset = getPreset(group.workOrder.presetId);
  const Icon = preset.icon;
  const remaining = group.parts.filter((p) => !p.completed);
  const done = group.parts.filter((p) => p.completed);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1f1f1f] border border-[#2a2a2a] rounded-md">
          <Icon className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-xs text-white font-medium">{preset.name}</span>
        </span>
        <span className="text-xs font-mono text-yellow-500">{group.workOrder.id}</span>
        <span className="text-sm text-white font-medium">{group.workOrder.name}</span>
        <div className="flex gap-1.5 flex-wrap ml-auto">
          {workOrderChips(group.workOrder).map((chip) => (
            <span key={chip} className="text-[10px] text-gray-500 bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded">
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {remaining.map((item) =>
          item.mode === 'part-level' ? (
            <PartSessionCard key={item.part.id} item={item} flow={flow} />
          ) : (
            <PerWeldPartCard key={item.part.id} item={item} flow={flow} />
          )
        )}
        {done.map((item) => (
          <CompletedPartCard key={item.part.id} item={item} />
        ))}
      </div>
    </div>
  );
}

/* ───────── Per-weld part card ───────── */

function PerWeldPartCard({ item, flow }: { item: QueuePartItem; flow: OperatorFlow }) {
  const [expanded, setExpanded] = useState(false);
  const { part, welds } = item;
  const startable = welds.find((w) => !w.completed && w.gate !== 'locked');
  const totalDuration = welds.filter((w) => !w.completed).reduce((s, w) => s + w.weld.duration, 0);
  const hasPriority = welds.some((w) => !w.completed && w.weld.priority);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-base">{part.id}</span>
              <span className="text-sm text-gray-400">· {part.name}</span>
            </div>
            <div className="text-sm text-gray-400 mt-0.5">{part.description}</div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                {item.remaining} weld{item.remaining !== 1 ? 's' : ''} · {totalDuration} min remaining
              </span>
              {hasPriority && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Priority</Badge>
              )}
            </div>
          </div>

          <button
            onClick={() => startable && flow.selectWeld(startable.weld, item.workOrder)}
            disabled={!startable}
            className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              startable
                ? 'bg-yellow-500 hover:bg-yellow-400 hover:scale-105 shadow-lg shadow-yellow-500/20'
                : 'bg-[#2a2a2a] cursor-not-allowed'
            }`}
          >
            {startable ? (
              <Play className="w-6 h-6 text-black ml-0.5" />
            ) : (
              <Lock className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        <button onClick={() => setExpanded(!expanded)} className="w-full mt-4 pt-3 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {welds.map((w) => (
                <span
                  key={w.weld.id}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono border ${
                    w.completed
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : w.gate === 'locked'
                      ? 'bg-[#1f1f1f] text-gray-600 border-[#2a2a2a]'
                      : w.weld.priority
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-[#1f1f1f] text-gray-400 border-[#2a2a2a]'
                  }`}
                >
                  {w.completed && <Check className="w-3 h-3 mr-1" />}
                  {w.gate === 'locked' && <Lock className="w-3 h-3 mr-1" />}
                  {w.weld.id}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0 ml-2">
              <span>{expanded ? 'Hide welds' : 'View welds'}</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#2a2a2a] px-4 pb-4 pt-3 bg-[#141414]/50">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
            Welds assigned — tap one to start
          </div>
          <div className="space-y-2">
            {welds.map((w, i) => (
              <WeldRow key={w.weld.id} item={w} index={i} workOrder={item.workOrder} flow={flow} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeldRow({
  item,
  index,
  workOrder,
  flow,
}: {
  item: QueuePartItem['welds'][number];
  index: number;
  workOrder: WorkOrder;
  flow: OperatorFlow;
}) {
  const { weld } = item;
  const disabled = item.completed || item.gate === 'locked';

  return (
    <button
      onClick={() => !disabled && flow.selectWeld(weld, workOrder)}
      disabled={disabled}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors group ${
        item.completed
          ? 'bg-green-500/5 border-green-500/20 opacity-50 cursor-default'
          : item.gate === 'locked'
          ? 'bg-[#1a1a1a] border-[#2a2a2a] opacity-60 cursor-not-allowed'
          : 'bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#1f1f1f]'
      }`}
    >
      {item.completed ? (
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-green-400" />
        </div>
      ) : item.gate === 'locked' ? (
        <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4 text-gray-500" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs font-bold shrink-0 text-gray-400 group-hover:text-white">
          {index + 1}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${item.completed ? 'text-green-400' : 'text-white'}`}>
            {weld.id}
          </span>
          <span className="text-xs text-gray-500">{weld.jointType}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] text-gray-500 bg-[#141414] px-2 py-0.5 rounded">{weld.wps}</span>
          <span className="text-[10px] text-gray-500 bg-[#141414] px-2 py-0.5 rounded">{weld.duration} min</span>
          <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono">{weld.process}</span>
          {item.repair && !item.completed && (
            <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Wrench className="w-2.5 h-2.5" />
              {item.repair.of === weld.id ? 'REWORK' : `REPAIR of ${item.repair.of}`} · {item.repair.defectCode}
              {item.repair.note ? ` — ${item.repair.note}` : ''}
            </span>
          )}
          {item.gate === 'locked' && (
            <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> {item.gateReason}
            </span>
          )}
          {item.gate === 'warn' && (
            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> {item.gateReason}
            </span>
          )}
        </div>
      </div>
      {item.completed && (
        <span className="text-[10px] font-medium text-green-400 uppercase tracking-wider shrink-0">Done</span>
      )}
    </button>
  );
}

/* ───────── Part-level session card ───────── */

function PartSessionCard({ item, flow }: { item: QueuePartItem; flow: OperatorFlow }) {
  const { part } = item;
  const locked = item.gate === 'locked';

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-base">{part.id}</span>
            <span className="text-sm text-gray-400">· {part.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
              Part session
            </span>
            {item.rework && (
              <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Wrench className="w-2.5 h-2.5" />
                REWORK{item.rework.defectCode ? ` · ${item.rework.defectCode}` : ''}
                {item.rework.note ? ` — ${item.rework.note}` : ''}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400 mt-0.5">{part.description}</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
              {part.welds.length} welds · arcs bundle automatically
            </span>
            {item.attributedArcs > 0 && (
              <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                <Zap className="w-3 h-3" /> {item.attributedArcs} arc{item.attributedArcs !== 1 ? 's' : ''} attributed
              </span>
            )}
            {item.gate === 'warn' && (
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> {item.gateReason}
              </span>
            )}
            {locked && (
              <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> {item.gateReason}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => !locked && flow.startPartSession(part, item.workOrder)}
          disabled={locked}
          className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            !locked
              ? 'bg-yellow-500 hover:bg-yellow-400 hover:scale-105 shadow-lg shadow-yellow-500/20'
              : 'bg-[#2a2a2a] cursor-not-allowed'
          }`}
        >
          {locked ? <Lock className="w-5 h-5 text-gray-500" /> : <Play className="w-6 h-6 text-black ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

/* ───────── Completed part card ───────── */

function CompletedPartCard({ item }: { item: QueuePartItem }) {
  return (
    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
        <Check className="w-5 h-5 text-green-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-semibold">{item.part.id}</span>
          <span className="text-sm text-gray-400">· {item.part.name}</span>
        </div>
        <span className="text-xs text-green-400">
          {item.mode === 'part-level' ? 'Part completed' : `${item.welds.length} welds completed`}
        </span>
      </div>
    </div>
  );
}

/* ───────── Unattributed arcs tray (weld-first) ───────── */

function UnattributedTray({ flow }: { flow: OperatorFlow }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const count = flow.unattributedArcs.length;
  const totalSeconds = flow.unattributedArcs.reduce((s, a) => s + a.duration, 0);

  const candidateParts: { part: Part; workOrderId: string }[] = flow.queue
    .filter((g) => g.workOrder.flags.taskDirection === 'weld-first')
    .flatMap((g) =>
      g.parts.filter((p) => !p.completed).map((p) => ({ part: p.part, workOrderId: g.workOrder.id }))
    );

  return (
    <div className={`mb-6 rounded-xl border p-4 ${count > 0 ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
      <div className="flex items-center gap-4 flex-wrap">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${count > 0 ? 'bg-yellow-500/15' : 'bg-[#2a2a2a]'}`}>
          <Inbox className={`w-5 h-5 ${count > 0 ? 'text-yellow-500' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">Unattributed arcs</div>
          <div className="text-xs text-gray-500">
            {count > 0
              ? `${count} arc${count !== 1 ? 's' : ''} · ${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')} arc time — sweep them into a part`
              : 'Weld-first mode: machine arcs land here when no part session is open'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={flow.simulateMachineArc}
            className="px-3 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-lg text-xs text-gray-300 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            Simulate machine arc
          </button>
          <button
            onClick={() => setAssignOpen(true)}
            disabled={count === 0}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              count > 0
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
            }`}
          >
            Assign to part
          </button>
        </div>
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Assign {count} arc{count !== 1 ? 's' : ''} to part</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {candidateParts.map(({ part, workOrderId }) => (
              <button
                key={part.id}
                onClick={() => {
                  flow.assignArcsToPart(part.id);
                  setAssignOpen(false);
                }}
                className="w-full text-left p-3 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-yellow-500">{part.id}</span>
                  <span className="text-sm text-white">{part.name}</span>
                </div>
                <span className="text-[11px] text-gray-500">{workOrderId} · {part.description}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

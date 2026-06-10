import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Search, Wrench, X, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompletedWeldRecord, PartCompletionRecord, User } from '@/types/weldcloud';
import { OperatorFlow } from '@/hooks/useOperatorFlow';

const DEFECT_CODES = [
  'Porosity',
  'Crack',
  'Lack of fusion',
  'Undercut',
  'Spatter',
  'Dimensional',
];

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface RejectTarget {
  kind: 'weld' | 'part';
  id: string;
  label: string;
  /** new-weld model shows the assignee picker */
  allowAssign: boolean;
}

export function InspectorQueue({ flow, currentUser, users }: { flow: OperatorFlow; currentUser: User; users: User[] }) {
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [adHocOpen, setAdHocOpen] = useState(false);

  const pendingCount =
    flow.inspectionQueue.length + flow.partInspectionQueue.length + flow.fitUpApprovalQueue.length;
  const history = [
    ...flow.completedWelds.filter((cw) => cw.inspectionStatus === 'accepted' || cw.inspectionStatus === 'rejected'),
  ];
  const adHocCandidates = flow.uninspectedWelds.length + flow.uninspectedParts.length;

  const welderName = (id: string) => users.find((u) => u.id === id)?.name ?? id;
  const woName = (id: string) => flow.workOrders.find((w) => w.id === id)?.name ?? '';
  const repairModelFor = (workOrderId: string) =>
    flow.workOrders.find((w) => w.id === workOrderId)?.flags.repairModel ?? 'new-weld';

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          {currentUser.name} · Inspector · roaming
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {pendingCount > 0
            ? `${pendingCount} item${pendingCount !== 1 ? 's' : ''} awaiting inspection`
            : 'Inspection queue clear'}
        </h1>
      </div>

      <div className="space-y-3 mb-6">
        {/* Fit-up sign-offs come first — they block welders right now */}
        {flow.fitUpApprovalQueue.map((task) => (
          <div key={task.key} className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-white">{task.key}</span>
                  <span className="text-[10px] uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                    Fit-up sign-off
                  </span>
                  {task.weld && <span className="text-xs text-gray-500">{task.weld.jointType}</span>}
                </div>
                <div className="text-[11px] text-gray-500 mt-1.5">
                  {task.part.id} · {task.part.name} · {task.workOrder.id} — welder is blocked until
                  this fit-up is approved
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => flow.rejectFitUp(task.key)}
                  className="flex items-center gap-1.5 px-4 py-3 bg-[#1f1f1f] hover:bg-red-500/15 border border-[#2a2a2a] hover:border-red-500/40 rounded-xl text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Back to fitter
                </button>
                <button
                  onClick={() => flow.approveFitUp(task.key)}
                  className="flex items-center gap-1.5 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold text-white transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve fit-up
                </button>
              </div>
            </div>
          </div>
        ))}

        {flow.inspectionQueue.map((cw) => (
          <WeldInspectionCard
            key={cw.weld.id}
            record={cw}
            welderName={welderName(cw.welderId)}
            woName={woName(cw.workOrderId)}
            onAccept={() => flow.acceptWeld(cw.weld.id)}
            onReject={() =>
              setRejectTarget({
                kind: 'weld',
                id: cw.weld.id,
                label: `${cw.weld.id} · ${cw.weld.jointType}`,
                allowAssign: repairModelFor(cw.workOrderId) === 'new-weld',
              })
            }
          />
        ))}

        {flow.partInspectionQueue.map((cp) => (
          <PartInspectionCard
            key={cp.partId}
            record={cp}
            welderName={welderName(cp.welderId)}
            woName={woName(cp.workOrderId)}
            onAccept={() => flow.acceptPart(cp.partId)}
            onReject={() =>
              setRejectTarget({ kind: 'part', id: cp.partId, label: cp.partId, allowAssign: false })
            }
          />
        ))}

        {pendingCount === 0 && (
          <div className="p-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-center">
            <Search className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Nothing pending. Items appear here when welds complete on work orders with 100% or
              sampled inspection — or pull completed work in below.
            </p>
          </div>
        )}
      </div>

      {/* Ad-hoc: pull non-sampled work into inspection */}
      {adHocCandidates > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setAdHocOpen(!adHocOpen)}
            className="w-full flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:bg-[#1f1f1f] transition-colors"
          >
            <div className="text-left">
              <div className="text-sm font-medium text-white">Not routed to inspection</div>
              <div className="text-xs text-gray-500">
                {adHocCandidates} completed item{adHocCandidates !== 1 ? 's' : ''} outside the sample — inspect ad hoc
              </div>
            </div>
            {adHocOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
          {adHocOpen && (
            <div className="mt-2 space-y-2">
              {flow.uninspectedWelds.map((cw) => (
                <div key={cw.weld.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-white font-medium">{cw.weld.id}</span>
                    <span className="text-xs text-gray-500">{cw.weld.jointType} · {welderName(cw.welderId)}</span>
                    <span className="text-[10px] text-gray-500 bg-[#141414] px-1.5 py-0.5 rounded">
                      {cw.inspectionStatus === 'self-checked' ? 'self-checked' : 'not sampled'}
                    </span>
                  </div>
                  <button
                    onClick={() => flow.markWeldForInspection(cw.weld.id)}
                    aria-label={`inspect-${cw.weld.id}`}
                    className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-lg text-xs text-yellow-500 transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              ))}
              {flow.uninspectedParts.map((cp) => (
                <div key={cp.partId} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-white font-medium">{cp.partId}</span>
                    <span className="text-xs text-gray-500">
                      {cp.arcs.length} arcs · {welderName(cp.welderId)}
                    </span>
                    <span className="text-[10px] text-gray-500 bg-[#141414] px-1.5 py-0.5 rounded">
                      {cp.inspectionStatus === 'self-checked' ? 'self-checked' : 'not sampled'}
                    </span>
                  </div>
                  <button
                    onClick={() => flow.markPartForInspection(cp.partId)}
                    aria-label={`inspect-${cp.partId}`}
                    className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-lg text-xs text-yellow-500 transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:bg-[#1f1f1f] transition-colors"
          >
            <div className="text-sm font-medium text-white">
              Inspected ({history.length})
            </div>
            {historyOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
          {historyOpen && (
            <div className="mt-2 space-y-2">
              {history.map((cw) => (
                <div key={cw.weld.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{cw.weld.id}</span>
                    <span className="text-xs text-gray-500">{cw.weld.jointType}</span>
                    {cw.defectCode && <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{cw.defectCode}</span>}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      cw.inspectionStatus === 'accepted'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {cw.inspectionStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <RejectDialog
        target={rejectTarget}
        users={users}
        onClose={() => setRejectTarget(null)}
        onConfirm={(defectCode, note, assignedTo) => {
          if (!rejectTarget) return;
          if (rejectTarget.kind === 'weld') flow.rejectWeld(rejectTarget.id, defectCode, note, assignedTo);
          else flow.rejectPart(rejectTarget.id, defectCode, note);
          setRejectTarget(null);
        }}
      />
    </div>
  );
}

/* ───────── Cards ───────── */

function WeldInspectionCard({
  record,
  welderName,
  woName,
  onAccept,
  onReject,
}: {
  record: CompletedWeldRecord;
  welderName: string;
  woName: string;
  onAccept: () => void;
  onReject: () => void;
}) {
  const arcSeconds = record.arcs.reduce((s, a) => s + a.duration, 0);
  const avgConformance = record.arcs.length
    ? Math.round(record.arcs.reduce((s, a) => s + a.wpsConformance, 0) / record.arcs.length)
    : null;

  return (
    <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-white">{record.weld.id}</span>
            <span className="text-xs text-gray-500">{record.weld.jointType}</span>
            <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded font-mono">
              {record.weld.process}
            </span>
            {record.repairOf && (
              <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Wrench className="w-2.5 h-2.5" /> Repair of {record.repairOf}
                {record.defectCode ? ` · ${record.defectCode}` : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] text-gray-500">
            <span>{record.weld.partNumber} · {woName}</span>
            <span>· welded by {welderName} at {record.completedAt}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] text-gray-400 bg-[#141414] px-2 py-0.5 rounded">
              {record.arcs.length} arc{record.arcs.length !== 1 ? 's' : ''} · {formatTime(arcSeconds)}
            </span>
            {avgConformance !== null && (
              <span className={`text-[10px] px-2 py-0.5 rounded ${avgConformance >= 90 ? 'text-green-400 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                {avgConformance}% WPS conformance
              </span>
            )}
            <span className="text-[10px] text-gray-400 bg-[#141414] px-2 py-0.5 rounded">{record.weld.wps}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 px-4 py-3 bg-[#1f1f1f] hover:bg-red-500/15 border border-[#2a2a2a] hover:border-red-500/40 rounded-xl text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-1.5 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

function PartInspectionCard({
  record,
  welderName,
  woName,
  onAccept,
  onReject,
}: {
  record: PartCompletionRecord;
  welderName: string;
  woName: string;
  onAccept: () => void;
  onReject: () => void;
}) {
  const arcSeconds = record.arcs.reduce((s, a) => s + a.duration, 0);

  return (
    <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-white">{record.partId}</span>
            <span className="text-[10px] uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
              Part level
            </span>
            {record.selfChecked && (
              <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">self-check passed</span>
            )}
          </div>
          <div className="text-[11px] text-gray-500 mt-1.5">
            {woName} · welded by {welderName} at {record.completedAt}
          </div>
          <span className="inline-block text-[10px] text-gray-400 bg-[#141414] px-2 py-0.5 rounded mt-2">
            {record.arcs.length} arc{record.arcs.length !== 1 ? 's' : ''} bundled · {formatTime(arcSeconds)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 px-4 py-3 bg-[#1f1f1f] hover:bg-red-500/15 border border-[#2a2a2a] hover:border-red-500/40 rounded-xl text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-1.5 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Reject dialog ───────── */

function RejectDialog({
  target,
  users,
  onClose,
  onConfirm,
}: {
  target: RejectTarget | null;
  users: User[];
  onClose: () => void;
  onConfirm: (defectCode: string, note: string, assignedTo?: string) => void;
}) {
  const [defectCode, setDefectCode] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const welders = users.filter((u) => u.role === 'welder');

  const reset = () => {
    setDefectCode(null);
    setNote('');
    setAssignedTo(undefined);
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Reject {target?.label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Defect code — required</div>
            <div className="grid grid-cols-3 gap-2">
              {DEFECT_CODES.map((code) => (
                <button
                  key={code}
                  onClick={() => setDefectCode(code)}
                  className={`p-2.5 rounded-lg text-xs font-medium border transition-colors ${
                    defectCode === code
                      ? 'bg-red-500/15 border-red-500/50 text-red-400'
                      : 'bg-[#1f1f1f] border-[#2a2a2a] text-gray-400 hover:bg-[#2a2a2a]'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Note — optional</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. cluster porosity at 2 o'clock, grind out and re-weld"
              className="w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500/40 resize-none"
            />
          </div>

          {target?.allowAssign ? (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Repair weld {target.id.replace(/-R\d+$/, '')}-R# — assign to
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setAssignedTo(undefined)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    assignedTo === undefined
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : 'bg-[#1f1f1f] border-[#2a2a2a] text-gray-400 hover:bg-[#2a2a2a]'
                  }`}
                >
                  Open pool
                </button>
                {welders.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setAssignedTo(w.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      assignedTo === w.id
                        ? 'bg-yellow-500 text-black border-yellow-500'
                        : 'bg-[#1f1f1f] border-[#2a2a2a] text-gray-400 hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              This work order uses the rework-flag model — the item reopens in the welder queue with
              the defect attached.
            </p>
          )}

          <button
            onClick={() => {
              if (defectCode) {
                onConfirm(defectCode, note, assignedTo);
                reset();
              }
            }}
            disabled={!defectCode}
            className={`w-full p-3.5 rounded-xl font-bold text-sm transition-colors ${
              defectCode
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirm rejection
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

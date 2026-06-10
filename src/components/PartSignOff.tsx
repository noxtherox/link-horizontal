import { useState } from 'react';
import { BadgeCheck, Check, ClipboardCheck, Search, Zap } from 'lucide-react';
import { OperatorFlow } from '@/hooks/useOperatorFlow';
import { User } from '@/types/weldcloud';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PartSignOff({ flow, currentUser }: { flow: OperatorFlow; currentUser: User }) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const target = flow.signTarget;

  if (!target) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full flex items-center justify-center mb-4">
          <ClipboardCheck className="w-7 h-7 text-gray-500" />
        </div>
        <h1 className="text-xl font-bold text-white mb-1">Nothing to sign right now</h1>
        <p className="text-sm text-gray-500 max-w-sm">
          Sign-off opens automatically when you complete a part on a work order that requires it.
        </p>
      </div>
    );
  }

  const { part, workOrder } = target;
  const perWeld = workOrder.flags.signOffRigor === 'per-weld';
  const records = flow.completedWelds.filter((cw) => cw.weld.partNumber === part.id && !cw.signed);
  const toInspect = records.filter((cw) => cw.inspectionStatus === 'pending').length;
  const totalArcSeconds = records.reduce((s, cw) => s + cw.arcs.reduce((a, arc) => a + arc.duration, 0), 0);

  const allTapped = !perWeld || records.every((cw) => tapped.has(cw.weld.id));

  const toggleTap = (weldId: string) => {
    setTapped((prev) => {
      const next = new Set(prev);
      if (next.has(weldId)) next.delete(weldId);
      else next.add(weldId);
      return next;
    });
  };

  const confirm = () => {
    flow.signWelds(records.map((cw) => cw.weld.id));
    flow.finishSignOff();
    setTapped(new Set());
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          {workOrder.id} · {workOrder.name}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Sign off {part.id} · {part.name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {perWeld
            ? `Tap each weld to sign it individually — ${records.length} signatures required`
            : `One batch signature covers all ${records.length} welds on this part`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{records.length}</div>
          <div className="text-xs text-gray-500">Welds</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white font-mono">{formatTime(totalArcSeconds)}</div>
          <div className="text-xs text-gray-500">Arc time</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">{toInspect}</div>
          <div className="text-xs text-gray-500">To inspection</div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {records.map((cw) => {
          const signed = tapped.has(cw.weld.id);
          const arcSeconds = cw.arcs.reduce((s, a) => s + a.duration, 0);
          return (
            <button
              key={cw.weld.id}
              onClick={() => perWeld && toggleTap(cw.weld.id)}
              disabled={!perWeld}
              className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                signed
                  ? 'bg-yellow-500/10 border-yellow-500/40'
                  : 'bg-[#1a1a1a] border-[#2a2a2a]'
              } ${perWeld ? 'hover:bg-[#1f1f1f] cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  signed ? 'bg-yellow-500 text-black' : 'bg-[#2a2a2a] text-gray-400'
                }`}
              >
                {signed ? <BadgeCheck className="w-5 h-5" /> : <Zap className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{cw.weld.id}</span>
                  <span className="text-xs text-gray-500">{cw.weld.jointType}</span>
                  <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded font-mono">
                    {cw.weld.process}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-gray-500">
                  <span>{cw.arcs.length} arc{cw.arcs.length !== 1 ? 's' : ''} · {formatTime(arcSeconds)}</span>
                  <span>· completed {cw.completedAt}</span>
                  {cw.inspectionStatus === 'pending' && (
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Search className="w-3 h-3" /> inspection
                    </span>
                  )}
                </div>
              </div>
              {perWeld && (
                <span className={`text-xs font-medium uppercase tracking-wider shrink-0 ${signed ? 'text-yellow-500' : 'text-gray-600'}`}>
                  {signed ? 'Signed' : 'Tap to sign'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={confirm}
        disabled={!allTapped || records.length === 0}
        className={`w-full flex flex-col items-center justify-center gap-1 p-5 rounded-xl transition-colors ${
          allTapped && records.length > 0
            ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
            : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
        }`}
      >
        <span className="font-bold text-xl flex items-center gap-2">
          <Check className="w-5 h-5" />
          {perWeld ? `Confirm ${records.length} signatures` : 'Sign part batch'}
        </span>
        <span className={`text-xs font-medium ${allTapped && records.length > 0 ? 'text-black/70' : 'text-gray-600'}`}>
          Signed as {currentUser.name} · {currentUser.badgeId}
          {toInspect > 0 ? ` · ${toInspect} weld${toInspect !== 1 ? 's' : ''} will go to inspection` : ''}
        </span>
      </button>
    </div>
  );
}

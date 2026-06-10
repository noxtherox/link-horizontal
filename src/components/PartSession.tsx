import { useState } from 'react';
import { ArrowLeft, Check, Zap, ShieldCheck } from 'lucide-react';
import { DrawingWithHighlight } from '@/components/DrawingWithHighlight';
import { OperatorFlow } from '@/hooks/useOperatorFlow';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function PartSession({ flow }: { flow: OperatorFlow }) {
  const [selfChecked, setSelfChecked] = useState(false);
  const session = flow.partSession;
  if (!session) return null;

  const { part, workOrder } = session;
  const needsSelfCheck = workOrder.flags.inspectionScope === 'self-check';
  const totalArcSeconds = flow.sessionArcs.reduce((s, a) => s + a.duration, 0);
  const canComplete = flow.sessionArcs.length > 0 && (!needsSelfCheck || selfChecked);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={flow.pausePartSession}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {part.id} · {part.name}
        </h1>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
          Part session · {workOrder.id}
        </span>
      </div>

      <div className="mb-6">
        <DrawingWithHighlight selectedWeld={null} currentPart={part} compact />
      </div>

      {flow.sessionVerificationNeeded ? (
        /* Consumables once per part, then the welder never touches the screen */
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-400">
              Verify consumables once for this part — after that, just weld.
            </div>
          </div>
          <button
            onClick={flow.verifySessionConsumables}
            className="w-full flex items-center justify-center gap-2 p-5 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-black font-bold text-base transition-colors"
          >
            <Check className="w-5 h-5" />
            Confirm consumables for {part.id}
          </button>
        </div>
      ) : (
        <>
          {/* Session status: arcs bundle automatically, no taps */}
          <div className="text-center mb-6">
            <div className="inline-flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-green-500 bg-green-500/10 mb-3 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-green-500 mb-2">
                Session armed — weld freely
              </div>
            </div>
            <div className="text-5xl md:text-6xl font-bold text-white font-mono tracking-tight">
              {formatTime(flow.sessionTime)}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Every machine arc is bundled to {part.id} automatically
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 max-w-md mx-auto">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Arcs bundled</div>
              <div className="text-3xl font-bold text-yellow-500 flex items-center justify-center gap-1.5">
                <Zap className="w-5 h-5" />
                {flow.sessionArcs.length}
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Arc time</div>
              <div className="text-3xl font-bold text-white font-mono">{formatTime(totalArcSeconds)}</div>
            </div>
          </div>

          {/* Latest arcs feed */}
          {flow.sessionArcs.length > 0 && (
            <div className="max-w-md mx-auto mb-6">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Latest arcs</div>
              <div className="space-y-1.5">
                {flow.sessionArcs.slice(-4).reverse().map((arc) => (
                  <div
                    key={arc.id}
                    className="flex items-center justify-between p-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs"
                  >
                    <span className="flex items-center gap-2 text-gray-300">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      {formatTime(arc.duration)} arc
                    </span>
                    <span className="text-gray-500">{arc.avgHeat} kJ/mm</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-md mx-auto space-y-3">
            {needsSelfCheck && (
              <button
                onClick={() => setSelfChecked(!selfChecked)}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl border transition-colors font-medium ${
                  selfChecked
                    ? 'bg-green-500/10 border-green-500/40 text-green-400'
                    : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:bg-[#1f1f1f]'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                {selfChecked ? 'Self-check passed' : 'Confirm self-check — welds visually OK'}
              </button>
            )}

            <button
              onClick={() => flow.completePartSession(selfChecked)}
              disabled={!canComplete}
              className={`w-full flex flex-col items-center justify-center gap-1 p-6 rounded-xl transition-colors ${
                canComplete
                  ? 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300'
                  : 'bg-[#2a2a2a] cursor-not-allowed'
              }`}
            >
              <span className={`font-bold text-2xl ${canComplete ? 'text-black' : 'text-gray-500'}`}>
                Part complete
              </span>
              <span className={`text-sm font-medium ${canComplete ? 'text-black/70' : 'text-gray-600'}`}>
                {flow.sessionArcs.length === 0
                  ? 'Waiting for first arc'
                  : needsSelfCheck && !selfChecked
                  ? 'Confirm self-check first'
                  : `Bundle ${flow.sessionArcs.length} arc${flow.sessionArcs.length !== 1 ? 's' : ''} and finish`}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

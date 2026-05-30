import { AlertTriangle } from 'lucide-react';
import { Weld, Part } from '@/types/weldcloud';
import { gasSpec } from '@/data/mockData';
import { DrawingWithHighlight } from './DrawingWithHighlight';

interface PreWeldCheckProps {
  onVerify: (id: string) => void;
  onStart: () => void;
  allVerified: boolean;
  selectedWeld: Weld | null;
  parts: Part[];
  onSelectWeld: (weld: Weld) => void;
}

export function PreWeldCheck({
  onVerify,
  onStart,
  allVerified,
  selectedWeld,
  parts,
  onSelectWeld
}: PreWeldCheckProps) {
  const currentPart = selectedWeld
    ? parts.find(p => p.id === selectedWeld.partNumber)
    : undefined;
  
  const otherWelds = currentPart
    ? currentPart.welds.filter(w => w.id !== selectedWeld?.id)
    : [];

  return (
    <div className="p-4 md:p-6">
      {/* Top header with weld info + WPS badges + Start Arc */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          Pre-weld · {selectedWeld?.id || '—'} · {currentPart?.id || '—'} · {selectedWeld?.wps || '—'}
        </div>
        
        <div className="flex items-start justify-between flex-wrap gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {selectedWeld?.id || '—'} · {selectedWeld?.jointType || '—'}
          </h1>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#2a2a2a]">
              {selectedWeld?.wps}
            </span>
            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded border border-yellow-500/20 font-mono">
              {selectedWeld?.process}
            </span>
            <span className="text-xs text-gray-500 bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#2a2a2a]">
              {selectedWeld?.duration} min
            </span>
            {selectedWeld?.priority && (
              <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20">
                Priority
              </span>
            )}
            <button
              onClick={onStart}
              disabled={!allVerified}
              className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
                allVerified
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                  : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Arc
            </button>
          </div>
        </div>
      </div>

      {/* Part Drawing */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
          Part Drawing · {currentPart?.id || '—'}
        </div>
        <DrawingWithHighlight selectedWeld={selectedWeld} currentPart={currentPart} />
      </div>

      {/* Other welds on this part */}
      {otherWelds.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
            Other welds on this part — tap to switch
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherWelds.map((weld) => (
              <button
                key={weld.id}
                onClick={() => onSelectWeld(weld)}
                className="text-left p-3 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-yellow-500/30 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{weld.id}</span>
                  <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono">
                    {weld.process}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{weld.jointType}</div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                    {weld.wps}
                  </span>
                  <span className="text-[10px] text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                    {weld.duration} min
                  </span>
                  {weld.priority && (
                    <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                      Priority
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom: Gas confirmed + Gas spec */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <span className="text-yellow-500">🎤</span>
              <span className="font-mono">"gas confirmed"</span>
            </div>
            <div className="bg-[#141414] rounded-lg p-4">
              <p className="text-sm text-white font-medium mb-3">
                Confirm Ar/CO₂ 80/20 shielding gas present and connected?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onVerify('c4')}
                  className="flex flex-col items-center justify-center gap-1 p-4 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                >
                  <span className="text-white text-lg">✓</span>
                  <span className="text-white font-medium">Yes</span>
                  <span className="text-[10px] text-green-200">Say 'yes' or tap</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1 p-4 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg transition-colors">
                  <span className="text-white text-lg">✕</span>
                  <span className="text-white font-medium">No</span>
                  <span className="text-[10px] text-gray-400">Say 'no' or tap</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">WPS-A36-3G · Gas Spec</div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Mix</span>
                <span className="text-white font-medium">{gasSpec.mix}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Flow rate</span>
                <span className="text-white font-medium">{gasSpec.flowRate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Min pressure</span>
                <span className="text-white font-medium">{gasSpec.minPressure}</span>
              </div>
            </div>
          </div>
          
          {!allVerified && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-500">
                Scan all consumables in the right panel before starting arc.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
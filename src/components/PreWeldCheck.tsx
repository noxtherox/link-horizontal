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
  
  const allWelds = currentPart?.welds || [];

  return (
    <div className="p-4 md:p-6">
      {/* Top header with weld info + WPS badges + Start Arc */}
      <div className="mb-6">
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
        <DrawingWithHighlight selectedWeld={selectedWeld} currentPart={currentPart} />
      </div>

      {/* All welds on this part */}
      {allWelds.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
            Welds on this part — tap to switch
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {allWelds.map((weld) => {
              const isCurrent = weld.id === selectedWeld?.id;
              return (
                <button
                  key={weld.id}
                  onClick={() => !isCurrent && onSelectWeld(weld)}
                  disabled={isCurrent}
                  className={`relative text-center p-4 rounded-xl transition-colors ${
                    isCurrent
                      ? 'bg-yellow-500/10 border border-yellow-500/40 cursor-default'
                      : 'bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-yellow-500/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* Process pill top-right */}
                  <span className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-mono border ${
                    isCurrent
                      ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                      : 'text-gray-500 bg-[#141414] border-[#2a2a2a]'
                  }`}>
                    {weld.process}
                  </span>

                  {/* Large centered weld ID */}
                  <div className={`text-3xl font-bold mb-1 ${
                    isCurrent ? 'text-white' : 'text-gray-400'
                  }`}>
                    {weld.id}
                  </div>

                  {/* Subtext details */}
                  <div className={`text-[11px] mb-3 ${
                    isCurrent ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {weld.jointType}
                  </div>

                  {/* Bottom tags */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className={`text-[9px] px-2 py-0.5 rounded ${
                      isCurrent ? 'text-gray-400 bg-[#141414]' : 'text-gray-600 bg-[#141414]'
                    }`}>
                      {weld.wps}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded ${
                      isCurrent ? 'text-gray-400 bg-[#141414]' : 'text-gray-600 bg-[#141414]'
                    }`}>
                      {weld.duration} min
                    </span>
                    {weld.priority && (
                      <span className={`text-[9px] px-2 py-0.5 rounded ${
                        isCurrent ? 'text-red-400 bg-red-500/10' : 'text-red-900 bg-red-500/5'
                      }`}>
                        Priority
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
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
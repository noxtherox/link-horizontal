import { Check, Scan } from 'lucide-react';
import { Consumable } from '@/types/weldcloud';
import { gasSpec } from '@/data/mockData';

interface PreWeldCheckProps {
  consumables: Consumable[];
  onVerify: (id: string) => void;
  onStart: () => void;
  allVerified: boolean;
}

export function PreWeldCheck({ consumables, onVerify, onStart, allVerified }: PreWeldCheckProps) {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          Pre-weld · W-014 · Item 4 of 4 · WPS-A36-3G
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Shielding gas — Ar/CO₂ 80/20
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {consumables.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onVerify(c.id)}
              className={`w-full text-left flex items-center justify-between p-4 rounded-lg border transition-colors ${
                c.verified
                  ? 'bg-[#1a2a1a] border-green-500/30'
                  : i === 3
                  ? 'bg-[#2a1a1a] border-yellow-500/30'
                  : 'bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#1f1f1f]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    c.verified ? 'bg-green-500 text-black' : 'bg-[#2a2a2a] text-gray-400'
                  }`}
                >
                  {c.verified ? <Check className="w-4 h-4" /> : <span className="text-sm">{i + 1}</span>}
                </div>
                <div>
                  <div className={`text-sm font-medium ${c.verified ? 'text-green-400' : 'text-white'}`}>
                    {c.name} · {c.lot}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.verified && c.method === 'scan' && (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Scan className="w-3 h-3" /> Scan
                  </span>
                )}
                {c.verified && c.method === 'auto' && (
                  <span className="text-[10px] text-gray-500">Auto</span>
                )}
                {!c.verified && (
                  <span className="text-[10px] text-yellow-500">Pending</span>
                )}
              </div>
            </button>
          ))}

          <div className="mt-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
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

        <div className="space-y-4">
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

          {allVerified && (
            <button
              onClick={onStart}
              className="w-full p-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
            >
              Start Arc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
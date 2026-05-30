import { useState } from 'react';
import { Check, Scan, ImageOff } from 'lucide-react';
import { Consumable, Weld, Part } from '@/types/weldcloud';
import { gasSpec } from '@/data/mockData';

interface PreWeldCheckProps {
  consumables: Consumable[];
  onVerify: (id: string) => void;
  onStart: () => void;
  allVerified: boolean;
  selectedWeld: Weld | null;
  parts: Part[];
  onSelectWeld: (weld: Weld) => void;
}

export function PreWeldCheck({ 
  consumables, 
  onVerify, 
  onStart, 
  allVerified,
  selectedWeld,
  parts,
  onSelectWeld
}: PreWeldCheckProps) {
  const [imageError, setImageError] = useState(false);
  
  const currentPart = selectedWeld 
    ? parts.find(p => p.id === selectedWeld.partNumber) 
    : undefined;
  
  const otherWelds = currentPart 
    ? currentPart.welds.filter(w => w.id !== selectedWeld?.id) 
    : [];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          Pre-weld · {selectedWeld?.id || '—'} · {currentPart?.id || '—'} · {selectedWeld?.wps || '—'}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {selectedWeld?.id || 'Select a weld'} · {selectedWeld?.jointType || '—'}
        </h1>
      </div>

      {/* Part Drawing */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
          Part Drawing · {currentPart?.id || '—'}
        </div>
        <div className="bg-white rounded-xl border border-[#2a2a2a] overflow-hidden">
          {!imageError ? (
            <img 
              src="/.dyad/media/91d0dd50d18370a2fe22dec401e802b5ba0fe0d7a7b3d51d20842996537eba11.png"
              alt={`Drawing for ${currentPart?.id || 'part'}`}
              className="w-full h-auto max-h-80 object-contain mx-auto"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-3 bg-[#f5f5f5]">
              <ImageOff className="w-10 h-10 text-gray-400" />
              <span className="text-sm text-gray-500">Part drawing for {currentPart?.id}</span>
              <span className="text-xs text-gray-400">CAD view · Section B</span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-white font-medium">{currentPart?.id}</span>
          <span className="text-sm text-gray-400">· {currentPart?.name}</span>
          <span className="text-xs text-gray-500">· {currentPart?.description}</span>
        </div>
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
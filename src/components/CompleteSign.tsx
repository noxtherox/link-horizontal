import { Check, AlertTriangle } from 'lucide-react';

interface CompleteSignProps {
  onSign: () => void;
  arcTime: number;
}

export function CompleteSign({ onSign, arcTime }: CompleteSignProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          W-014 · Complete · Review and sign
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Weld complete — sign to close</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Arc Summary</div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm border-b border-[#2a2a2a] pb-2">
              <span className="text-gray-400">Arc time</span>
              <span className="text-white font-medium">{formatTime(arcTime)}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-[#2a2a2a] pb-2">
              <span className="text-gray-400">Avg heat</span>
              <span className="text-yellow-500 font-medium">1.02 kJ/mm</span>
            </div>
            <div className="flex justify-between text-sm border-b border-[#2a2a2a] pb-2">
              <span className="text-gray-400">WPS conformance</span>
              <span className="text-white font-medium">87%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Passes</span>
              <span className="text-white font-medium">Root · Fill · Cap</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Open Items</div>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <span className="text-yellow-500">
                Heat excursion at 00:42 — queued for Inspector A. Lehmann
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-green-400">Deviation note saved</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl">
        <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="text-yellow-500">🎤</span>
            <span className="font-mono">"confirm complete"</span>
          </div>

          <div className="bg-[#141414] rounded-lg p-4">
            <p className="text-sm text-white font-medium mb-3">
              Sign W-014 and route to Inspector A. Lehmann?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onSign}
                className="flex flex-col items-center justify-center gap-1 p-4 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"
              >
                <span className="text-white text-lg">✓</span>
                <span className="text-white font-medium">Yes</span>
                <span className="text-[10px] text-yellow-200">"yes sign" or re-tap badge — irreversible</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-1 p-4 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg transition-colors">
                <span className="text-white text-lg">✕</span>
                <span className="text-white font-medium">No</span>
                <span className="text-[10px] text-gray-400">"no" to go back</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
          <p className="text-xs text-gray-500">
            After sign: W-015 · P-4471-B · fillet 2F will auto-load
          </p>
        </div>
      </div>
    </div>
  );
}
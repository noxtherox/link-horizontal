import { Check, ArrowRight } from 'lucide-react';

interface DeviationFlagProps {
  deviationText: string;
  setDeviationText: (t: string) => void;
  onSave: () => void;
  arcTime: number;
}

export function DeviationFlag({ _deviationText, _setDeviationText, onSave, arcTime }: DeviationFlagProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          Deviation · W-014 · Arc paused · Parameters auto-attached
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Describe the deviation</h1>
      </div>

      <div className="max-w-3xl">
        <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="text-yellow-500">🎤</span>
            <span className="font-mono">"deviation — heat input high, travel speed dropped on root"</span>
          </div>

          <div className="bg-[#141414] rounded-lg p-4 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Transcribed Note</div>
            <p className="text-sm text-gray-300 italic mb-3">
              "Heat input high, travel speed dropped on root"
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Check className="w-3 h-3" />
                <span>Parameter auto-attached: heat input 1.04 kJ/mm at {formatTime(arcTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Check className="w-3 h-3" />
                <span>WPS limit auto-attached: 1.00 kJ/mm max</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Check className="w-3 h-3" />
                <span>Draft routed to Inspector A. Lehmann</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] rounded-lg p-4">
            <p className="text-sm text-white font-medium mb-3">Save deviation note and resume arc?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onSave}
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

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ArrowRight className="w-3 h-3" />
          <span>After save: W-014 · P-4471-B · butt 3G will resume</span>
        </div>
      </div>
    </div>
  );
}
import { Mic, Check, Scan } from 'lucide-react';
import { ViewMode, WelderStep, Weld, Part, Consumable } from '@/types/weldcloud';

interface VoicePanelProps {
  viewMode: ViewMode;
  step: WelderStep;
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
  voiceCommand: string;
  selectedWeld: Weld | null;
  parts: Part[];
  consumables?: Consumable[];
  onVerify?: (id: string) => void;
}

const commandMap: Record<string, string[]> = {
  taskQueue: ['"start [weld ID]"', '"skip [weld ID]"', '"status"', '"help"'],
  preWeldCheck: ['"gas confirmed"', '"scan bottle"', '"gas missing"', '"skip"'],
  arcOn: ['"pause"', '"deviation [description]"', '"complete"'],
  deviationFlag: ['"deviation [description]"', '"redo"', '"cancel deviation"', '"yes resume"'],
  completeSign: ['"yes sign"', '"no"', '"review"'],
  supervisor: ['"status cell [ID]"', '"alert welder [name]"', '"page [name]"', '"overview"'],
};

const panelTitles: Record<string, string> = {
  taskQueue: 'SAY ONE OF',
  preWeldCheck: 'SAY ONE OF',
  arcOn: 'SAY ONE OF',
  deviationFlag: 'SAY ONE OF',
  completeSign: 'SAY ONE OF',
  supervisor: 'SAY ONE OF',
};

const micLabels: Record<string, string> = {
  taskQueue: 'Press to speak',
  preWeldCheck: 'Press to speak',
  arcOn: 'Press to speak',
  deviationFlag: 'Press to speak',
  completeSign: 'Press to speak',
  supervisor: 'Press to speak',
};

export function VoicePanel({ viewMode, step, isRecording, setIsRecording, voiceCommand, selectedWeld, parts, consumables, onVerify }: VoicePanelProps) {
  const key = viewMode === 'supervisor' ? 'supervisor' : step;
  let commands = commandMap[key] || [];
  
  // Add other weld commands when in pre-weld check
  if (viewMode === 'welder' && step === 'preWeldCheck' && selectedWeld && parts.length > 0) {
    const currentPart = parts.find(p => p.id === selectedWeld.partNumber);
    if (currentPart) {
      const otherWelds = currentPart.welds.filter(w => w.id !== selectedWeld.id);
      if (otherWelds.length > 0) {
        const weldCommands = otherWelds.map(w => `"start ${w.id}"`);
        commands = [...weldCommands, ...commands];
      }
    }
  }
  
  const title = panelTitles[key] || 'SAY ONE OF';
  const micLabel = micLabels[key] || 'Press to speak';

  const isPreWeldScan = viewMode === 'welder' && step === 'preWeldCheck' && consumables && onVerify;

  return (
    <aside className="w-full lg:w-72 bg-[#141414] border-t lg:border-l lg:border-t-0 border-[#2a2a2a] flex flex-col shrink-0">
      {viewMode === 'welder' && step === 'completeSign' && (
        <div className="p-4 border-b border-[#2a2a2a]">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">2-Input Rule</div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Signing is irreversible. Requires either: voice "yes sign" + badge re-tap, or touch confirm + badge tap, or two badge taps.
          </p>
        </div>
      )}

      {viewMode === 'supervisor' && (
        <div className="p-4 border-b border-[#2a2a2a]">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Alert Log</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">B-1 heat excursion</span>
              <span className="text-red-400">Sent 06:32</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">B-3 gas check</span>
              <span className="text-green-400">ACK 06:45</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">B-2 wire spool</span>
              <span className="text-green-400">ACK 06:31</span>
            </div>
          </div>
        </div>
      )}

      {isPreWeldScan ? (
        <div className="p-4 border-b border-[#2a2a2a] flex-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Scan Consumables</div>
          <div className="space-y-3">
            {consumables.map((c, i) => (
              <button
                key={c.id}
                onClick={() => onVerify(c.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  c.verified
                    ? 'bg-green-500/10 border-green-500/30'
                    : i === 3
                    ? 'bg-yellow-500/5 border-yellow-500/30'
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
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${c.verified ? 'text-green-400' : 'text-white'}`}>
                      {c.name}
                    </div>
                    <div className="text-xs text-gray-500">{c.lot}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {c.verified ? (
                    <span className="text-[10px] text-green-400 flex items-center gap-1">
                      <Scan className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-yellow-500 flex items-center gap-1">
                      <Scan className="w-3 h-3" /> Tap to scan
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-yellow-500">🎤</span>
              <span className="font-mono">"gas confirmed"</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 border-b border-[#2a2a2a]">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">{title}</div>
            <div className="space-y-2">
              {commands.map((cmd) => (
                <div
                  key={cmd}
                  className="px-2.5 py-1.5 bg-[#1f1f1f] rounded text-xs text-yellow-500 font-mono border border-[#2a2a2a]"
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>

          {voiceCommand && (
            <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Check className="w-3 h-3" />
                <span>Understood</span>
              </div>
              <p className="mt-1 text-sm text-white font-mono">{voiceCommand}</p>
            </div>
          )}
        </>
      )}

      {!isPreWeldScan && <div className="flex-1" />}

      <div className="p-6 flex flex-col items-center gap-4">
        <button
          className="w-full flex flex-col items-center justify-center gap-1 p-4 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg transition-colors border border-[#3a3a3a]"
        >
          <Scan className="w-6 h-6 text-yellow-500" />
          <span className="text-white font-medium text-sm">Scan</span>
          <span className="text-[10px] text-gray-400">Tap to scan barcode</span>
        </button>

        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-yellow-500 scale-110 shadow-lg shadow-yellow-500/20'
              : 'bg-[#2a2a2a] hover:bg-[#333333]'
          }`}
        >
          <Mic className={`w-8 h-8 ${isRecording ? 'text-black' : 'text-white'}`} />
        </button>
        <p className="text-sm font-medium text-white">{micLabel}</p>
        {isRecording && <p className="text-xs text-gray-500">Listening...</p>}
      </div>
    </aside>
  );
}
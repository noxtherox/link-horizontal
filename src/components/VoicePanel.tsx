import { Mic, Check } from 'lucide-react';
import { ViewMode, WelderStep } from '@/types/weldcloud';

interface VoicePanelProps {
  viewMode: ViewMode;
  step: WelderStep;
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
  voiceCommand: string;
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
  taskQueue: 'Hold to speak',
  preWeldCheck: 'Hold to speak',
  arcOn: 'Say a command',
  deviationFlag: 'Describe deviation',
  completeSign: 'Say "yes sign"',
  supervisor: 'Hold to command',
};

export function VoicePanel({ viewMode, step, isRecording, setIsRecording, voiceCommand }: VoicePanelProps) {
  const key = viewMode === 'supervisor' ? 'supervisor' : step;
  const commands = commandMap[key] || [];
  const title = panelTitles[key] || 'SAY ONE OF';
  const micLabel = micLabels[key] || 'Hold to speak';

  return (
    <aside className="w-full lg:w-72 bg-[#141414] border-l border-[#2a2a2a] flex flex-col">
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

      <div className="flex-1" />

      <div className="p-6 flex flex-col items-center">
        <button
          onMouseDown={() => setIsRecording(true)}
          onMouseUp={() => setIsRecording(false)}
          onTouchStart={() => setIsRecording(true)}
          onTouchEnd={() => setIsRecording(false)}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-yellow-500 scale-110 shadow-lg shadow-yellow-500/20'
              : 'bg-[#2a2a2a] hover:bg-[#333333]'
          }`}
        >
          <Mic className={`w-8 h-8 ${isRecording ? 'text-black' : 'text-white'}`} />
        </button>
        <p className="mt-3 text-sm font-medium text-white">{micLabel}</p>
        {isRecording && <p className="mt-1 text-xs text-gray-500">"deviation" or "complete"</p>}
      </div>
    </aside>
  );
}
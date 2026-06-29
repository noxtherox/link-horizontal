import { Mic, Scan, Check } from 'lucide-react';
import { ViewMode, WelderStep, Weld, Part } from '@/types/weldcloud';

interface InputBarProps {
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
  voiceCommand: string;
  step: WelderStep;
  viewMode: ViewMode;
  weldActiveMode?: 'setup' | 'arc';
  selectedWeld: Weld | null;
  parts: Part[];
}

const commandMap: Record<string, string[]> = {
  taskQueue: ['"start W-014"', '"status"', '"help"'],
  weldActiveSetup: ['"gas confirmed"', '"scan bottle"', '"gas missing"'],
  weldActiveArc: ['"pause"', '"deviation ..."', '"complete"'],
  reviewAndSign: ['"yes sign"', '"no"', '"review"'],
  supervisor: ['"status cell [ID]"', '"alert welder [name]"', '"overview"'],
};

export function InputBar({
  isRecording,
  setIsRecording,
  voiceCommand,
  step,
  viewMode,
  weldActiveMode = 'setup',
  selectedWeld,
  parts,
}: InputBarProps) {
  let key: string;
  if (viewMode === 'supervisor') {
    key = 'supervisor';
  } else if (step === 'weldActive') {
    key = weldActiveMode === 'setup' ? 'weldActiveSetup' : 'weldActiveArc';
  } else {
    key = step;
  }

  const suggestions = commandMap[key] ?? [];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--c-surface)] border-t border-[var(--c-border)] px-5 py-3 flex items-center gap-5">
      {/* Mic button */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <button
          onPointerDown={() => setIsRecording(true)}
          onPointerUp={() => setIsRecording(false)}
          onPointerLeave={() => setIsRecording(false)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all select-none ${
            isRecording
              ? 'bg-yellow-500 shadow-lg shadow-yellow-500/30 scale-105'
              : 'bg-[var(--c-border)] hover:bg-[var(--c-hover)]'
          }`}
        >
          <Mic className={`w-6 h-6 ${isRecording ? 'text-black' : 'text-[var(--text-hi)]'}`} />
        </button>
        <span className="text-[9px] uppercase tracking-widest text-[var(--text-dim)] font-semibold">
          Hold to speak
        </span>
      </div>

      {/* Status + suggestions / reply */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5 justify-center">
        {/* Status row */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isRecording ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
          <span className={`text-xs font-semibold ${isRecording ? 'text-yellow-400' : 'text-[var(--text-verified)]'}`}>
            {isRecording ? 'Listening…' : 'Ready'}
          </span>
          {!isRecording && !voiceCommand && (
            <span className="text-xs text-[var(--text-dim)] hidden sm:inline">
              — hold the mic, or say one of:
            </span>
          )}
        </div>

        {/* Reply from last command */}
        {voiceCommand ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg w-fit max-w-full">
            <Check className="w-3 h-3 text-[var(--text-verified)] shrink-0" />
            <span className="text-xs text-[var(--text-verified)] font-mono truncate">{voiceCommand}</span>
          </div>
        ) : (
          /* Suggestion chips */
          <div className="flex items-center gap-2 flex-wrap">
            {suggestions.map((cmd) => (
              <span
                key={cmd}
                className="px-2.5 py-1 bg-[var(--c-elevated)] border border-[var(--c-border)] rounded text-[11px] text-yellow-500 font-mono whitespace-nowrap"
              >
                {cmd}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Scan button */}
      <button className="shrink-0 flex flex-col items-center justify-center gap-1 px-5 py-2.5 rounded-xl border border-dashed border-yellow-500/40 hover:border-yellow-500/70 hover:bg-yellow-500/5 transition-colors">
        <Scan className="w-5 h-5 text-yellow-500" />
        <span className="text-xs font-semibold text-[var(--text-hi)]">Scan</span>
        <span className="text-[9px] text-[var(--text-dim)] whitespace-nowrap">work order / QR</span>
      </button>
    </div>
  );
}

import { Check, Scan, Zap, ArrowRight, ChevronDown, ChevronUp, ClipboardCheck } from 'lucide-react';
import { ViewMode, WelderStep, Weld, Part, Consumable, CompletedWeld } from '@/types/weldcloud';
import { useState } from 'react';

interface VoicePanelProps {
  viewMode: ViewMode;
  step: WelderStep;
  weldActiveMode?: 'setup' | 'arc';
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
  voiceCommand: string;
  selectedWeld: Weld | null;
  nextWeld: Weld | null;
  parts: Part[];
  consumables?: Consumable[];
  completedWelds?: CompletedWeld[];
  onVerify?: (id: string) => void;
  onSendToInspection?: () => void;
  onSelectWeld?: (weld: Weld) => void;
}

export function VoicePanel({ viewMode, step, weldActiveMode = 'setup', isRecording, setIsRecording, voiceCommand, selectedWeld, nextWeld, parts, consumables, completedWelds, onVerify, onSendToInspection, onSelectWeld }: VoicePanelProps) {
  const [otherWeldsExpanded, setOtherWeldsExpanded] = useState(false);

  let key: string;
  if (viewMode === 'supervisor') {
    key = 'supervisor';
  } else if (step === 'weldActive') {
    key = weldActiveMode === 'setup' ? 'weldActiveSetup' : 'weldActiveArc';
  } else {
    key = step;
  }

  const isPreWeldScan = key === 'weldActiveSetup' && consumables && onVerify;

  // Next weld in the task queue (first weld of the first part) — used for the
  // press-to-confirm card that appears after the mic is pressed.
  const queueNextWeld = parts[0]?.welds[0] ?? null;

  // Compute other welds for arc mode
  const otherWelds: Weld[] = [];
  if (key === 'weldActiveArc' && selectedWeld) {
    const currentPart = parts.find(p => p.id === selectedWeld.partNumber);
    if (currentPart) {
      otherWelds.push(...currentPart.welds.filter(
        w => w.id !== selectedWeld.id && w.id !== nextWeld?.id
      ));
    }
  }

  const pendingInspectionCount = completedWelds?.filter(c => !c.locked).length || 0;
  const lockedCount = completedWelds?.filter(c => c.locked).length || 0;
  const totalCompleted = completedWelds?.length || 0;
  const allLocked = totalCompleted > 0 && lockedCount === totalCompleted;

  return (
    <aside className="w-full lg:w-72 bg-[var(--c-surface)] border-t lg:border-l lg:border-t-0 border-[var(--c-border)] flex flex-col shrink-0">
      {viewMode === 'supervisor' && (
        <div className="p-4 border-b border-[var(--c-border)]">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-2">Alert Log</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-lo)]">B-1 heat excursion</span>
              <span className="text-red-400">Sent 06:32</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-lo)]">B-3 gas check</span>
              <span className="text-[var(--text-verified)]">ACK 06:45</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-lo)]">B-2 wire spool</span>
              <span className="text-[var(--text-verified)]">ACK 06:31</span>
            </div>
          </div>
        </div>
      )}

      {isPreWeldScan ? (
        <div className="p-4 border-b border-[var(--c-border)] flex-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-3">Scan Consumables</div>
          <div className="space-y-3">
            {consumables!.map((c, i) => (
              <button
                key={c.id}
                onClick={() => onVerify!(c.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  c.verified
                    ? 'bg-green-500/10 border-green-500/30'
                    : i === 3
                    ? 'bg-yellow-500/5 border-yellow-500/30'
                    : 'bg-[var(--c-raised)] border-[var(--c-border)] hover:bg-[var(--c-elevated)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      c.verified ? 'bg-green-500 text-black' : 'bg-[var(--c-border)] text-[var(--text-lo)]'
                    }`}
                  >
                    {c.verified ? <Check className="w-4 h-4" /> : <span className="text-sm">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${c.verified ? 'text-[var(--text-verified)]' : 'text-[var(--text-hi)]'}`}>
                      {c.name}
                    </div>
                    <div className="text-xs text-[var(--text-dim)]">{c.lot}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {c.verified ? (
                    <span className="text-[10px] text-[var(--text-verified)] flex items-center gap-1">
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

        </div>
      ) : key === 'weldActiveArc' ? (
        <>
          <div className="p-4 border-b border-[var(--c-border)] space-y-3">
            {/* Current Weld */}
            <div className="bg-[var(--c-raised)] border border-yellow-500/30 rounded-lg p-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-[10px] uppercase tracking-wider text-yellow-500 font-semibold">Current Weld</span>
              </div>
              {selectedWeld ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text-hi)]">{selectedWeld.id}</span>
                    <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded font-mono border border-yellow-500/20">
                      {selectedWeld.process}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-md)]">{selectedWeld.jointType}</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-surface)] px-1.5 py-0.5 rounded border border-[var(--c-border)]">
                      {selectedWeld.wps}
                    </span>
                    <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-surface)] px-1.5 py-0.5 rounded border border-[var(--c-border)]">
                      {selectedWeld.duration} min
                    </span>
                    <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-surface)] px-1.5 py-0.5 rounded border border-[var(--c-border)]">
                      {selectedWeld.partNumber}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-dim)]">No weld selected</p>
              )}
            </div>

            {/* Next-up */}
            <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gray-600" />
              <div className="flex items-center gap-1.5 mb-2">
                <ArrowRight className="w-3 h-3 text-[var(--text-lo)]" />
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-lo)] font-semibold">Next-up</span>
              </div>
              {nextWeld ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text-md)]">{nextWeld.id}</span>
                    <span className="text-[10px] text-[var(--text-lo)] bg-[var(--c-elevated)] px-1.5 py-0.5 rounded font-mono border border-[var(--c-border)]">
                      {nextWeld.process}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-lo)]">{nextWeld.jointType}</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-surface)] px-1.5 py-0.5 rounded border border-[var(--c-border)]">
                      {nextWeld.wps}
                    </span>
                    <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-surface)] px-1.5 py-0.5 rounded border border-[var(--c-border)]">
                      {nextWeld.duration} min
                    </span>
                    <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-surface)] px-1.5 py-0.5 rounded border border-[var(--c-border)]">
                      {nextWeld.partNumber}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-dim)]">Queue complete</p>
              )}
            </div>

            {/* Other welds */}
            {otherWelds.length > 0 && (
              <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-3">
                <button
                  onClick={() => setOtherWeldsExpanded(!otherWeldsExpanded)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-semibold">
                    Other welds on this part
                  </span>
                  {otherWeldsExpanded ? (
                    <ChevronUp className="w-3 h-3 text-[var(--text-dim)]" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-[var(--text-dim)]" />
                  )}
                </button>
                {otherWeldsExpanded && (
                  <div className="mt-3 space-y-2">
                    {otherWelds.map((weld) => (
                      <div
                        key={weld.id}
                        className="flex items-center justify-between p-2 bg-[var(--c-surface)] rounded border border-[var(--c-border)]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-[var(--text-lo)] shrink-0">{weld.id}</span>
                          <span className="text-[10px] text-[var(--text-dim)] truncate">{weld.jointType}</span>
                        </div>
                        <span className="text-[10px] text-[var(--text-dim)] bg-[var(--c-elevated)] px-1.5 py-0.5 rounded font-mono border border-[var(--c-border)] shrink-0">
                          {weld.process}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {voiceCommand && (
            <div className="p-4 border-b border-[var(--c-border)] bg-[var(--c-raised)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-verified)]">
                <Check className="w-3 h-3" />
                <span>Understood</span>
              </div>
              <p className="mt-1 text-sm text-[var(--text-hi)] font-mono">{voiceCommand}</p>
            </div>
          )}
        </>
      ) : key === 'reviewAndSign' ? (
        <>
          <div className="p-4 border-b border-[var(--c-border)]">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-3">Inspection</div>
            
            {allLocked ? (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-[var(--text-verified)]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--text-verified)]">Sent to inspection</div>
                  <div className="text-xs text-[var(--text-dim)]">{lockedCount} weld{lockedCount !== 1 ? 's' : ''} locked</div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={onSendToInspection}
                  disabled={pendingInspectionCount === 0}
                  className={`w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors ${
                    pendingInspectionCount > 0
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                      : 'bg-[var(--c-border)] text-[var(--text-dim)] cursor-not-allowed'
                  }`}
                >
                  <ClipboardCheck className="w-6 h-6" />
                  <span className="font-bold text-base">Send to inspection</span>
                  {pendingInspectionCount > 0 && (
                    <span className="text-xs text-yellow-900 font-medium">
                      {pendingInspectionCount} weld{pendingInspectionCount !== 1 ? 's' : ''} pending
                    </span>
                  )}
                </button>
                
                {completedWelds && completedWelds.length === 0 && (
                  <p className="text-xs text-[var(--text-dim)] mt-2 text-center">
                    No completed welds to send
                  </p>
                )}
              </>
            )}
          </div>

          {voiceCommand && (
            <div className="p-4 border-b border-[var(--c-border)] bg-[var(--c-raised)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-verified)]">
                <Check className="w-3 h-3" />
                <span>Understood</span>
              </div>
              <p className="mt-1 text-sm text-[var(--text-hi)] font-mono">{voiceCommand}</p>
            </div>
          )}
        </>
      ) : key === 'taskQueue' && isRecording && queueNextWeld ? (
        <>
          <div className="p-4 border-b border-[var(--c-border)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-lo)] mb-3">
              <span className="text-yellow-500">🎤</span>
              <span className="font-mono">"start {queueNextWeld.id}"</span>
            </div>
            <p className="text-sm text-[var(--text-hi)] font-medium mb-3">
              Start weld {queueNextWeld.id} — {queueNextWeld.partNumber} {queueNextWeld.jointType}?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsRecording(false);
                  onSelectWeld?.(queueNextWeld);
                }}
                className="w-full flex flex-col items-center justify-center gap-1 p-4 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
              >
                <Check className="w-5 h-5 text-[var(--text-hi)]" />
                <span className="text-[var(--text-hi)] font-medium">Yes</span>
                <span className="text-[10px] text-[var(--text-verified)]">Say 'yes' or tap</span>
              </button>
              <button
                onClick={() => setIsRecording(false)}
                className="w-full flex flex-col items-center justify-center gap-1 p-4 bg-[var(--c-border)] hover:bg-[var(--c-hover)] rounded-lg transition-colors"
              >
                <span className="text-[var(--text-hi)] text-lg leading-none">✕</span>
                <span className="text-[var(--text-hi)] font-medium">No</span>
                <span className="text-[10px] text-[var(--text-lo)]">Say 'no' or tap</span>
              </button>
            </div>
          </div>
        </>
      ) : voiceCommand ? (
        <div className="p-4 border-b border-[var(--c-border)] bg-[var(--c-raised)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-verified)]">
            <Check className="w-3 h-3" />
            <span>Understood</span>
          </div>
          <p className="mt-1 text-sm text-[var(--text-hi)] font-mono">{voiceCommand}</p>
        </div>
      ) : null}

      {!isPreWeldScan && <div className="flex-1" />}
    </aside>
  );
}
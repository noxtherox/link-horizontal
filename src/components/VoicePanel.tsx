import { Check, Scan, ChevronDown, ChevronUp, ClipboardCheck, Users } from 'lucide-react';
import { ViewMode, WelderStep, Weld, Part, Consumable, CompletedWeld, PrerequisiteProcess } from '@/types/weldcloud';
import { AVAILABILITY_CODES, AvailabilityCode } from '@/data/mockData';
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
  weldPrerequisites?: PrerequisiteProcess[];
  onTogglePrerequisite?: (id: string) => void;
  availability?: AvailabilityCode;
  onSetAvailability?: (code: AvailabilityCode) => void;
}

export function VoicePanel({ viewMode, step, weldActiveMode = 'setup', isRecording, setIsRecording, voiceCommand, selectedWeld, nextWeld, parts, consumables, completedWelds, onVerify, onSendToInspection, onSelectWeld, weldPrerequisites, onTogglePrerequisite, availability, onSetAvailability }: VoicePanelProps) {
  const [consumablesExpanded, setConsumablesExpanded] = useState(false);

  let key: string;
  if (viewMode === 'supervisor') {
    key = 'supervisor';
  } else if (step === 'weldActive') {
    key = weldActiveMode === 'setup' ? 'weldActiveSetup' : 'weldActiveArc';
  } else {
    key = step;
  }

  const isWeldActiveStep = key === 'weldActiveSetup' || key === 'weldActiveArc';
  const isPreWeldScan = key === 'weldActiveSetup' && consumables && onVerify;
  const isArcConsumablesSummary = key === 'weldActiveArc' && consumables && consumables.length > 0;
  const hasPrerequisites = isWeldActiveStep && weldPrerequisites && weldPrerequisites.length > 0;

  // Next weld in the task queue (first weld of the first part) — used for the
  // press-to-confirm card that appears after the mic is pressed.
  const queueNextWeld = parts[0]?.welds[0] ?? null;

  const pendingInspectionCount = completedWelds?.filter(c => !c.locked).length || 0;
  const lockedCount = completedWelds?.filter(c => c.locked).length || 0;
  const totalCompleted = completedWelds?.length || 0;
  const allLocked = totalCompleted > 0 && lockedCount === totalCompleted;

  return (
    <aside className="w-full lg:w-72 bg-[var(--c-surface)] border-t lg:border-l lg:border-t-0 border-[var(--c-border)] flex flex-col shrink-0">
      {viewMode === 'supervisor' && (
        <div className="p-4 border-b border-[var(--c-border)]">
          <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-2">Alert Log</div>
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

      {hasPrerequisites && (
        <div className="p-4 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-1.5 mb-3">
            <Users className="w-3 h-3 text-yellow-500" />
            <span className="text-xs uppercase tracking-wider text-yellow-500 font-semibold">Waiting on other welders</span>
          </div>
          <div className="space-y-3">
            {weldPrerequisites!.map((p, i) => {
              const isDone = p.status === 'done';
              return (
                <button
                  key={p.id}
                  onClick={() => !isDone && onTogglePrerequisite?.(p.id)}
                  disabled={isDone}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isDone
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-[var(--c-raised)] border-[var(--c-border)] hover:bg-[var(--c-elevated)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-green-500 text-black' : 'bg-[var(--c-border)] text-[var(--text-lo)]'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : <span className="text-sm">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isDone ? 'text-[var(--text-verified)]' : 'text-[var(--text-hi)]'}`}>
                        {p.label}
                      </div>
                      <div className="text-xs text-[var(--text-dim)]">{p.welder} · {p.process}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {isDone ? (
                      <span className="text-xs text-[var(--text-verified)] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-500 flex items-center gap-1">
                        Tap to mark done
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isWeldActiveStep ? (
        <div className="flex-1 overflow-y-auto">
          {isPreWeldScan && (
            <div className="p-4 border-b border-[var(--c-border)]">
              <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-3">Scan Consumables</div>
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
                        <span className="text-xs text-[var(--text-verified)] flex items-center gap-1">
                          <Scan className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-500 flex items-center gap-1">
                          <Scan className="w-3 h-3" /> Tap to scan
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isArcConsumablesSummary && (
            <div className="p-4 border-b border-[var(--c-border)]">
              <div className="bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg p-3">
                <button
                  onClick={() => setConsumablesExpanded(!consumablesExpanded)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-xs uppercase tracking-wider text-[var(--text-dim)] font-semibold">
                    Consumables
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-verified)] flex items-center gap-1">
                      <Check className="w-3 h-3" /> {consumables!.length} verified
                    </span>
                    {consumablesExpanded ? (
                      <ChevronUp className="w-3 h-3 text-[var(--text-dim)]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[var(--text-dim)]" />
                    )}
                  </div>
                </button>
                {consumablesExpanded && (
                  <div className="mt-3 space-y-2">
                    {consumables!.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 bg-[var(--c-surface)] rounded border border-[var(--c-border)]"
                      >
                        <span className="text-xs font-medium text-[var(--text-hi)] truncate">{c.name}</span>
                        <span className="text-xs text-[var(--text-dim)] font-mono shrink-0">{c.lot}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {key === 'weldActiveArc' && availability && onSetAvailability && (
            <div className="p-4 border-b border-[var(--c-border)]">
              <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] font-semibold mb-3">
                Machine Status
              </div>
              <div className="grid grid-cols-1 gap-2">
                {AVAILABILITY_CODES.map(({ code, label, color }) => {
                  const isSelected = availability === code;
                  return (
                    <button
                      key={code}
                      onClick={() => onSetAvailability(code)}
                      style={isSelected ? { borderColor: color, backgroundColor: `${color}18` } : {}}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-current'
                          : 'bg-[var(--c-raised)] border-[var(--c-border)] hover:bg-[var(--c-elevated)]'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-bold text-[var(--text-hi)] flex-1 text-left">{label}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0" style={{ color }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {key === 'weldActiveArc' && voiceCommand && (
            <div className="p-4 border-b border-[var(--c-border)] bg-[var(--c-raised)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-verified)]">
                <Check className="w-3 h-3" />
                <span>Understood</span>
              </div>
              <p className="mt-1 text-sm text-[var(--text-hi)] font-mono">{voiceCommand}</p>
            </div>
          )}
        </div>
      ) : key === 'reviewAndSign' ? (
        <>
          <div className="p-4 border-b border-[var(--c-border)]">
            <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-3">Inspection</div>
            
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
      ) : key === 'taskQueue' ? (
        <>
          {availability && onSetAvailability && (
            <div className="p-4 border-b border-[var(--c-border)]">
              <div className="text-xs uppercase tracking-wider text-[var(--text-dim)] mb-3">Station Availability</div>
              <div className="space-y-2">
                {AVAILABILITY_CODES.map(({ code, label, color }) => {
                  const isSelected = availability === code;
                  return (
                    <button
                      key={code}
                      onClick={() => onSetAvailability(code)}
                      style={isSelected ? { borderColor: color, backgroundColor: `${color}18` } : {}}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-current'
                          : 'bg-[var(--c-raised)] border-[var(--c-border)] hover:bg-[var(--c-elevated)]'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-bold text-[var(--text-hi)] w-4 shrink-0">{code}</span>
                      <span className="text-sm text-[var(--text-lo)] flex-1 text-left truncate">{label}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0" style={{ color }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isRecording && queueNextWeld && (
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
                  <span className="text-xs text-[var(--text-verified)]">Say 'yes' or tap</span>
                </button>
                <button
                  onClick={() => setIsRecording(false)}
                  className="w-full flex flex-col items-center justify-center gap-1 p-4 bg-[var(--c-border)] hover:bg-[var(--c-hover)] rounded-lg transition-colors"
                >
                  <span className="text-[var(--text-hi)] text-lg leading-none">✕</span>
                  <span className="text-[var(--text-hi)] font-medium">No</span>
                  <span className="text-xs text-[var(--text-lo)]">Say 'no' or tap</span>
                </button>
              </div>
            </div>
          )}

          {!isRecording && voiceCommand && (
            <div className="p-4 border-b border-[var(--c-border)] bg-[var(--c-raised)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-verified)]">
                <Check className="w-3 h-3" />
                <span>Understood</span>
              </div>
              <p className="mt-1 text-sm text-[var(--text-hi)] font-mono">{voiceCommand}</p>
            </div>
          )}
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

      {!isWeldActiveStep && <div className="flex-1" />}
    </aside>
  );
}
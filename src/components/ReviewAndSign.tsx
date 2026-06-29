import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, Timer, BadgeCheck, CircleDashed, Package, Lock, Pencil, Check, AlertTriangle, Play } from 'lucide-react';
import { Weld, CompletedWeld, Arc, Part, Consumable } from '@/types/weldcloud';
import { initialParts } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface ReviewAndSignProps {
  onSign: () => void;
  arcTime: number;
  arcs: Arc[];
  selectedWeld: Weld | null;
  completedWelds: CompletedWeld[];
  parts: Part[];
  onSelectWeld: (weld: Weld) => void;
  consumables: Consumable[];
  onUpdateConsumable: (id: string, updates: Partial<Consumable>) => void;
  onUpdateCompletedWeldConsumable: (weldId: string, consumableId: string, updates: Partial<Consumable>) => void;
}

export function ReviewAndSign({
  onSign,
  arcTime,
  arcs,
  selectedWeld,
  completedWelds,
  parts,
  onSelectWeld,
  consumables,
  onUpdateConsumable,
  onUpdateCompletedWeldConsumable,
}: ReviewAndSignProps) {
  const [expandedWeldId, setExpandedWeldId] = useState<string | null>(null);
  const [editingConsumableId, setEditingConsumableId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLot, setEditLot] = useState('');
  const [editingWeldConsumable, setEditingWeldConsumable] = useState<{ weldId: string; consumableId: string } | null>(null);
  const [editWeldConsumableName, setEditWeldConsumableName] = useState('');
  const [editWeldConsumableLot, setEditWeldConsumableLot] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalArcDuration = arcs.reduce((sum, a) => sum + a.duration, 0) || arcTime;
  const avgHeat = arcs.length > 0 
    ? (arcs.reduce((sum, a) => sum + a.avgHeat, 0) / arcs.length).toFixed(2) 
    : '1.02';
  const avgConformance = arcs.length > 0
    ? Math.floor(arcs.reduce((sum, a) => sum + a.wpsConformance, 0) / arcs.length)
    : 87;
  const allPasses = arcs.length > 0
    ? [...new Set(arcs.flatMap(a => a.passes))].join(' · ')
    : 'Root · Fill · Cap';

  const toggleWeld = (weldId: string) => {
    setExpandedWeldId(current => current === weldId ? null : weldId);
  };

  const hasActiveWeld = selectedWeld !== null && arcs.length > 0;

  // Build part groups — each part shows completed + incomplete welds together
  const partGroups = initialParts
    .map(partInfo => {
      const partCompleted = completedWelds.filter(cw => cw.weld.partNumber === partInfo.id);
      const remainingPart = parts.find(p => p.id === partInfo.id);
      const partIncomplete = remainingPart?.welds.filter(w => w.id !== selectedWeld?.id) || [];
      return { partInfo, completed: partCompleted, incomplete: partIncomplete };
    })
    .filter(pg => pg.completed.length > 0 || pg.incomplete.length > 0);

  const startEditConsumable = (c: Consumable) => {
    setEditingConsumableId(c.id);
    setEditName(c.name);
    setEditLot(c.lot);
  };

  const saveConsumableEdit = (id: string) => {
    onUpdateConsumable(id, { name: editName, lot: editLot });
    setEditingConsumableId(null);
  };

  const startEditWeldConsumable = (weldId: string, c: Consumable) => {
    setEditingWeldConsumable({ weldId, consumableId: c.id });
    setEditWeldConsumableName(c.name);
    setEditWeldConsumableLot(c.lot);
  };

  const saveWeldConsumableEdit = (weldId: string, consumableId: string) => {
    onUpdateCompletedWeldConsumable(weldId, consumableId, { name: editWeldConsumableName, lot: editWeldConsumableLot });
    setEditingWeldConsumable(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">
          {selectedWeld?.id || 'Review'} · {hasActiveWeld ? 'Review and Sign' : 'Completed Welds'}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-hi)]">
          {hasActiveWeld ? 'Review weld — sign to close' : 'Review completed welds'}
        </h1>
      </div>

      {/* Arc Summary — only when actively reviewing a weld */}
      {hasActiveWeld && (
        <div className="mb-6">
          <div className="p-4 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-3">Arc Summary</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Arc time</div>
                <div className="text-xl font-bold text-[var(--text-hi)] font-mono">{formatTime(totalArcDuration)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Arcs completed</div>
                <div className="text-xl font-bold text-[var(--text-hi)]">{arcs.length || 1}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Avg heat</div>
                <div className="text-xl font-bold text-yellow-500">{avgHeat} <span className="text-sm text-[var(--text-dim)] font-normal">kJ/mm</span></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">WPS conformance</div>
                <div className="text-xl font-bold text-[var(--text-hi)]">{avgConformance}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Passes</div>
                <div className="text-xl font-bold text-[var(--text-hi)]">{allPasses}</div>
              </div>
            </div>

            {/* Current weld arcs detail */}
            {arcs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--c-border)] space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-2">Arc breakdown</div>
                {arcs.map((arc, i) => (
                  <div key={arc.id} className="flex items-center gap-3 text-xs">
                    <span className="text-[var(--text-dim)] font-medium w-12">Arc {i + 1}</span>
                    <Timer className="w-3 h-3 text-[var(--text-dim)]" />
                    <span className="text-[var(--text-hi)] font-mono">{formatTime(arc.duration)}</span>
                    <span className="text-yellow-500">{arc.avgHeat} kJ/mm</span>
                    <span className="text-[var(--text-lo)]">{arc.wpsConformance}%</span>
                    <span className="text-[var(--text-dim)] text-[10px]">{arc.passes.join(' · ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active weld consumables — editable in review */}
      {hasActiveWeld && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Consumables</div>
            <span className="text-xs text-[var(--text-dim)]">Tap to edit</span>
          </div>
          <div className="space-y-2">
            {consumables.map((c) => (
              <div key={c.id} className="p-3 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg">
                {editingConsumableId === c.id ? (
                  <div className="space-y-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] rounded px-3 py-2 text-sm text-[var(--text-hi)] focus:outline-none focus:border-yellow-500"
                      placeholder="Name"
                    />
                    <input
                      value={editLot}
                      onChange={(e) => setEditLot(e.target.value)}
                      className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] rounded px-3 py-2 text-sm text-[var(--text-hi)] focus:outline-none focus:border-yellow-500"
                      placeholder="Lot"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveConsumableEdit(c.id)}
                        className="flex-1 p-2 bg-green-600 hover:bg-green-500 rounded text-[var(--text-hi)] text-xs font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingConsumableId(null)}
                        className="flex-1 p-2 bg-[var(--c-border)] hover:bg-[var(--c-hover)] rounded text-[var(--text-hi)] text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        c.verified ? 'bg-green-500/10' : 'bg-yellow-500/10'
                      }`}>
                        {c.verified ? (
                          <Check className="w-4 h-4 text-[var(--text-verified)]" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--text-hi)]">{c.name}</div>
                        <div className="text-xs text-[var(--text-dim)]">{c.lot}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded border ${
                        c.verified 
                          ? 'text-[var(--text-verified)] bg-green-500/10 border-green-500/20' 
                          : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                        {c.verified ? 'Verified' : 'Not verified'}
                      </span>
                      <button
                        onClick={() => startEditConsumable(c)}
                        className="p-2 hover:bg-[var(--c-border)] rounded transition-colors"
                      >
                        <Pencil className="w-3 h-3 text-[var(--text-lo)]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parts — grouped with completed and incomplete welds */}
      {partGroups.map(({ partInfo, completed, incomplete }) => {
        const isAllCompleted = incomplete.length === 0 && completed.length > 0;
        const totalIncompleteDuration = incomplete.reduce((sum, w) => sum + w.duration, 0);
        const totalCompletedArcTime = completed.reduce(
          (sum, cw) => sum + cw.arcs.reduce((a, arc) => a + arc.duration, 0),
          0
        );
        const lockedCount = completed.filter(cw => cw.locked).length;

        return (
          <div key={partInfo.id} className="mb-6">
            {/* Part header */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[var(--c-border)]">
              <Package className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-hi)] tracking-tight">
                {partInfo.id}
              </h2>
              <span className="text-sm text-[var(--text-dim)]">
                {partInfo.name}
              </span>
              {isAllCompleted && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--text-verified)] bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                  <Lock className="w-3 h-3" />
                  {lockedCount} weld{lockedCount !== 1 ? 's' : ''} locked
                </span>
              )}
            </div>

            {/* Completed welds */}
            {completed.length > 0 && (
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-2">
                  Completed — {completed.length} weld{completed.length !== 1 ? 's' : ''}
                  {totalCompletedArcTime > 0 && ` · ${formatTime(totalCompletedArcTime)} arc time`}
                </div>
                <div className="space-y-2">
                  {completed.map((cw, idx) => {
                    const weldId = `${cw.weld.id}-${idx}`;
                    const isExpanded = expandedWeldId === weldId;
                    const totalDuration = cw.arcs.reduce((sum, a) => sum + a.duration, 0);
                    return (
                      <button
                        key={weldId}
                        onClick={() => toggleWeld(weldId)}
                        className={`w-full text-left flex flex-col p-4 bg-[var(--c-raised)] border rounded-lg hover:bg-[var(--c-elevated)] transition-colors group ${
                          cw.locked ? 'border-green-500/20 opacity-70' : 'border-[var(--c-border)]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              cw.locked ? 'bg-green-500/10' : 'bg-green-500/10'
                            }`}>
                              {cw.locked ? (
                                <Lock className="w-4 h-4 text-[var(--text-verified)]" />
                              ) : (
                                <BadgeCheck className="w-4 h-4 text-[var(--text-verified)]" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-[var(--text-hi)]">{cw.weld.id}</span>
                                <span className="text-xs text-[var(--text-lo)]">{cw.weld.jointType}</span>
                                <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono border border-yellow-500/20">
                                  {cw.weld.process}
                                </span>
                                {cw.locked && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-verified)] bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                    <Lock className="w-3 h-3" />
                                    Locked
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-[var(--text-dim)]">{cw.weld.partNumber}</span>
                                <span className="text-[10px] text-[var(--text-dim)]">
                                  {cw.arcs.length} arc{cw.arcs.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="text-sm text-[var(--text-hi)] font-mono">{formatTime(totalDuration)}</div>
                              <div className="text-[10px] text-[var(--text-dim)]">{cw.completedAt}</div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[var(--text-dim)]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[var(--text-dim)]" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-[var(--c-border)] w-full">
                            {/* Arc Sessions */}
                            <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-3">Arc Sessions</div>
                            <div className="space-y-2 mb-4">
                              {cw.arcs.map((arc, i) => (
                                <div
                                  key={arc.id}
                                  className="flex items-center gap-3 p-3 bg-[var(--c-surface)] rounded-lg border border-[var(--c-border)]"
                                >
                                  <span className="text-xs font-bold text-[var(--text-dim)] w-14 shrink-0">
                                    Arc {i + 1}
                                  </span>
                                  <div className="flex items-center gap-2 text-xs text-[var(--text-lo)] shrink-0">
                                    <Timer className="w-3 h-3" />
                                    <span className="text-[var(--text-hi)] font-mono">{formatTime(arc.duration)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs shrink-0">
                                    <span className="text-yellow-500">{arc.avgHeat} kJ/mm</span>
                                    <span className="text-[var(--text-lo)]">{arc.wpsConformance}%</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-[var(--text-dim)] ml-auto">
                                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Passes:</span>
                                    <span className="text-[var(--text-lo)]">{arc.passes.join(' · ')}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Consumables for this weld */}
                            {(cw.consumables || []).length > 0 && (
                              <div className="mt-4 pt-4 border-t border-[var(--c-border)]">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Consumables</div>
                                  <span className="text-xs text-[var(--text-dim)]">Tap to edit</span>
                                </div>
                                <div className="space-y-2">
                                  {(cw.consumables || []).map((c) => {
                                    const isEditing = editingWeldConsumable?.weldId === cw.weld.id && editingWeldConsumable?.consumableId === c.id;
                                    return (
                                      <div key={c.id} className="p-3 bg-[var(--c-surface)] rounded border border-[var(--c-border)]">
                                        {isEditing ? (
                                          <div className="space-y-2">
                                            <input
                                              value={editWeldConsumableName}
                                              onChange={(e) => setEditWeldConsumableName(e.target.value)}
                                              className="w-full bg-[var(--c-raised)] border border-[var(--c-border)] rounded px-3 py-2 text-sm text-[var(--text-hi)] focus:outline-none focus:border-yellow-500"
                                              placeholder="Name"
                                            />
                                            <input
                                              value={editWeldConsumableLot}
                                              onChange={(e) => setEditWeldConsumableLot(e.target.value)}
                                              className="w-full bg-[var(--c-raised)] border border-[var(--c-border)] rounded px-3 py-2 text-sm text-[var(--text-hi)] focus:outline-none focus:border-yellow-500"
                                              placeholder="Lot"
                                            />
                                            <div className="flex gap-2">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  saveWeldConsumableEdit(cw.weld.id, c.id);
                                                }}
                                                className="flex-1 p-2 bg-green-600 hover:bg-green-500 rounded text-[var(--text-hi)] text-xs font-medium transition-colors"
                                              >
                                                Save
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setEditingWeldConsumable(null);
                                                }}
                                                className="flex-1 p-2 bg-[var(--c-border)] hover:bg-[var(--c-hover)] rounded text-[var(--text-hi)] text-xs font-medium transition-colors"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                                c.verified ? 'bg-green-500/10' : 'bg-yellow-500/10'
                                              }`}>
                                                {c.verified ? (
                                                  <Check className="w-3.5 h-3.5 text-[var(--text-verified)]" />
                                                ) : (
                                                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                                                )}
                                              </div>
                                              <div>
                                                <div className="text-sm font-medium text-[var(--text-hi)]">{c.name}</div>
                                                <div className="text-xs text-[var(--text-dim)]">{c.lot}</div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                                c.verified 
                                                  ? 'text-[var(--text-verified)] bg-green-500/10 border-green-500/20' 
                                                  : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                                              }`}>
                                                {c.verified ? 'Verified' : 'Not verified'}
                                              </span>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  startEditWeldConsumable(cw.weld.id, c);
                                                }}
                                                className="p-2 hover:bg-[var(--c-border)] rounded transition-colors"
                                              >
                                                <Pencil className="w-3 h-3 text-[var(--text-lo)]" />
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Incomplete welds */}
            {incomplete.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                    Incomplete — {incomplete.length} remaining · {totalIncompleteDuration} min
                  </div>
                  <button
                    onClick={() => onSelectWeld(incomplete[0])}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-black bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Open part
                  </button>
                </div>
                <div className="space-y-2">
                  {incomplete.map((weld) => (
                    <button
                      key={weld.id}
                      onClick={() => onSelectWeld(weld)}
                      className="w-full text-left flex items-center gap-3 p-4 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg hover:bg-[var(--c-elevated)] hover:border-yellow-500/30 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                        <CircleDashed className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[var(--text-hi)]">{weld.id}</span>
                          <span className="text-xs text-[var(--text-lo)]">{weld.jointType}</span>
                          <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono border border-yellow-500/20">
                            {weld.process}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[var(--text-dim)]">{weld.partNumber}</span>
                          <span className="text-[10px] text-[var(--text-dim)]">{weld.duration} min</span>
                          {weld.priority && (
                            <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              Priority
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-dim)] group-hover:text-yellow-500 uppercase tracking-wider shrink-0 transition-colors">
                        Open
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Sign to Close — only when actively reviewing a weld */}
      {hasActiveWeld && (
        <div className="max-w-3xl">
          <div className="p-4 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg mb-4">
            <div className="flex items-center gap-2 text-xs text-[var(--text-lo)] mb-3">
              <span className="text-yellow-500">🎤</span>
              <span className="font-mono">"confirm complete"</span>
            </div>

            <div className="bg-[var(--c-surface)] rounded-lg p-4">
              <p className="text-sm text-[var(--text-hi)] font-medium mb-3">
                Sign {selectedWeld?.id || 'weld'} and route to Inspector A. Lehmann?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onSign}
                  className="flex flex-col items-center justify-center gap-1 p-4 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"
                >
                  <span className="text-[var(--text-hi)] text-lg">✓</span>
                  <span className="text-[var(--text-hi)] font-medium">Yes</span>
                  <span className="text-[10px] text-yellow-200">"yes sign" or re-tap badge — irreversible</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1 p-4 bg-[var(--c-border)] hover:bg-[var(--c-hover)] rounded-lg transition-colors">
                  <span className="text-[var(--text-hi)] text-lg">✕</span>
                  <span className="text-[var(--text-hi)] font-medium">No</span>
                  <span className="text-[10px] text-[var(--text-lo)]">"no" to go back</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg">
            <p className="text-xs text-[var(--text-dim)]">
              After sign: next weld will auto-load or return to task queue
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
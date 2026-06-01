import { useState } from 'react';
import { ChevronDown, ChevronUp, Timer, BadgeCheck, CircleDashed } from 'lucide-react';
import { Weld, CompletedWeld, Arc, Part } from '@/types/weldcloud';

interface ReviewAndSignProps {
  onSign: () => void;
  arcTime: number;
  arcs: Arc[];
  selectedWeld: Weld | null;
  completedWelds: CompletedWeld[];
  parts: Part[];
}

export function ReviewAndSign({
  onSign,
  arcTime,
  arcs,
  selectedWeld,
  completedWelds,
  parts,
}: ReviewAndSignProps) {
  const [expandedWeldId, setExpandedWeldId] = useState<string | null>(null);

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

  // Get incomplete welds from remaining parts
  const incompleteWelds: Weld[] = [];
  parts.forEach(part => {
    part.welds.forEach(weld => {
      if (weld.id !== selectedWeld?.id) {
        incompleteWelds.push(weld);
      }
    });
  });

  const totalIncomplete = incompleteWelds.length;
  const totalIncompleteDuration = incompleteWelds.reduce((sum, w) => sum + w.duration, 0);

  const hasActiveWeld = selectedWeld !== null && arcs.length > 0;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          {selectedWeld?.id || 'Review'} · {hasActiveWeld ? 'Review and Sign' : 'Completed Welds'}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {hasActiveWeld ? 'Review weld — sign to close' : 'Review completed welds'}
        </h1>
      </div>

      {/* Arc Summary — only when actively reviewing a weld */}
      {hasActiveWeld && (
        <div className="mb-6">
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Arc Summary</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Arc time</div>
                <div className="text-xl font-bold text-white font-mono">{formatTime(totalArcDuration)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Arcs completed</div>
                <div className="text-xl font-bold text-white">{arcs.length || 1}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Avg heat</div>
                <div className="text-xl font-bold text-yellow-500">{avgHeat} <span className="text-sm text-gray-500 font-normal">kJ/mm</span></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">WPS conformance</div>
                <div className="text-xl font-bold text-white">{avgConformance}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Passes</div>
                <div className="text-xl font-bold text-white">{allPasses}</div>
              </div>
            </div>

            {/* Current weld arcs detail */}
            {arcs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Arc breakdown</div>
                {arcs.map((arc, i) => (
                  <div key={arc.id} className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500 font-medium w-12">Arc {i + 1}</span>
                    <Timer className="w-3 h-3 text-gray-500" />
                    <span className="text-white font-mono">{formatTime(arc.duration)}</span>
                    <span className="text-yellow-500">{arc.avgHeat} kJ/mm</span>
                    <span className="text-gray-400">{arc.wpsConformance}%</span>
                    <span className="text-gray-500 text-[10px]">{arc.passes.join(' · ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Welds Review */}
      {completedWelds.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
            Completed Welds — tap to review arcs
          </div>
          <div className="space-y-2">
            {completedWelds.map((cw, idx) => {
              const weldId = `${cw.weld.id}-${idx}`;
              const isExpanded = expandedWeldId === weldId;
              const totalDuration = cw.arcs.reduce((sum, a) => sum + a.duration, 0);
              return (
                <button
                  key={weldId}
                  onClick={() => toggleWeld(weldId)}
                  className="w-full text-left p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:bg-[#1f1f1f] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <BadgeCheck className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{cw.weld.id}</span>
                          <span className="text-xs text-gray-400">{cw.weld.jointType}</span>
                          <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono border border-yellow-500/20">
                            {cw.weld.process}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{cw.weld.partNumber}</span>
                          <span className="text-[10px] text-gray-500">
                            {cw.arcs.length} arc{cw.arcs.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm text-white font-mono">{formatTime(totalDuration)}</div>
                        <div className="text-[10px] text-gray-500">{cw.completedAt}</div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Arc Sessions</div>
                      <div className="space-y-2">
                        {cw.arcs.map((arc, i) => (
                          <div
                            key={arc.id}
                            className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-[#2a2a2a]"
                          >
                            <span className="text-xs font-bold text-gray-500 w-14 shrink-0">
                              Arc {i + 1}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                              <Timer className="w-3 h-3" />
                              <span className="text-white font-mono">{formatTime(arc.duration)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs shrink-0">
                              <span className="text-yellow-500">{arc.avgHeat} kJ/mm</span>
                              <span className="text-gray-400">{arc.wpsConformance}%</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                              <span className="text-[10px] uppercase tracking-wider text-gray-600">Passes:</span>
                              <span className="text-gray-400">{arc.passes.join(' · ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Incomplete Welds */}
      {totalIncomplete > 0 && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
            Incomplete Welds — {totalIncomplete} remaining · {totalIncompleteDuration} min
          </div>
          <div className="space-y-2">
            {incompleteWelds.map((weld) => (
              <div
                key={weld.id}
                className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <CircleDashed className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{weld.id}</span>
                    <span className="text-xs text-gray-400">{weld.jointType}</span>
                    <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono border border-yellow-500/20">
                      {weld.process}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{weld.partNumber}</span>
                    <span className="text-[10px] text-gray-500">{weld.duration} min</span>
                    {weld.priority && (
                      <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign to Close — only when actively reviewing a weld */}
      {hasActiveWeld && (
        <div className="max-w-3xl">
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <span className="text-yellow-500">🎤</span>
              <span className="font-mono">"confirm complete"</span>
            </div>

            <div className="bg-[#141414] rounded-lg p-4">
              <p className="text-sm text-white font-medium mb-3">
                Sign {selectedWeld?.id || 'weld'} and route to Inspector A. Lehmann?
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
              After sign: next weld will auto-load or return to task queue
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
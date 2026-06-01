import { useState } from 'react';
import { Check, AlertTriangle, Save, FileText, ChevronDown, ChevronUp, Timer, BadgeCheck } from 'lucide-react';
import { Weld, CompletedWeld, Arc } from '@/types/weldcloud';

interface ReviewAndSignProps {
  onSign: () => void;
  arcTime: number;
  arcs: Arc[];
  deviationText: string;
  setDeviationText: (t: string) => void;
  onSaveDeviation: () => void;
  deviations: string[];
  selectedWeld: Weld | null;
  completedWelds: CompletedWeld[];
}

export function ReviewAndSign({
  onSign,
  arcTime,
  arcs,
  deviationText,
  setDeviationText,
  onSaveDeviation,
  deviations,
  selectedWeld,
  completedWelds,
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

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          {selectedWeld?.id || '—'} · Review and Sign
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Review weld — sign to close</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Arc Summary */}
        <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Arc Summary</div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm border-b border-[#2a2a2a] pb-2">
              <span className="text-gray-400">Arc time</span>
              <span className="text-white font-medium">{formatTime(totalArcDuration)}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-[#2a2a2a] pb-2">
              <span className="text-gray-400">Arcs completed</span>
              <span className="text-white font-medium">{arcs.length || 1}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-[#2a2a2a] pb-2">
              <span className="text-gray-400">Avg heat</span>
              <span className="text-yellow-500 font-medium">{avgHeat} kJ/mm</span>
            </div>
            <div className="flex justify-between text-sm border-b border-[#2a2a2a] pb-2">
              <span className="text-gray-400">WPS conformance</span>
              <span className="text-white font-medium">{avgConformance}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Passes</span>
              <span className="text-white font-medium">{allPasses}</span>
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

        {/* Open Items */}
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
            {deviations.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-blue-400">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      {/* Add Deviation Note */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Add Deviation Note</div>
        <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="text-yellow-500">🎤</span>
            <span className="font-mono">"deviation — heat input high, travel speed dropped on root"</span>
          </div>

          <textarea
            value={deviationText}
            onChange={(e) => setDeviationText(e.target.value)}
            placeholder="Describe any deviation observed during welding..."
            className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 resize-none mb-3"
            rows={3}
          />

          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-xs text-green-400">
              <Check className="w-3 h-3" />
              <span>Parameter auto-attached: heat input {avgHeat} kJ/mm at {formatTime(totalArcDuration)}</span>
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

          <button
            onClick={onSaveDeviation}
            disabled={!deviationText.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              deviationText.trim()
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Save deviation note
          </button>
        </div>
      </div>

      {/* Sign to Close */}
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
    </div>
  );
}
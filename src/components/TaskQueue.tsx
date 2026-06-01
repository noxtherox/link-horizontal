import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, Play, BadgeCheck } from 'lucide-react';
import { Part, Weld } from '@/types/weldcloud';
import { Badge } from '@/components/ui/badge';

interface TaskQueueProps {
  parts: Part[];
  onSelectWeld: (weld: Weld) => void;
}

export function TaskQueue({ parts, onSelectWeld }: TaskQueueProps) {
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);

  const totalWelds = parts.reduce((sum, part) => sum + part.welds.length, 0);
  const nextWeld = parts[0]?.welds[0];

  const togglePart = (e: React.MouseEvent, partId: string) => {
    e.stopPropagation();
    setExpandedPartId((current) => (current === partId ? null : partId));
  };

  const startPart = (part: Part) => {
    if (part.welds.length > 0) {
      onSelectWeld(part.welds[0]);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          M. Costa · Welder · Queue assigned by K. Park · 06:30
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {parts.length} parts — {totalWelds} welds ready
        </h1>
      </div>

      <div className="space-y-4">
        {parts.map((part, partIndex) => {
          const isExpanded = expandedPartId === part.id;
          const hasPriority = part.welds.some((w) => w.priority);
          const totalDuration = part.welds.reduce((sum, w) => sum + w.duration, 0);

          return (
            <div
              key={part.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                        partIndex === 0
                          ? 'bg-yellow-500 text-black'
                          : 'bg-[#2a2a2a] text-gray-400'
                      }`}
                    >
                      {partIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-base">{part.id}</span>
                        <span className="text-sm text-gray-400">· {part.name}</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-0.5">
                        {part.description}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                          {totalDuration} min
                        </span>
                        {hasPriority && (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                            Priority
                          </Badge>
                        )}
                        {partIndex === 0 && (
                          <span className="text-xs font-medium text-yellow-500 uppercase tracking-wider">
                            Next up
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => startPart(part)}
                    className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      partIndex === 0
                        ? 'bg-yellow-500 hover:bg-yellow-400 hover:scale-105 shadow-lg shadow-yellow-500/20'
                        : 'bg-[#2a2a2a] hover:bg-[#333333]'
                    }`}
                  >
                    <Play className={`w-6 h-6 ${partIndex === 0 ? 'text-black' : 'text-white'} ml-0.5`} />
                  </button>
                </div>

                <button
                  onClick={(e) => togglePart(e, part.id)}
                  className="w-full mt-4 pt-3 border-t border-[#2a2a2a]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {part.welds.map((weld) => (
                        <span
                          key={weld.id}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono border ${
                            weld.priority
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-[#1f1f1f] text-gray-400 border-[#2a2a2a]'
                          }`}
                        >
                          {weld.id}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0 ml-2">
                      <span>{isExpanded ? 'Hide welds' : 'View welds'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-[#2a2a2a] px-4 pb-4 pt-3 bg-[#141414]/50">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
                    Welds assigned — tap one to start
                  </div>
                  <div className="space-y-2">
                    {part.welds.map((weld, weldIndex) => {
                      const isFirstWeld = partIndex === 0 && weldIndex === 0;
                      return (
                        <button
                          key={weld.id}
                          onClick={() => onSelectWeld(weld)}
                          className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors group ${
                            isFirstWeld
                              ? 'bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10'
                              : 'bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#1f1f1f]'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isFirstWeld
                                ? 'bg-yellow-500 text-black'
                                : 'bg-[#2a2a2a] text-gray-400 group-hover:text-white'
                            }`}
                          >
                            {weldIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-white">
                                {weld.id}
                              </span>
                              <span className="text-xs text-gray-500">
                                {weld.jointType}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                                {weld.wps}
                              </span>
                              <span className="text-[10px] text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                                {weld.duration} min
                              </span>
                              <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono">
                                {weld.process}
                              </span>
                              {weld.priority && (
                                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                                  Priority
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isFirstWeld && (
                            <span className="text-[10px] font-medium text-yellow-500 uppercase tracking-wider shrink-0">
                              Next
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {nextWeld && (
        <div className="mt-6 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="text-yellow-500">🎤</span>
            <span className="font-mono">
              "start {nextWeld.id}"
            </span>
          </div>
          <div className="bg-[#141414] rounded-lg p-4">
            <p className="text-sm text-white font-medium mb-3">
              Start weld {nextWeld.id} — {nextWeld.partNumber} {nextWeld.jointType}?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSelectWeld(nextWeld)}
                className="flex flex-col items-center justify-center gap-1 p-4 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
              >
                <BadgeCheck className="w-5 h-5 text-white" />
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
      )}
    </div>
  );
}
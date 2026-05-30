import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, BadgeCheck } from 'lucide-react';
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

  const togglePart = (partId: string) => {
    setExpandedPartId((current) => (current === partId ? null : partId));
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

      <div className="space-y-3">
        {parts.map((part, partIndex) => {
          const isExpanded = expandedPartId === part.id;
          const hasPriority = part.welds.some((w) => w.priority);
          const totalDuration = part.welds.reduce((sum, w) => sum + w.duration, 0);

          return (
            <div
              key={part.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden transition-colors"
            >
              <button
                onClick={() => togglePart(part.id)}
                className="w-full text-left p-4 hover:bg-[#1f1f1f] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        partIndex === 0
                          ? 'bg-yellow-500 text-black'
                          : 'bg-[#2a2a2a] text-gray-400'
                      }`}
                    >
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{part.id}</span>
                        <span className="text-sm text-gray-400">· {part.name}</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-0.5">
                        {part.description}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                          {part.welds.length} weld{part.welds.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                          {totalDuration} min total
                        </span>
                        {hasPriority && (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                            Priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {partIndex === 0 && (
                      <span className="text-xs font-medium text-yellow-500 uppercase tracking-wider">
                        Next up
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[#2a2a2a] px-4 pb-4 pt-2">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 mt-2">
                    Welds assigned
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
                              : 'bg-[#141414] border-[#2a2a2a] hover:bg-[#1f1f1f]'
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
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                {weld.id}
                              </span>
                              <span className="text-xs text-gray-500">
                                {weld.jointType}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded">
                                {weld.wps}
                              </span>
                              <span className="text-[10px] text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded">
                                {weld.duration} min
                              </span>
                              {weld.priority && (
                                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                                  Priority
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isFirstWeld && (
                            <span className="text-[10px] font-medium text-yellow-500 uppercase tracking-wider">
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
        <div className="mt-6 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
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
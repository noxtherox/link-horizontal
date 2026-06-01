import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, BadgeCheck, ArrowRight } from 'lucide-react';
import { CompletedWeld } from '@/types/weldcloud';

interface CompletedWeldsProps {
  completedWelds: CompletedWeld[];
}

export function CompletedWelds({ completedWelds }: CompletedWeldsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const methodLabel = (method: CompletedWeld['method']) => {
    switch (method) {
      case 'done':
        return { text: 'Done', icon: <Check className="w-3 h-3" />, color: 'text-green-400 bg-green-500/10 border-green-500/20' };
      case 'choose-different':
        return { text: 'Skipped', icon: <ArrowRight className="w-3 h-3" />, color: 'text-gray-400 bg-[#1f1f1f] border-[#2a2a2a]' };
      case 'signed':
        return { text: 'Signed', icon: <BadgeCheck className="w-3 h-3" />, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' };
    }
  };

  if (completedWelds.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:bg-[#1f1f1f] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-white">
              Completed welds
            </div>
            <div className="text-xs text-gray-500">
              {completedWelds.length} weld{completedWelds.length !== 1 ? 's' : ''} finished today
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Total arc time {formatTime(completedWelds.reduce((sum, cw) => sum + cw.arcTime, 0))}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {completedWelds.map((cw, index) => {
            const meta = methodLabel(cw.method);
            return (
              <div
                key={`${cw.weld.id}-${index}`}
                className="flex items-center gap-3 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-400">
                    {completedWelds.length - index}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{cw.weld.id}</span>
                    <span className="text-xs text-gray-500">{cw.weld.jointType}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-gray-500 bg-[#141414] px-2 py-0.5 rounded border border-[#2a2a2a]">
                      {cw.weld.partNumber}
                    </span>
                    <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono border border-yellow-500/20">
                      {cw.weld.process}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border ${meta.color}`}>
                    {meta.icon}
                    {meta.text}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Arc {formatTime(cw.arcTime)} · {cw.completedAt}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
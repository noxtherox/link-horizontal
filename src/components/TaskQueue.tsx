import { Weld } from '@/types/weldcloud';
import { Badge } from '@/components/ui/badge';

interface TaskQueueProps {
  welds: Weld[];
  onSelect: (weld: Weld) => void;
}

export function TaskQueue({ welds, onSelect }: TaskQueueProps) {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
          M. Costa · Welder · Queue assigned by K. Park · 06:30
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {welds.length} welds ready — Pressure Header
        </h1>
      </div>

      <div className="space-y-3">
        {welds.map((weld, index) => (
          <button
            key={weld.id}
            onClick={() => onSelect(weld)}
            className="w-full text-left bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg p-4 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    index === 0
                      ? 'bg-yellow-500 text-black'
                      : 'bg-[#2a2a2a] text-gray-400 group-hover:text-white'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{weld.id}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {weld.partNumber} · {weld.jointType}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                      {weld.wps}
                    </span>
                    <span className="text-xs text-gray-500 bg-[#141414] px-2 py-0.5 rounded">
                      {weld.duration} min
                    </span>
                    {weld.priority && (
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                        Priority
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {index === 0 && (
                <span className="text-xs font-medium text-yellow-500 uppercase tracking-wider">
                  Next up
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="text-yellow-500">🎤</span>
          <span className="font-mono">"start W-014"</span>
        </div>
        <div className="bg-[#141414] rounded-lg p-4">
          <p className="text-sm text-white font-medium mb-3">
            Start weld W-014 — P-4471-B butt joint 3G?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => welds.length > 0 && onSelect(welds[0])}
              className="flex flex-col items-center justify-center gap-1 p-4 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
            >
              <span className="text-white text-lg">✓</span>
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
    </div>
  );
}
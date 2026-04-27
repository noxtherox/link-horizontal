import { ViewMode, WelderStep } from '@/types/weldcloud';
import { Zap, ChevronDown, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  step: WelderStep;
}

const welderSteps: { key: WelderStep; label: string; num: string }[] = [
  { key: 'taskQueue', label: 'Task queue', num: '01' },
  { key: 'preWeldCheck', label: 'Pre-weld check', num: '02' },
  { key: 'arcOn', label: 'Arc on', num: '03' },
  { key: 'deviationFlag', label: 'Deviation flag', num: '04' },
  { key: 'completeSign', label: 'Complete · sign', num: '05' },
];

export function Header({ viewMode, setViewMode, step }: HeaderProps) {
  const activeIndex = welderSteps.findIndex((s) => s.key === step);

  return (
    <header className="bg-[#141414] border-b border-[#2a2a2a]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-white tracking-tight">
              WeldCloud<span className="text-yellow-500">Link</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#1f1f1f] rounded-md text-xs text-gray-400">
            <span>Booth 4 · Headset paired</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1f1f1f] rounded-md">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
              MC
            </div>
            <div className="hidden sm:block text-xs">
              <div className="text-white font-medium">M. Costa</div>
              <div className="text-gray-500">Welder</div>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </div>

          <div className="flex items-center gap-1">
            {(['RFID', 'Scan', 'Voice', 'Touch'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {}}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === 'Voice'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-[#1f1f1f] text-gray-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'welder' ? 'supervisor' : 'welder')}
            className="border-[#2a2a2a] bg-[#1f1f1f] text-gray-300 hover:bg-[#2a2a2a] hover:text-white text-xs"
          >
            {viewMode === 'welder' ? 'Supervisor' : 'Welder'}
          </Button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f1f] rounded-md text-xs text-green-400">
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </div>
        </div>
      </div>

      {viewMode === 'welder' && (
        <div className="flex border-t border-[#2a2a2a]">
          {welderSteps.map((s, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            return (
              <button
                key={s.key}
                onClick={() => {
                  if (isPast) setViewMode('welder');
                }}
                className={`flex-1 flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                  isActive ? 'bg-[#1f1f1f]' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                    isActive
                      ? 'bg-yellow-500 text-black'
                      : isPast
                      ? 'bg-[#2a2a2a] text-yellow-500'
                      : 'bg-[#2a2a2a] text-gray-600'
                  }`}
                >
                  {s.num}
                </span>
                <div className="hidden lg:block">
                  <div
                    className={`text-xs font-medium ${
                      isActive ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {s.label}
                  </div>
                  <div
                    className={`text-[10px] uppercase tracking-wider ${
                      isActive ? 'text-yellow-500' : 'text-gray-600'
                    }`}
                  >
                    {s.key === 'taskQueue' ? 'Welder' : 'Welder'}
                  </div>
                </div>
              </button>
            );
          })}
          <button
            onClick={() => setViewMode('supervisor')}
            className="flex-1 flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[#1a1a1a] transition-colors"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded text-xs font-bold bg-[#2a2a2a] text-gray-600">
              06
            </span>
            <div className="hidden lg:block">
              <div className="text-xs font-medium text-gray-600">Floor status</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-600">Supervisor</div>
            </div>
          </button>
        </div>
      )}

      {viewMode === 'supervisor' && (
        <div className="flex border-t border-[#2a2a2a]">
          <button
            onClick={() => setViewMode('welder')}
            className="flex-1 flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[#1a1a1a] transition-colors"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded text-xs font-bold bg-[#2a2a2a] text-gray-600">
              01
            </span>
            <div className="hidden lg:block">
              <div className="text-xs font-medium text-gray-600">Task queue</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-600">Welder</div>
            </div>
          </button>
          <div className="flex-[5] flex items-center justify-center py-2.5">
            <span className="text-xs text-yellow-500 font-medium uppercase tracking-wider">
              Supervisor View — Floor Status
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
import { ViewMode, WelderStep } from '@/types/weldcloud';
import { Zap, ChevronDown, Wifi, Sun, Moon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  step: WelderStep;
  workflowStep: WelderStep;
  setStep: (s: WelderStep) => void;
  onResume: () => void;
}

const welderSteps: { key: WelderStep; label: string; num: string }[] = [
  { key: 'taskQueue', label: 'TASKS', num: '01' },
  { key: 'weldActive', label: 'WELD', num: '02' },
  { key: 'reviewAndSign', label: 'REVIEW', num: '03' },
];

export function Header({ viewMode, setViewMode, step, workflowStep, setStep, onResume }: HeaderProps) {
  const activeIndex = welderSteps.findIndex((s) => s.key === step);
  const workflowIndex = welderSteps.findIndex((s) => s.key === workflowStep);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-[var(--c-surface)] border-b border-[var(--c-border)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-[var(--text-hi)] tracking-tight">
              WeldCloud<span className="text-yellow-500">Link</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--c-elevated)] rounded-md border border-[var(--c-border)]">
            <span className="text-xs text-[var(--text-lo)] uppercase tracking-wider">Station</span>
            <span className="text-sm font-bold text-yellow-500">1</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'welder' && step !== workflowStep && (
            <Button
              onClick={onResume}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-xs gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              Resume
            </Button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--c-elevated)] rounded-md">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
              MC
            </div>
            <div className="hidden sm:block text-xs">
              <div className="text-[var(--text-hi)] font-medium">M. Costa</div>
              <div className="text-[var(--text-dim)]">Welder</div>
            </div>
            <ChevronDown className="w-3 h-3 text-[var(--text-dim)]" />
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--c-border)] bg-[var(--c-elevated)] hover:bg-[var(--c-hover)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-yellow-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[var(--text-lo)]" />
            )}
            <span className="text-xs font-medium text-[var(--text-hi)] hidden sm:inline">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'welder' ? 'supervisor' : 'welder')}
            className="border-[var(--c-border)] bg-[var(--c-elevated)] text-[var(--text-lo)] hover:bg-[var(--c-hover)] hover:text-[var(--text-hi)] text-xs"
          >
            {viewMode === 'welder' ? 'Supervisor' : 'Welder'}
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--c-elevated)] rounded-md border border-[var(--c-border)]">
            <Wifi className="w-3 h-3 text-[var(--text-verified)]" />
            <span className="text-xs text-[var(--text-hi)] font-medium">Warrior Edge 500</span>
          </div>
        </div>
      </div>

      {viewMode === 'welder' && (
        <div className="flex border-t border-[var(--c-border)] overflow-x-auto">
          {welderSteps.map((s, i) => {
            const isViewed = i === activeIndex;
            const isPast = i < workflowIndex;
            return (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className={`flex-1 flex items-center gap-2 px-4 py-2.5 text-left transition-colors min-w-[100px] ${
                  isViewed ? 'bg-[var(--c-elevated)]' : 'hover:bg-[var(--c-raised)]'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold shrink-0 ${
                    isViewed
                      ? 'bg-yellow-500 text-black'
                      : isPast
                      ? 'bg-[var(--c-border)] text-yellow-500'
                      : 'bg-[var(--c-border)] text-[var(--text-dim)]'
                  }`}
                >
                  {s.num}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isViewed ? 'text-[var(--text-hi)]' : isPast ? 'text-[var(--text-lo)]' : 'text-[var(--text-dim)]'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {viewMode === 'supervisor' && (
        <div className="flex border-t border-[var(--c-border)]">
          <button
            onClick={() => setViewMode('welder')}
            className="flex-1 flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[var(--c-raised)] transition-colors"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded text-xs font-bold bg-[var(--c-border)] text-[var(--text-dim)]">
              01
            </span>
            <span className="text-xs font-medium text-[var(--text-dim)]">TASKS</span>
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
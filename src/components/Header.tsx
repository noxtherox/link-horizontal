import { useState } from 'react';
import { ViewMode } from '@/types/weldcloud';
import { AVAILABILITY_CODES, AvailabilityCode } from '@/data/mockData';
import { Zap, ChevronDown, Wifi, Sun, Moon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  availability: AvailabilityCode;
  onSetAvailability: (code: AvailabilityCode) => void;
}

export function Header({ viewMode, setViewMode, availability, onSetAvailability }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showAvailability, setShowAvailability] = useState(false);

  const current = AVAILABILITY_CODES.find(c => c.code === availability)!;

  const selectCode = (code: AvailabilityCode) => {
    onSetAvailability(code);
    setShowAvailability(false);
  };

  return (
    <>
      <header className="bg-[var(--c-surface)] border-b border-[var(--c-border)]">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: logo + action controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-[var(--text-hi)] tracking-tight">
                WeldCloud<span className="text-yellow-500">Link</span>
              </span>
            </div>

            <div className="w-px h-5 bg-[var(--c-border)]" />

            <button
              onClick={toggleTheme}
              className="h-9 flex items-center gap-1.5 px-3 rounded-md border border-[var(--c-border)] bg-[var(--c-elevated)] hover:bg-[var(--c-hover)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-yellow-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[var(--text-lo)]" />
              )}
              <span className="text-sm font-medium text-[var(--text-hi)] hidden sm:inline">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'welder' ? 'supervisor' : 'welder')}
              className="h-9 border-[var(--c-border)] bg-[var(--c-elevated)] text-[var(--text-lo)] hover:bg-[var(--c-hover)] hover:text-[var(--text-hi)] text-sm"
            >
              {viewMode === 'welder' ? 'Supervisor' : 'Welder'}
            </Button>
          </div>

          {/* Right: station (availability trigger) + machine + welder */}
          <div className="flex items-center gap-3">
            {/* Station + availability button */}
            <button
              onClick={() => setShowAvailability(true)}
              style={{ backgroundColor: current.color }}
              className="h-9 hidden md:flex items-center gap-2 px-3 rounded-md hover:opacity-90 active:opacity-75 transition-opacity"
            >
              <span className="text-sm font-semibold text-white">Stn 1: {current.label}</span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>

            <div className="hidden md:block w-px h-5 bg-[var(--c-border)]" />

            <div className="h-9 flex items-center gap-2 px-3 bg-[var(--c-elevated)] rounded-md border border-[var(--c-border)]">
              <Wifi className="w-3 h-3 text-[var(--text-verified)]" />
              <span className="text-sm text-[var(--text-hi)] font-medium">Warrior Edge 500</span>
            </div>

            <div className="h-9 flex items-center gap-2 px-3 bg-[var(--c-elevated)] border border-[var(--c-border)] rounded-md">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                MC
              </div>
              <span className="hidden sm:block text-sm font-medium text-[var(--text-hi)]">M. Costa</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-dim)]" />
            </div>
          </div>
        </div>

        {viewMode === 'supervisor' && (
          <div className="flex border-t border-[var(--c-border)]">
            <button
              onClick={() => setViewMode('welder')}
              className="flex-1 flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[var(--c-raised)] transition-colors"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded text-sm font-bold bg-[var(--c-border)] text-[var(--text-dim)]">
                01
              </span>
              <span className="text-sm font-medium text-[var(--text-dim)]">TASKS</span>
            </button>
            <div className="flex-[5] flex items-center justify-center py-2.5">
              <span className="text-sm text-yellow-500 font-medium uppercase tracking-wider">
                Supervisor View — Floor Status
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Availability modal — full screen */}
      {showAvailability && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div>
              <p className="text-sm text-white/50 uppercase tracking-widest mb-0.5">Station 1</p>
              <h2 className="text-2xl font-bold text-white">Machine Availability</h2>
            </div>
            <button
              onClick={() => setShowAvailability(false)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Code grid — fills remaining screen */}
          <div className="flex-1 grid grid-cols-2 gap-4 p-6">
            {AVAILABILITY_CODES.map(({ code, label, color }) => {
              const isSelected = availability === code;
              return (
                <button
                  key={code}
                  onClick={() => selectCode(code)}
                  style={isSelected ? { borderColor: color, backgroundColor: `${color}18` } : {}}
                  className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 transition-all active:scale-95 ${
                    isSelected
                      ? 'border-current'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-full shadow-lg"
                    style={{ backgroundColor: color, boxShadow: `0 0 32px ${color}66` }}
                  />
                  <div className="text-center">
                    <div className="text-5xl font-black text-white leading-none mb-2">{code}</div>
                    <div className="text-lg font-medium text-white/80">{label}</div>
                  </div>
                  {isSelected && (
                    <div
                      className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ color, backgroundColor: `${color}25` }}
                    >
                      Active
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

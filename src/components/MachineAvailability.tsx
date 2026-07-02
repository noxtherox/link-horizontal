import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AvailabilityStatus } from '@/types/weldcloud';

interface AvailabilityOption {
  code: AvailabilityStatus;
  label: string;
  dot: string;
  selected: string;
}

const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  { code: 'P', label: 'Production time', dot: 'bg-[#2e7d32]', selected: 'bg-[#2e7d32]/15 border-[#2e7d32]' },
  { code: 'F', label: 'Failure', dot: 'bg-[#d84315]', selected: 'bg-[#d84315]/15 border-[#d84315]' },
  { code: 'W', label: 'Waiting', dot: 'bg-[#f9a825]', selected: 'bg-[#f9a825]/15 border-[#f9a825]' },
  { code: 'L', label: 'Line restraint', dot: 'bg-[#4e6ef2]', selected: 'bg-[#4e6ef2]/15 border-[#4e6ef2]' },
  { code: 'U', label: 'Unscheduled', dot: 'bg-[#e3d026]', selected: 'bg-[#e3d026]/15 border-[#e3d026]' },
  { code: 'N', label: 'Not defined', dot: 'bg-[#9e9e9e]', selected: 'bg-[#9e9e9e]/15 border-[#9e9e9e]' },
];

interface MachineAvailabilityProps {
  status: AvailabilityStatus;
  onChange: (status: AvailabilityStatus) => void;
}

export function MachineAvailability({ status, onChange }: MachineAvailabilityProps) {
  const [expanded, setExpanded] = useState(false);
  const current = AVAILABILITY_OPTIONS.find((o) => o.code === status)!;

  return (
    <div className="p-4 border-b border-[var(--c-border)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Machine Availability</span>
        <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-lo)]">
          <span className={`w-2 h-2 rounded-full ${current.dot}`} />
          {current.label}
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-[var(--text-dim)]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[var(--text-dim)]" />
          )}
        </span>
      </button>
      {expanded && (
      <div className="space-y-2 mt-3">
        {AVAILABILITY_OPTIONS.map((option) => {
          const isSelected = option.code === status;
          return (
            <button
              key={option.code}
              onClick={() => onChange(option.code)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                isSelected
                  ? option.selected
                  : 'bg-[var(--c-raised)] border-[var(--c-border)] hover:bg-[var(--c-elevated)]'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${option.dot}`} />
              <span className={`text-sm font-medium ${isSelected ? 'text-[var(--text-hi)]' : 'text-[var(--text-md)]'}`}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}

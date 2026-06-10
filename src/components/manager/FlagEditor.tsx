import { CapabilityFlags, IndustryPresetId } from '@/types/weldcloud';
import { FLAG_DEFS, FlagKey, getPreset } from '@/data/presets';
import { RotateCcw } from 'lucide-react';

interface FlagEditorProps {
  flags: CapabilityFlags;
  presetId: IndustryPresetId;
  onChange: (updates: Partial<CapabilityFlags>) => void;
}

export function FlagEditor({ flags, presetId, onChange }: FlagEditorProps) {
  const presetFlags = getPreset(presetId).flags;

  return (
    <div className="space-y-4">
      {FLAG_DEFS.map((def) => {
        const value = flags[def.key];
        const isOverride = value !== presetFlags[def.key];
        return (
          <div key={def.key} className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{def.label}</span>
                {isOverride && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    Override
                  </span>
                )}
              </div>
              {isOverride && (
                <button
                  onClick={() => onChange({ [def.key]: presetFlags[def.key] } as Partial<CapabilityFlags>)}
                  className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Preset default
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-2">{def.description}</p>
            <div className="flex gap-1.5 flex-wrap">
              {def.options.map((opt) => {
                const selected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    title={opt.hint}
                    onClick={() => onChange({ [def.key]: opt.value } as Partial<CapabilityFlags>)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-colors border ${
                      selected
                        ? 'bg-yellow-500 text-black border-yellow-500'
                        : 'bg-[#1f1f1f] text-gray-400 border-[#2a2a2a] hover:bg-[#2a2a2a] hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
              {def.key === 'inspectionScope' && flags.inspectionScope === 'sample' && (
                <div className="flex items-center gap-2 ml-1 px-2 py-1 bg-[#1f1f1f] border border-[#2a2a2a] rounded-md">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={flags.samplePercent}
                    onChange={(e) =>
                      onChange({ samplePercent: Math.max(1, Math.min(99, Number(e.target.value) || 1)) })
                    }
                    className="w-12 bg-transparent text-sm font-bold text-yellow-500 text-right outline-none"
                  />
                  <span className="text-xs text-gray-500">% sampled</span>
                </div>
              )}
            </div>
            {(() => {
              const selectedOpt = def.options.find((o) => o.value === value);
              return selectedOpt ? (
                <p className="text-[11px] text-gray-600 mt-1.5">{selectedOpt.hint}</p>
              ) : null;
            })()}
          </div>
        );
      })}
    </div>
  );
}

export type { FlagKey };

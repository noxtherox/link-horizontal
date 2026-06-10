import { useEffect, useState } from 'react';
import { CapabilityFlags, IndustryPresetId, Part, WorkOrder, WorkOrderStatus } from '@/types/weldcloud';
import { PRESETS, flagOverrides, getPreset } from '@/data/presets';
import { FlagEditor } from '@/components/manager/FlagEditor';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Trash2 } from 'lucide-react';

interface WorkOrderEditorProps {
  workOrder: WorkOrder | null;
  isNew: boolean;
  parts: Part[];
  onSave: (wo: WorkOrder) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: WorkOrderStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'released', label: 'Released' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export function WorkOrderEditor({ workOrder, isNew, parts, onSave, onDelete, onClose }: WorkOrderEditorProps) {
  const [draft, setDraft] = useState<WorkOrder | null>(workOrder);

  useEffect(() => {
    setDraft(workOrder ? { ...workOrder, flags: { ...workOrder.flags }, partIds: [...workOrder.partIds] } : null);
  }, [workOrder]);

  if (!draft) return null;

  const overrides = flagOverrides(draft.flags, draft.presetId);

  const applyPreset = (presetId: IndustryPresetId) => {
    setDraft({ ...draft, presetId, flags: { ...getPreset(presetId).flags } });
  };

  const updateFlags = (updates: Partial<CapabilityFlags>) => {
    setDraft({ ...draft, flags: { ...draft.flags, ...updates } });
  };

  const togglePart = (partId: string) => {
    setDraft({
      ...draft,
      partIds: draft.partIds.includes(partId)
        ? draft.partIds.filter((id) => id !== partId)
        : [...draft.partIds, partId],
    });
  };

  const canSave = draft.name.trim().length > 0 && draft.partIds.length > 0;

  return (
    <Sheet open={!!workOrder} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-[#141414] border-[#2a2a2a] text-white w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#2a2a2a]">
          <SheetTitle className="text-white flex items-baseline gap-3">
            <span className="text-yellow-500 font-mono text-sm">{draft.id}</span>
            <span>{isNew ? 'New work order' : 'Edit work order'}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 py-4 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Hull Block 318"
                className="mt-1 w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Customer</label>
              <input
                value={draft.customer}
                onChange={(e) => setDraft({ ...draft, customer: e.target.value })}
                className="mt-1 w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Due date</label>
              <input
                type="date"
                value={draft.dueDate ?? ''}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value || undefined })}
                className="mt-1 w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Status</label>
              <div className="mt-1 flex gap-1.5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setDraft({ ...draft, status: s.value })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      draft.status === s.value
                        ? 'bg-yellow-500 text-black border-yellow-500'
                        : 'bg-[#1f1f1f] text-gray-400 border-[#2a2a2a] hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Industry preset</h3>
              {overrides.length > 0 && (
                <span className="text-[11px] text-amber-400">
                  {overrides.length} flag{overrides.length > 1 ? 's' : ''} overridden
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const selected = draft.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selected
                        ? 'bg-yellow-500/10 border-yellow-500'
                        : 'bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#3a3a3a]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${selected ? 'text-yellow-500' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${selected ? 'text-yellow-500' : 'text-white'}`}>
                        {preset.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">{preset.tagline}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-600 mt-2">
              A preset only sets defaults — every flag below can be overridden for this work order.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-2">Traceability flags</h3>
            <FlagEditor flags={draft.flags} presetId={draft.presetId} onChange={updateFlags} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-2">
              Parts <span className="text-gray-500 font-normal">({draft.partIds.length} selected)</span>
            </h3>
            <div className="space-y-1.5">
              {parts.map((part) => {
                const selected = draft.partIds.includes(part.id);
                return (
                  <button
                    key={part.id}
                    onClick={() => togglePart(part.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                      selected
                        ? 'bg-yellow-500/10 border-yellow-500/60'
                        : 'bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#3a3a3a]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-yellow-500">{part.id}</span>
                        <span className="text-sm text-white">{part.name}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">{part.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0 ml-3">{part.welds.length} welds</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#141414] border-t border-[#2a2a2a] px-5 py-3 flex items-center gap-2">
          <button
            onClick={() => onSave(draft)}
            disabled={!canSave}
            className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:hover:bg-yellow-500 rounded-lg text-black font-medium text-sm transition-colors"
          >
            {isNew ? 'Create work order' : 'Save changes'}
          </button>
          {!isNew && (
            <button
              onClick={() => onDelete(draft.id)}
              className="p-3 bg-[#1f1f1f] hover:bg-red-500/20 border border-[#2a2a2a] hover:border-red-500/50 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
              title="Delete work order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useState } from 'react';
import { WorkOrder, WorkOrderStatus } from '@/types/weldcloud';
import { FLAG_OPTION_LABELS, flagOverrides, getPreset } from '@/data/presets';
import { useDeleteWorkOrder, useParts, useSaveWorkOrder, useWorkOrders } from '@/hooks/useWorkOrders';
import { nextWorkOrderId } from '@/api/mockApi';
import { WorkOrderEditor } from '@/components/manager/WorkOrderEditor';
import { showSuccess } from '@/utils/toast';
import { CalendarDays, Plus, SlidersHorizontal } from 'lucide-react';

const STATUS_STYLES: Record<WorkOrderStatus, string> = {
  draft: 'bg-[#2a2a2a] text-gray-400',
  released: 'bg-blue-500/15 text-blue-400',
  'in-progress': 'bg-yellow-500/15 text-yellow-500',
  completed: 'bg-green-500/15 text-green-400',
};

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  draft: 'Draft',
  released: 'Released',
  'in-progress': 'In progress',
  completed: 'Completed',
};

export function WorkOrderSetup() {
  const { data: workOrders = [], isLoading } = useWorkOrders();
  const { data: parts = [] } = useParts();
  const saveWorkOrder = useSaveWorkOrder();
  const deleteWorkOrder = useDeleteWorkOrder();

  const [editing, setEditing] = useState<WorkOrder | null>(null);
  const [isNew, setIsNew] = useState(false);

  const startNew = () => {
    setIsNew(true);
    setEditing({
      id: nextWorkOrderId(workOrders),
      name: '',
      customer: '',
      presetId: 'oil-gas',
      flags: { ...getPreset('oil-gas').flags },
      partIds: [],
      status: 'draft',
    });
  };

  const handleSave = (wo: WorkOrder) => {
    saveWorkOrder.mutate(wo, {
      onSuccess: () => {
        showSuccess(`${wo.id} ${isNew ? 'created' : 'saved'}`);
        setEditing(null);
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteWorkOrder.mutate(id, {
      onSuccess: () => {
        showSuccess(`${id} deleted`);
        setEditing(null);
      },
    });
  };

  const weldCount = (wo: WorkOrder) =>
    wo.partIds.reduce((sum, pid) => sum + (parts.find((p) => p.id === pid)?.welds.length ?? 0), 0);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-white">Work Orders</h1>
          <p className="text-xs text-gray-500">
            Each work order carries its own traceability configuration — pick a preset, override per job.
          </p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 rounded-lg text-black font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New work order
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500 py-8 text-center">Loading work orders…</p>}

      <div className="space-y-3">
        {workOrders.map((wo) => {
          const preset = getPreset(wo.presetId);
          const Icon = preset.icon;
          const overrides = flagOverrides(wo.flags, wo.presetId);
          const summaryChips = [
            FLAG_OPTION_LABELS[`weldGranularity:${wo.flags.weldGranularity}`],
            wo.flags.inspectionScope === 'sample'
              ? `${wo.flags.samplePercent}% inspected`
              : `${FLAG_OPTION_LABELS[`inspectionScope:${wo.flags.inspectionScope}`]} inspection`,
            `Sign-off: ${FLAG_OPTION_LABELS[`signOffRigor:${wo.flags.signOffRigor}`]}`,
            `Repair: ${FLAG_OPTION_LABELS[`repairModel:${wo.flags.repairModel}`]}`,
          ];
          return (
            <button
              key={wo.id}
              onClick={() => {
                setIsNew(false);
                setEditing(wo);
              }}
              className="w-full text-left p-4 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl transition-colors"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-yellow-500">{wo.id}</span>
                    <span className="text-sm font-medium text-white">{wo.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${STATUS_STYLES[wo.status]}`}>
                      {STATUS_LABELS[wo.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span>{wo.customer}</span>
                    <span>
                      {wo.partIds.length} part{wo.partIds.length !== 1 ? 's' : ''} · {weldCount(wo)} welds
                    </span>
                    {wo.dueDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {wo.dueDate}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1f1f1f] border border-[#2a2a2a] rounded-md">
                    <Icon className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs text-white font-medium">{preset.name}</span>
                  </span>
                  {overrides.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-1.5 bg-amber-400/10 rounded-md text-[11px] text-amber-400 font-medium">
                      <SlidersHorizontal className="w-3 h-3" />
                      {overrides.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {summaryChips.map((chip) => (
                  <span key={chip} className="text-[11px] text-gray-400 bg-[#1f1f1f] border border-[#2a2a2a] px-2 py-1 rounded">
                    {chip}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <WorkOrderEditor
        workOrder={editing}
        isNew={isNew}
        parts={parts}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

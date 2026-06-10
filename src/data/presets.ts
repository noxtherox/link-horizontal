import { CapabilityFlags, IndustryPresetId } from '@/types/weldcloud';
import { Fuel, Wind, Ship, Truck, LucideIcon } from 'lucide-react';

export interface PresetDef {
  id: IndustryPresetId;
  name: string;
  tagline: string;
  icon: LucideIcon;
  flags: CapabilityFlags;
}

export const PRESETS: PresetDef[] = [
  {
    id: 'oil-gas',
    name: 'Oil & Gas',
    tagline: 'Full per-weld traceability, 100% inspection',
    icon: Fuel,
    flags: {
      weldGranularity: 'per-weld',
      taskDirection: 'tap-first',
      fitUpTracking: 'gated-inspected',
      inspectionScope: 'all',
      samplePercent: 100,
      consumableVerification: 'per-weld',
      signOffRigor: 'per-weld',
      wpqGating: 'hard-lock',
      repairModel: 'new-weld',
    },
  },
  {
    id: 'wind',
    name: 'Wind',
    tagline: 'Per-weld records, sampled inspection',
    icon: Wind,
    flags: {
      weldGranularity: 'per-weld',
      taskDirection: 'tap-first',
      fitUpTracking: 'gated',
      inspectionScope: 'sample',
      samplePercent: 20,
      consumableVerification: 'per-part',
      signOffRigor: 'per-part-batch',
      wpqGating: 'hard-lock',
      repairModel: 'new-weld',
    },
  },
  {
    id: 'shipyard',
    name: 'Shipyard',
    tagline: 'Gated fit-up, batch sign-off per part',
    icon: Ship,
    flags: {
      weldGranularity: 'per-weld',
      taskDirection: 'tap-first',
      fitUpTracking: 'gated',
      inspectionScope: 'sample',
      samplePercent: 10,
      consumableVerification: 'per-part',
      signOffRigor: 'per-part-batch',
      wpqGating: 'hard-lock',
      repairModel: 'new-weld',
    },
  },
  {
    id: 'mobile-machinery',
    name: 'Mobile Machinery',
    tagline: 'Part sessions, weld first — minimum taps',
    icon: Truck,
    flags: {
      weldGranularity: 'part-level',
      taskDirection: 'weld-first',
      fitUpTracking: 'off',
      inspectionScope: 'self-check',
      samplePercent: 0,
      consumableVerification: 'off',
      signOffRigor: 'none',
      wpqGating: 'warning',
      repairModel: 'rework-flag',
    },
  },
];

export function getPreset(id: IndustryPresetId): PresetDef {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

// Metadata for rendering the flag editor generically. samplePercent is
// handled separately (numeric, only relevant in sample mode).
export type FlagKey = Exclude<keyof CapabilityFlags, 'samplePercent'>;

export interface FlagOptionDef {
  value: string;
  label: string;
  hint: string;
}

export interface FlagDef {
  key: FlagKey;
  label: string;
  description: string;
  options: FlagOptionDef[];
}

export const FLAG_DEFS: FlagDef[] = [
  {
    key: 'weldGranularity',
    label: 'Weld granularity',
    description: 'What the welder registers: each individual weld, or one session per part.',
    options: [
      { value: 'per-weld', label: 'Per weld', hint: 'Each weld selected and recorded individually' },
      { value: 'part-level', label: 'Part level', hint: 'One part session; arcs bundle to the part' },
    ],
  },
  {
    key: 'taskDirection',
    label: 'Tap vs weld',
    description: 'Whether a task must be selected before striking the arc.',
    options: [
      { value: 'tap-first', label: 'Tap first', hint: 'Machine armed with the weld’s WPS before arc' },
      { value: 'weld-first', label: 'Weld first', hint: 'Arcs auto-log; welder attributes them after' },
    ],
  },
  {
    key: 'fitUpTracking',
    label: 'Fit-up tracking',
    description: 'Whether fitters complete a gated fit-up step before welding can start.',
    options: [
      { value: 'off', label: 'Off', hint: 'Welds available immediately' },
      { value: 'gated', label: 'Gated', hint: 'Fitter marks ready before weld unlocks' },
      { value: 'gated-inspected', label: 'Gated + inspected', hint: 'Inspector signs off fit-up too' },
    ],
  },
  {
    key: 'inspectionScope',
    label: 'Inspection scope',
    description: 'How the inspector queue is populated after welds complete.',
    options: [
      { value: 'all', label: '100%', hint: 'Every weld goes to inspection' },
      { value: 'sample', label: 'Sample', hint: 'System picks a % — inspectors can add ad-hoc' },
      { value: 'self-check', label: 'Self-check', hint: 'Welder confirms own work, no inspector queue' },
    ],
  },
  {
    key: 'consumableVerification',
    label: 'Consumable verification',
    description: 'When wire, gas and base material lots must be verified.',
    options: [
      { value: 'per-weld', label: 'Per weld', hint: 'Mandatory before every arc' },
      { value: 'per-part', label: 'Per part', hint: 'Once at the start of each part' },
      { value: 'off', label: 'Off', hint: 'No verification step' },
    ],
  },
  {
    key: 'signOffRigor',
    label: 'Sign-off',
    description: 'What the welder signs when work completes.',
    options: [
      { value: 'per-weld', label: 'Per weld', hint: 'Signature on each weld, batched at part completion' },
      { value: 'per-part-batch', label: 'Per part', hint: 'One batch signature per part' },
      { value: 'none', label: 'None', hint: 'Plain done — no signature step' },
    ],
  },
  {
    key: 'wpqGating',
    label: 'WPQ gating',
    description: 'What happens when a welder lacks a valid qualification for a weld.',
    options: [
      { value: 'hard-lock', label: 'Hard lock', hint: 'Task locked with the missing qualification shown' },
      { value: 'warning', label: 'Warning', hint: 'Welder warned but can proceed' },
    ],
  },
  {
    key: 'repairModel',
    label: 'Repair model',
    description: 'How rejected welds are handled.',
    options: [
      { value: 'new-weld', label: 'New weld (R1)', hint: 'Repair becomes W-001-R1 with full history' },
      { value: 'rework-flag', label: 'Rework flag', hint: 'Rework note attached to the existing weld' },
    ],
  },
];

export const FLAG_OPTION_LABELS: Record<string, string> = Object.fromEntries(
  FLAG_DEFS.flatMap((d) => d.options.map((o) => [`${d.key}:${o.value}`, o.label]))
);

export function flagOverrides(flags: CapabilityFlags, presetId: IndustryPresetId): FlagKey[] {
  const preset = getPreset(presetId).flags;
  return FLAG_DEFS.map((d) => d.key).filter((k) => flags[k] !== preset[k]);
}

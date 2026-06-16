export interface Arc {
  id: string;
  duration: number;
  startedAt: string;
  completedAt: string;
  avgHeat: number;
  wpsConformance: number;
  passes: string[];
}

export interface Weld {
  id: string;
  partNumber: string;
  jointType: string;
  wps: string;
  duration: number;
  priority?: boolean;
  process: 'GTAW' | 'GMAW' | 'SMAW' | 'FCAW';
  drawingPosition?: { x: number; y: number };
}

export interface Part {
  id: string;
  name: string;
  description: string;
  welds: Weld[];
}

export interface Consumable {
  id: string;
  name: string;
  lot: string;
  verified: boolean;
  method: 'scan' | 'auto' | 'voice';
}

export interface MachineReading {
  voltage: number;
  current: number;
  travel: number;
  heatInput: number;
}

export interface Station {
  id: string;
  name: string;
  welder: string;
  currentWeld?: string;
  status: 'idle' | 'pre-weld' | 'arc-on' | 'paused';
  heatInput?: number;
  wpsConformance?: number;
}

export interface Alert {
  id: string;
  station: string;
  message: string;
  time: string;
  acknowledged: boolean;
}

export interface CompletedWeld {
  weld: Weld;
  completedAt: string;
  arcs: Arc[];
  method: 'done' | 'choose-different' | 'signed';
  locked?: boolean;
  consumables?: Consumable[];
}

export type WelderStep = 'taskQueue' | 'weldActive' | 'reviewAndSign';
export type ViewMode = 'welder' | 'supervisor' | 'manager';

// ── Multi-industry configuration model ────────────────────────────────
// Industries are presets over these granular capability flags; the flags
// attach to a work order, never to the whole site.

export type WeldGranularity = 'per-weld' | 'part-level';
export type TaskDirection = 'tap-first' | 'weld-first';
export type FitUpTracking = 'off' | 'gated' | 'gated-inspected';
export type InspectionScope = 'all' | 'sample' | 'self-check';
export type ConsumableVerification = 'per-weld' | 'per-part' | 'off';
export type SignOffRigor = 'per-weld' | 'per-part-batch' | 'none';
export type WpqGating = 'hard-lock' | 'warning';
export type RepairModel = 'new-weld' | 'rework-flag';

export interface CapabilityFlags {
  weldGranularity: WeldGranularity;
  taskDirection: TaskDirection;
  fitUpTracking: FitUpTracking;
  inspectionScope: InspectionScope;
  /** % of welds auto-selected for inspection when inspectionScope === 'sample' */
  samplePercent: number;
  consumableVerification: ConsumableVerification;
  signOffRigor: SignOffRigor;
  wpqGating: WpqGating;
  repairModel: RepairModel;
}

export type IndustryPresetId = 'oil-gas' | 'wind' | 'shipyard' | 'mobile-machinery';

export type WorkOrderStatus = 'draft' | 'released' | 'in-progress' | 'completed';

export interface WorkOrder {
  id: string;
  name: string;
  customer: string;
  presetId: IndustryPresetId;
  flags: CapabilityFlags;
  partIds: string[];
  status: WorkOrderStatus;
  dueDate?: string;
}

// ── Execution records ─────────────────────────────────────────────────

export type InspectionStatus =
  | 'not-required'
  | 'self-checked'
  | 'pending'
  | 'accepted'
  | 'rejected';

/** Per-weld completion in per-weld granularity mode. */
export interface CompletedWeldRecord extends CompletedWeld {
  workOrderId: string;
  welderId: string;
  signed: boolean;
  inspectionStatus: InspectionStatus;
  /** Set when this weld is a repair of another (repairModel 'new-weld') */
  repairOf?: string;
  /** Set when flagged for rework in place (repairModel 'rework-flag') */
  reworkNote?: string;
  defectCode?: string;
}

/** Whole-part completion in part-level granularity mode. */
export interface PartCompletionRecord {
  workOrderId: string;
  partId: string;
  welderId: string;
  completedAt: string;
  arcs: Arc[];
  selfChecked: boolean;
  inspectionStatus: InspectionStatus;
  reworkNote?: string;
  defectCode?: string;
}

// ── People & qualifications ───────────────────────────────────────────

export type Role = 'welder' | 'fitter' | 'inspector' | 'manager';

export interface Qualification {
  id: string;
  process: Weld['process'];
  positions: string[];
  materialGroup: string;
  /** ISO date; expired quals lock or warn per the work order's wpqGating flag */
  expires: string;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  /** Primary/home role — used as the default view on badge-in */
  role: Role;
  /**
   * All roles this person can act as. Some operators are cross-trained
   * (e.g. welder + inspector). When omitted, defaults to [role].
   * A user with more than one work role gets a role selector in the header.
   */
  roles?: Role[];
  badgeId: string;
  qualifications: Qualification[];
}
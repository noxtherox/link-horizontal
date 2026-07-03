export interface Arc {
  id: string;
  duration: number;
  startedAt: string;
  completedAt: string;
  avgHeat: number;
  wpsConformance: number;
  passes: string[];
}

export type WeldProcess = 'GTAW' | 'GMAW' | 'SMAW' | 'FCAW';

// One process step of a WPS. A WPS can define up to 3 processes, each covering
// specific passes (e.g. GTAW for the root, GMAW for fill and cap). `assigned`
// marks whether this welder's task includes the step — a task may scope down
// to a single process while the rest is welded by someone else.
export interface WpsProcessStep {
  process: WeldProcess;
  passes: string[];
  assigned: boolean;
  welder?: string; // who welds this step when it is not assigned to you
  completed?: boolean; // step already welded (e.g. root done at another station)
}

export interface Weld {
  id: string;
  partNumber: string;
  jointType: string;
  wps: string;
  duration: number;
  priority?: boolean;
  processes: WpsProcessStep[];
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
export type ViewMode = 'welder' | 'supervisor';

export type AvailabilityStatus = 'P' | 'F' | 'W' | 'L' | 'U' | 'N';
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
}

export type WelderStep = 'taskQueue' | 'weldActive' | 'reviewAndSign';
export type ViewMode = 'welder' | 'supervisor';
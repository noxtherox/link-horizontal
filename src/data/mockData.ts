import { Part, Consumable, Station, Alert } from '@/types/weldcloud';

export const parts: Part[] = [
  {
    id: 'P-4471-B',
    name: 'Piping Spool 001',
    description: 'Pressure Header — Section B',
    welds: [
      // Multi-process WPS, welder does the full stack
      { id: 'W-014', partNumber: 'P-4471-B', jointType: 'Butt joint 3G', wps: 'WPS-A36-3G', duration: 8, priority: true, processes: [
        { process: 'GTAW', passes: ['Root'], assigned: true },
        { process: 'GMAW', passes: ['Fill', 'Cap'], assigned: true },
      ], drawingPosition: { x: 25, y: 38 } },
      { id: 'W-015', partNumber: 'P-4471-B', jointType: 'Fillet 2F', wps: 'WPS-A36-2F', duration: 5, processes: [
        { process: 'FCAW', passes: ['Root', 'Fill', 'Cap'], assigned: true },
      ], drawingPosition: { x: 73, y: 38 } },
      // 3-process WPS, welder assigned the GTAW root only — fill and cap go to other stations
      { id: 'W-018', partNumber: 'P-4471-B', jointType: 'Butt joint 1G', wps: 'WPS-A36-1G', duration: 3, processes: [
        { process: 'GTAW', passes: ['Root'], assigned: true },
        { process: 'GMAW', passes: ['Fill'], assigned: false, welder: 'R. Silva' },
        { process: 'FCAW', passes: ['Cap'], assigned: false, welder: 'R. Silva' },
      ], drawingPosition: { x: 54, y: 24 } },
      { id: 'W-019', partNumber: 'P-4471-B', jointType: 'Fillet 3F', wps: 'WPS-A36-3F', duration: 4, processes: [
        { process: 'SMAW', passes: ['Root', 'Fill', 'Cap'], assigned: true },
      ], drawingPosition: { x: 48, y: 62 } },
      // Root already welded at another station — this task proceeds with fill and cap
      { id: 'W-020', partNumber: 'P-4471-B', jointType: 'Fillet 2F', wps: 'WPS-A36-2F-M', duration: 7, priority: true, processes: [
        { process: 'GTAW', passes: ['Root'], assigned: false, welder: 'T. Bauer', completed: true },
        { process: 'GMAW', passes: ['Fill', 'Cap'], assigned: true },
      ], drawingPosition: { x: 63, y: 38 } },
    ],
  },
  {
    id: 'P-4471-C',
    name: 'Piping Spool 002',
    description: 'Pressure Header — Section C',
    welds: [
      { id: 'W-016', partNumber: 'P-4471-C', jointType: 'Fillet 2F', wps: 'WPS-A36-2F-T', duration: 5, processes: [
        { process: 'GTAW', passes: ['Root', 'Fill', 'Cap'], assigned: true },
      ], drawingPosition: { x: 50, y: 50 } },
      { id: 'W-017', partNumber: 'P-4471-C', jointType: 'Fillet 2F', wps: 'WPS-A36-2F-S', duration: 5, processes: [
        { process: 'SMAW', passes: ['Root', 'Fill', 'Cap'], assigned: true },
      ], drawingPosition: { x: 50, y: 50 } },
      // Root still in progress at another station — welder waits before starting fill/cap
      { id: 'W-021', partNumber: 'P-4471-C', jointType: 'Butt joint 2G', wps: 'WPS-A36-2G', duration: 6, processes: [
        { process: 'GTAW', passes: ['Root'], assigned: false, welder: 'J. Müller', completed: false },
        { process: 'GMAW', passes: ['Fill', 'Cap'], assigned: true },
      ], drawingPosition: { x: 32, y: 58 } },
    ],
  },
];

// Deep clone of parts for tracking completion against original data
export const initialParts: Part[] = JSON.parse(JSON.stringify(parts));

export const consumables: Consumable[] = [
  { id: 'c1', name: 'Wire ER70S-6', lot: 'L24-08812', verified: true, method: 'scan' },
  { id: 'c2', name: 'Base A36', lot: 'heat 9F-21044', verified: true, method: 'scan' },
  { id: 'c3', name: 'Machine OK', lot: 'Aristo 500ix', verified: true, method: 'auto' },
  { id: 'c4', name: 'Shielding gas', lot: 'Ar/CO₂', verified: false, method: 'voice' },
];

export const gasSpec = {
  mix: 'Ar/CO₂ 80/20',
  flowRate: '14–16 L/min',
  minPressure: '1.8 bar',
};

export const machineSpec = {
  name: 'Aristo 500ix',
  layer: 'Fill pass',
  deposition: '3.4 kg/h',
  wpsHeatMax: '1.00 kJ/mm',
};

export const stations: Station[] = [
  { id: 'B-1', name: 'B-1', welder: 'M. Costa', currentWeld: 'W-014', status: 'arc-on', heatInput: 1.04, wpsConformance: 78 },
  { id: 'B-2', name: 'B-2', welder: 'R. Silva', currentWeld: 'W-020', status: 'arc-on', heatInput: 0.92, wpsConformance: 95 },
  { id: 'B-3', name: 'B-3', welder: 'T. Bauer', currentWeld: 'W-011', status: 'pre-weld', wpsConformance: 0 },
  { id: 'B-4', name: 'B-4', welder: 'J. Müller', currentWeld: undefined, status: 'idle', wpsConformance: 0 },
];

export const alerts: Alert[] = [
  { id: 'a1', station: 'B-1', message: 'B-1 heat excursion', time: '06:32', acknowledged: false },
  { id: 'a2', station: 'B-3', message: 'B-3 gas check', time: '06:45', acknowledged: true },
  { id: 'a3', station: 'B-2', message: 'B-2 wire spool', time: '06:31', acknowledged: true },
];
import { Part, User, WorkOrder } from '@/types/weldcloud';
import { getPreset } from '@/data/presets';
import { parts as pipingParts } from '@/data/mockData';

export const seedUsers: User[] = [
  {
    id: 'u-costa',
    name: 'M. Costa',
    initials: 'MC',
    role: 'welder',
    badgeId: 'B-1024',
    qualifications: [
      { id: 'q1', process: 'GMAW', positions: ['1G', '2F', '3G'], materialGroup: 'Group 1 (C-steel)', expires: '2027-03-14' },
      { id: 'q2', process: 'FCAW', positions: ['2F', '3F'], materialGroup: 'Group 1 (C-steel)', expires: '2026-11-02' },
      { id: 'q3', process: 'GTAW', positions: ['1G', '2F'], materialGroup: 'Group 1 (C-steel)', expires: '2027-01-20' },
    ],
  },
  {
    id: 'u-silva',
    name: 'R. Silva',
    initials: 'RS',
    role: 'welder',
    badgeId: 'B-1031',
    qualifications: [
      { id: 'q4', process: 'GMAW', positions: ['1G', '2F'], materialGroup: 'Group 1 (C-steel)', expires: '2026-12-08' },
      // Expired on purpose — demos WPQ hard-lock vs warning
      { id: 'q5', process: 'SMAW', positions: ['2F', '3F'], materialGroup: 'Group 1 (C-steel)', expires: '2026-03-30' },
    ],
  },
  {
    id: 'u-mueller',
    name: 'J. Müller',
    initials: 'JM',
    role: 'welder',
    badgeId: 'B-1047',
    qualifications: [
      { id: 'q6', process: 'SMAW', positions: ['1G', '2F', '3F'], materialGroup: 'Group 1 (C-steel)', expires: '2027-05-11' },
      { id: 'q7', process: 'FCAW', positions: ['1G', '2F'], materialGroup: 'Group 1 (C-steel)', expires: '2026-10-19' },
    ],
  },
  { id: 'u-bauer', name: 'T. Bauer', initials: 'TB', role: 'fitter', badgeId: 'B-2012', qualifications: [] },
  { id: 'u-lindqvist', name: 'A. Lindqvist', initials: 'AL', role: 'inspector', badgeId: 'B-3005', qualifications: [] },
  { id: 'u-novak', name: 'E. Novak', initials: 'EN', role: 'manager', badgeId: 'B-4001', qualifications: [] },
];

export const seedParts: Part[] = [
  ...pipingParts,
  {
    id: 'TS-220-A',
    name: 'Tower Section Ring',
    description: 'Baltic Array — flange ring, segment A',
    welds: [
      { id: 'W-101', partNumber: 'TS-220-A', jointType: 'Butt joint 1G', wps: 'WPS-S355-1G', duration: 22, process: 'FCAW', drawingPosition: { x: 30, y: 45 } },
      { id: 'W-102', partNumber: 'TS-220-A', jointType: 'Butt joint 1G', wps: 'WPS-S355-1G', duration: 22, process: 'FCAW', drawingPosition: { x: 70, y: 45 } },
      { id: 'W-103', partNumber: 'TS-220-A', jointType: 'Fillet 2F', wps: 'WPS-S355-2F', duration: 9, process: 'GMAW', drawingPosition: { x: 50, y: 70 } },
    ],
  },
  {
    id: 'HP-318',
    name: 'Hull Panel 318',
    description: 'Block 318 — stiffened deck panel',
    welds: [
      { id: 'W-201', partNumber: 'HP-318', jointType: 'Fillet 2F', wps: 'WPS-AH36-2F', duration: 12, process: 'FCAW', drawingPosition: { x: 25, y: 30 } },
      { id: 'W-202', partNumber: 'HP-318', jointType: 'Fillet 2F', wps: 'WPS-AH36-2F', duration: 12, process: 'FCAW', drawingPosition: { x: 50, y: 30 } },
      { id: 'W-203', partNumber: 'HP-318', jointType: 'Fillet 2F', wps: 'WPS-AH36-2F', duration: 12, process: 'FCAW', drawingPosition: { x: 75, y: 30 } },
      { id: 'W-204', partNumber: 'HP-318', jointType: 'Butt joint 1G', wps: 'WPS-AH36-1G', duration: 18, priority: true, process: 'SMAW', drawingPosition: { x: 50, y: 65 } },
    ],
  },
  {
    id: 'BB-77',
    name: 'Boom Bracket Set',
    description: 'Excavator boom — bracket pair, batch 12',
    welds: [
      { id: 'W-301', partNumber: 'BB-77', jointType: 'Fillet 2F', wps: 'WPS-S420-2F', duration: 3, process: 'GMAW', drawingPosition: { x: 35, y: 40 } },
      { id: 'W-302', partNumber: 'BB-77', jointType: 'Fillet 2F', wps: 'WPS-S420-2F', duration: 3, process: 'GMAW', drawingPosition: { x: 65, y: 40 } },
      { id: 'W-303', partNumber: 'BB-77', jointType: 'Fillet 3F', wps: 'WPS-S420-3F', duration: 4, process: 'GMAW', drawingPosition: { x: 35, y: 60 } },
      { id: 'W-304', partNumber: 'BB-77', jointType: 'Fillet 3F', wps: 'WPS-S420-3F', duration: 4, process: 'GMAW', drawingPosition: { x: 65, y: 60 } },
      { id: 'W-305', partNumber: 'BB-77', jointType: 'Fillet 2F', wps: 'WPS-S420-2F', duration: 3, process: 'GMAW', drawingPosition: { x: 50, y: 25 } },
      { id: 'W-306', partNumber: 'BB-77', jointType: 'Fillet 2F', wps: 'WPS-S420-2F', duration: 3, process: 'GMAW', drawingPosition: { x: 50, y: 80 } },
    ],
  },
];

export const seedWorkOrders: WorkOrder[] = [
  {
    id: 'WO-26-0142',
    name: 'Pressure Header — Refinery Expansion',
    customer: 'Borealis Energy',
    presetId: 'oil-gas',
    flags: { ...getPreset('oil-gas').flags },
    partIds: ['P-4471-B', 'P-4471-C'],
    status: 'in-progress',
    dueDate: '2026-06-26',
  },
  {
    id: 'WO-26-0157',
    name: 'Tower Sections — Baltic Array',
    customer: 'NordVind',
    presetId: 'wind',
    flags: { ...getPreset('wind').flags },
    partIds: ['TS-220-A'],
    status: 'released',
    dueDate: '2026-07-10',
  },
  {
    id: 'WO-26-0161',
    name: 'Hull Block 318',
    customer: 'Meyer Marine',
    presetId: 'shipyard',
    flags: { ...getPreset('shipyard').flags },
    partIds: ['HP-318'],
    status: 'released',
    dueDate: '2026-07-31',
  },
  {
    id: 'WO-26-0170',
    name: 'Boom Brackets — Batch 12',
    customer: 'TerraMach',
    presetId: 'mobile-machinery',
    flags: { ...getPreset('mobile-machinery').flags },
    partIds: ['BB-77'],
    status: 'released',
    dueDate: '2026-06-19',
  },
];

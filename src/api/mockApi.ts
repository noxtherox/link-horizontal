import { Part, User, WorkOrder } from '@/types/weldcloud';
import { seedParts, seedUsers, seedWorkOrders } from '@/data/seed';

// API-shaped mock client. Components only ever see these async functions,
// so swapping in the real WeldCloud client later is a drop-in change.
// State persists to localStorage so manager edits survive a refresh.

const DB_KEY = 'wcl-db-v3';

interface Db {
  workOrders: WorkOrder[];
  users: User[];
  parts: Part[];
}

function freshDb(): Db {
  return JSON.parse(
    JSON.stringify({ workOrders: seedWorkOrders, users: seedUsers, parts: seedParts })
  );
}

function loadDb(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    // corrupted storage — fall through to reseed
  }
  const db = freshDb();
  saveDb(db);
  return db;
}

function saveDb(db: Db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

let db = loadDb();

const latency = () => new Promise((r) => setTimeout(r, 120 + Math.random() * 130));

export const api = {
  async listWorkOrders(): Promise<WorkOrder[]> {
    await latency();
    return structuredClone(db.workOrders);
  },

  async getWorkOrder(id: string): Promise<WorkOrder | undefined> {
    await latency();
    const wo = db.workOrders.find((w) => w.id === id);
    return wo ? structuredClone(wo) : undefined;
  },

  async saveWorkOrder(workOrder: WorkOrder): Promise<WorkOrder> {
    await latency();
    const idx = db.workOrders.findIndex((w) => w.id === workOrder.id);
    if (idx >= 0) db.workOrders[idx] = structuredClone(workOrder);
    else db.workOrders.push(structuredClone(workOrder));
    saveDb(db);
    return structuredClone(workOrder);
  },

  async deleteWorkOrder(id: string): Promise<void> {
    await latency();
    db.workOrders = db.workOrders.filter((w) => w.id !== id);
    saveDb(db);
  },

  async listUsers(): Promise<User[]> {
    await latency();
    return structuredClone(db.users);
  },

  async listParts(): Promise<Part[]> {
    await latency();
    return structuredClone(db.parts);
  },

  /** Wipe local edits and return to seed data (demo reset). */
  async resetDemo(): Promise<void> {
    db = freshDb();
    saveDb(db);
  },
};

export function nextWorkOrderId(existing: WorkOrder[]): string {
  const nums = existing
    .map((w) => /^WO-26-(\d+)$/.exec(w.id)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = (nums.length ? Math.max(...nums) : 100) + 1;
  return `WO-26-${String(next).padStart(4, '0')}`;
}

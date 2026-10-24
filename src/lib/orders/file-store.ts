import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { OrderStatus, OrderStore, StoredOrder } from './types';

/**
 * A JSON file, for running the shop on your own machine without a database.
 *
 * Deliberately never used in production: a serverless filesystem is wiped
 * between invocations, so an order written here would vanish without ever
 * failing. Silent loss is worse than no record at all.
 */
const FILE = join(process.cwd(), '.orders', 'orders.json');

const read = async (): Promise<StoredOrder[]> => {
  try {
    const raw = await readFile(FILE, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredOrder[]) : [];
  } catch {
    return [];
  }
};

const write = async (orders: StoredOrder[]) => {
  await mkdir(dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(orders, null, 2), 'utf8');
};

const touch = async (reference: string, change: (order: StoredOrder) => void) => {
  const orders = await read();
  const order = orders.find((o) => o.reference === reference);
  if (!order) return;
  change(order);
  order.updatedAt = new Date().toISOString();
  await write(orders);
};

export const fileStore: OrderStore = {
  kind: 'file',

  async init() {},

  async save(order) {
    const orders = await read();
    if (orders.some((o) => o.reference === order.reference)) return;
    orders.unshift(order);
    await write(orders);
  },

  async list() {
    const orders = await read();
    return orders.sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  },

  async get(reference) {
    return (await read()).find((o) => o.reference === reference) ?? null;
  },

  async setStatus(reference: string, status: OrderStatus) {
    await touch(reference, (order) => {
      order.status = status;
    });
  },

  async setTracking(reference: string, tracking: string | null) {
    await touch(reference, (order) => {
      order.tracking = tracking;
    });
  },

  async addNote(reference, body) {
    await touch(reference, (order) => {
      order.notes = [
        ...order.notes,
        { id: crypto.randomUUID(), body, createdAt: new Date().toISOString() },
      ];
    });
  },
};

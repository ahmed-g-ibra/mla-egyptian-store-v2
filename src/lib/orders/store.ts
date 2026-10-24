import { fileStore } from './file-store';
import { postgresStore } from './postgres-store';
import type { OrderStore } from './types';

/**
 * Picks a store, or says plainly that there isn't one.
 *
 * Returning null rather than throwing is the whole point: an unconfigured shop
 * must still take orders over WhatsApp exactly as it did before. Recording
 * them is an addition to the shop, and a missing database must never cost a
 * sale.
 */
export function getOrderStore(): OrderStore | null {
  if (process.env.DATABASE_URL) return postgresStore;
  if (process.env.NODE_ENV !== 'production') return fileStore;
  return null;
}

export const storeIsConfigured = () => getOrderStore() !== null;

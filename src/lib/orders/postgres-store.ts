import postgres from 'postgres';
import type { Currency } from '@/lib/currency';
import type { OrderStatus, OrderStore, StoredOrder } from './types';

/**
 * Postgres, which is what runs in production.
 *
 * Any Postgres works — Neon, Supabase, Vercel's own — because they are all the
 * same database behind a connection string. The schema is created on first use
 * so there is no migration step to forget on a shop this size.
 *
 * The table is `orders_v2` and not `orders` on purpose: this store can share
 * one free database with the first MLA storefront, which owns `orders`. Two
 * shops, one bill, no collision.
 */
const TABLE = 'orders_v2';

let sql: ReturnType<typeof postgres> | null = null;

const db = () => {
  sql ??= postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
    max: 1, // serverless: one connection per instance, not a pool per request
    idle_timeout: 20,
  });
  return sql;
};

let ready: Promise<void> | null = null;

export const postgresStore: OrderStore = {
  kind: 'postgres',

  async init() {
    ready ??= (async () => {
      await db()`
        CREATE TABLE IF NOT EXISTS orders_v2 (
          reference   text PRIMARY KEY,
          placed_at   timestamptz NOT NULL,
          updated_at  timestamptz NOT NULL,
          locale      text NOT NULL,
          currency    text NOT NULL,
          status      text NOT NULL DEFAULT 'new',
          customer    jsonb NOT NULL,
          lines       jsonb NOT NULL,
          subtotal    numeric(12,3) NOT NULL,
          shipping    numeric(12,3) NOT NULL,
          total       numeric(12,3) NOT NULL,
          total_usd   numeric(12,2) NOT NULL,
          tracking    text,
          notes       jsonb NOT NULL DEFAULT '[]'::jsonb
        )`;
      await db()`
        CREATE INDEX IF NOT EXISTS orders_v2_placed_at_idx
        ON orders_v2 (placed_at DESC)`;
    })();
    await ready;
  },

  async save(order) {
    await this.init();
    await db()`
      INSERT INTO orders_v2 (
        reference, placed_at, updated_at, locale, currency, status,
        customer, lines, subtotal, shipping, total, total_usd, tracking, notes
      ) VALUES (
        ${order.reference}, ${order.placedAt}, ${order.updatedAt},
        ${order.locale}, ${order.currency}, ${order.status},
        ${db().json(order.customer)}, ${db().json(order.lines)},
        ${order.subtotal}, ${order.shipping}, ${order.total}, ${order.totalUsd},
        ${order.tracking}, ${db().json(order.notes)}
      )
      -- A customer who taps checkout twice should not get two orders, and a
      -- replayed request must never wipe a status or a note you have set.
      ON CONFLICT (reference) DO NOTHING`;
  },

  async list() {
    await this.init();
    const rows = await db()`
      SELECT * FROM orders_v2 ORDER BY placed_at DESC LIMIT 500`;
    return rows.map(toOrder);
  },

  async get(reference) {
    await this.init();
    const rows = await db()`
      SELECT * FROM orders_v2 WHERE reference = ${reference} LIMIT 1`;
    return rows.length ? toOrder(rows[0]) : null;
  },

  async setStatus(reference: string, status: OrderStatus) {
    await this.init();
    await db()`
      UPDATE orders_v2 SET status = ${status}, updated_at = now()
      WHERE reference = ${reference}`;
  },

  async setTracking(reference: string, tracking: string | null) {
    await this.init();
    await db()`
      UPDATE orders_v2 SET tracking = ${tracking}, updated_at = now()
      WHERE reference = ${reference}`;
  },

  async addNote(reference, body) {
    await this.init();
    const note = { id: crypto.randomUUID(), body, createdAt: new Date().toISOString() };
    await db()`
      UPDATE orders_v2
      SET notes = notes || ${db().json([note])}::jsonb, updated_at = now()
      WHERE reference = ${reference}`;
  },
};

export { TABLE };

type Row = Record<string, unknown>;

const toOrder = (r: Row): StoredOrder => ({
  reference: String(r.reference),
  placedAt: new Date(r.placed_at as string).toISOString(),
  updatedAt: new Date(r.updated_at as string).toISOString(),
  locale: r.locale === 'ar' ? 'ar' : 'en',
  currency: String(r.currency) as Currency,
  status: String(r.status) as OrderStatus,
  customer: r.customer as StoredOrder['customer'],
  lines: r.lines as StoredOrder['lines'],
  subtotal: Number(r.subtotal),
  shipping: Number(r.shipping),
  total: Number(r.total),
  totalUsd: Number(r.total_usd),
  tracking: (r.tracking as string | null) ?? null,
  notes: (r.notes ?? []) as StoredOrder['notes'],
});

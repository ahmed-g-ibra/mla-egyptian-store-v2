import { connection, NextResponse } from 'next/server';
import { getOrderStore } from '@/lib/orders/store';
import type { PublicOrderStatus } from '@/lib/orders/types';

const REFERENCE = /^MLA-\d{6}-[A-Z2-9]{4}$/;

/**
 * Where an order has got to, for the customer holding the reference.
 *
 * Returns the status, when it last moved and the tracking number — and
 * nothing else. No name, no address, no prices. A reference is short enough to
 * guess at eventually, so it must not be the key to somebody's address; the
 * full order is only readable from the link the customer already has, which
 * carries the order in it.
 *
 * Up to ten references at a time, so the customer's own list of orders costs
 * one request rather than one each.
 */
export async function GET(request: Request) {
  // This app runs with `cacheComponents`, where a GET handler is prerendered
  // unless it says otherwise. A status that was decided at build time would be
  // worse than none at all.
  await connection();

  const store = getOrderStore();
  if (!store) return NextResponse.json({ orders: [] });

  const asked = (new URL(request.url).searchParams.get('ref') ?? '')
    .split(',')
    .map((r) => r.trim().toUpperCase())
    .filter((r) => REFERENCE.test(r))
    .slice(0, 10);

  if (asked.length === 0) return NextResponse.json({ orders: [] });

  const found: PublicOrderStatus[] = [];
  try {
    await store.init();
    for (const reference of asked) {
      const order = await store.get(reference);
      if (!order) continue;
      found.push({
        reference: order.reference,
        status: order.status,
        updatedAt: order.updatedAt,
        tracking: order.tracking,
      });
    }
  } catch (error) {
    console.error('status lookup failed', error);
    return NextResponse.json({ orders: [] });
  }

  return NextResponse.json(
    { orders: found },
    { headers: { 'cache-control': 'no-store' } },
  );
}

import { connection } from 'next/server';
import { isSignedIn } from '@/lib/orders/auth';
import { getOrderStore } from '@/lib/orders/store';

const HEADERS = [
  'reference',
  'placed_at',
  'updated_at',
  'status',
  'language',
  'customer',
  'phone',
  'email',
  'address',
  'city',
  'country',
  'pieces',
  'currency',
  'subtotal',
  'shipping',
  'total',
  'total_usd',
  'tracking',
  'notes',
];

/** Excel and Numbers both want the quotes doubled and the whole field wrapped. */
const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

/**
 * Every order as a spreadsheet, for the bookkeeping this page is not trying to
 * be. Signed in only: it is the whole customer list in one file.
 */
export async function GET() {
  await connection();

  if (!(await isSignedIn())) return new Response('Not signed in', { status: 401 });
  const store = getOrderStore();
  if (!store) return new Response('No database configured', { status: 503 });

  const orders = await store.list();

  const rows = orders.map((order) =>
    [
      order.reference,
      order.placedAt,
      order.updatedAt,
      order.status,
      order.locale,
      order.customer.name,
      order.customer.phone,
      order.customer.email,
      order.customer.address,
      order.customer.city,
      order.customer.country,
      order.lines.map((line) => `${line.name} x${line.qty}`).join('; '),
      order.currency,
      order.subtotal,
      order.shipping,
      order.total,
      order.totalUsd,
      order.tracking ?? '',
      order.notes.map((note) => note.body).join(' | '),
    ]
      .map(cell)
      .join(','),
  );

  const today = new Date().toISOString().slice(0, 10);

  return new Response([HEADERS.join(','), ...rows].join('\r\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="mla-orders-${today}.csv"`,
      'cache-control': 'no-store',
    },
  });
}

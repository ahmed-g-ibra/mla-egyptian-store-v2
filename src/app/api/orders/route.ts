import { NextResponse } from 'next/server';
import { isCurrency, defaultCurrency, type Currency } from '@/lib/currency';
import { getOrderStore } from '@/lib/orders/store';
import { isGccCountry, priceOrder, type PostedLine } from '@/lib/orders/pricing';
import type { OrderCustomer, StoredOrder } from '@/lib/orders/types';

const REFERENCE = /^MLA-\d{6}-[A-Z2-9]{4}$/;
const MAX_LINES = 40;

/** Trims, collapses whitespace and caps length. Nothing here is ever HTML. */
const text = (value: unknown, max: number) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

/**
 * Records an order at checkout.
 *
 * The customer's own details are taken as given — they are the only source for
 * their name and address. Everything that is money is recomputed from the
 * catalogue in `priceOrder`.
 *
 * A failure here returns 202, not an error: the customer is already on their
 * way to WhatsApp and the sale must not depend on the bookkeeping.
 */
export async function POST(request: Request) {
  const store = getOrderStore();
  if (!store) return NextResponse.json({ recorded: false, reason: 'no store' }, { status: 202 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { reference, currency, locale, country, customer, lines } = (body ?? {}) as {
    reference?: string;
    currency?: string;
    locale?: string;
    country?: string;
    customer?: Record<string, unknown>;
    lines?: PostedLine[];
  };

  if (!reference || !REFERENCE.test(reference)) {
    return NextResponse.json({ error: 'bad reference' }, { status: 400 });
  }
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_LINES) {
    return NextResponse.json({ error: 'bad lines' }, { status: 400 });
  }

  const cur: Currency = isCurrency(String(currency)) ? (currency as Currency) : defaultCurrency;
  const ctry = isGccCountry(String(country)) ? String(country) : 'OM';

  const priced = priceOrder(lines, cur, ctry);
  if (!priced) return NextResponse.json({ error: 'no known products' }, { status: 400 });

  const who: OrderCustomer = {
    name: text(customer?.name, 120),
    email: text(customer?.email, 160),
    phone: text(customer?.phone, 40),
    address: text(customer?.address, 300),
    city: text(customer?.city, 120),
    country: ctry,
  };
  if (!who.name || !who.phone) {
    return NextResponse.json({ error: 'missing contact' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const order: StoredOrder = {
    reference,
    placedAt: now,
    updatedAt: now,
    locale: locale === 'ar' ? 'ar' : 'en',
    currency: cur,
    status: 'new',
    customer: who,
    ...priced,
    tracking: null,
    notes: [],
  };

  try {
    await store.init();
    await store.save(order);
  } catch (error) {
    console.error('order record failed', error);
    return NextResponse.json({ recorded: false }, { status: 202 });
  }

  return NextResponse.json({ recorded: true, reference }, { status: 201 });
}

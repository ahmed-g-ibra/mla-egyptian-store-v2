import { isCurrency, type Currency } from './currency';

/**
 * An order encoded into a URL.
 *
 * WhatsApp click-to-chat links carry text and nothing else — you cannot attach
 * a photograph to one. So the message carries a link to a page that shows the
 * pieces instead, and that page has to reconstruct the order from the URL
 * alone: there is no database here, and an order that only exists in one
 * browser's localStorage is no use to the person receiving it.
 *
 * /en/order?ref=MLA-261024-AB3K&items=bastet-cat-statue~2,sphinx-box~1&cur=OMR&ctry=OM
 */
export type OrderLine = { slug: string; quantity: number };

export type EncodedOrder = {
  reference: string;
  lines: OrderLine[];
  currency: Currency;
  country: string;
};

const COUNTRIES = ['AE', 'SA', 'QA', 'OM', 'BH', 'KW'];
const REFERENCE = /^MLA-\d{6}-[A-Z2-9]{4}$/;

export function encodeOrder({ reference, lines, currency, country }: EncodedOrder): string {
  const items = lines
    .filter((line) => line.quantity > 0)
    .map((line) => `${line.slug}~${line.quantity}`)
    .join(',');
  const params = new URLSearchParams({ ref: reference, items, cur: currency, ctry: country });
  return `?${params.toString()}`;
}

/** Returns null for anything malformed rather than rendering a half-order. */
export function decodeOrder(params: URLSearchParams): EncodedOrder | null {
  const reference = params.get('ref') ?? '';
  const currency = params.get('cur') ?? '';
  const country = params.get('ctry') ?? '';
  const items = params.get('items') ?? '';

  if (!REFERENCE.test(reference)) return null;
  if (!isCurrency(currency)) return null;
  if (!COUNTRIES.includes(country)) return null;

  const lines: OrderLine[] = [];
  for (const chunk of items.split(',')) {
    const [slug, raw] = chunk.split('~');
    const quantity = Number(raw);
    if (!slug || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
    lines.push({ slug, quantity });
  }
  return lines.length > 0 ? { reference, lines, currency, country } : null;
}

/** The date is already in the reference; no need to carry it twice. */
export function orderDate(reference: string): Date | null {
  const m = reference.match(/^MLA-(\d{2})(\d{2})(\d{2})-/);
  if (!m) return null;
  return new Date(2000 + Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

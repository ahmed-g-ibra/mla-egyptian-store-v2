import { products } from '@/data/products';
import { shipping as shippingRules } from '@/data/faq';
import { convert, convertFromAed, currencyMeta, type Currency } from '@/lib/currency';
import type { StoredOrderLine } from './types';

/** The six countries this shop ships to, and the two that are the near band. */
export const GCC_COUNTRIES = ['AE', 'SA', 'QA', 'OM', 'BH', 'KW'] as const;
const NEAR: readonly string[] = ['OM', 'AE'];

export const isGccCountry = (value: string): boolean =>
  (GCC_COUNTRIES as readonly string[]).includes(value);

export type PostedLine = { slug?: unknown; qty?: unknown };

/**
 * Turns a posted basket into money, on the server, from the catalogue.
 *
 * Only slugs and quantities are taken from the request. Names, prices and
 * shipping are all recomputed here, because a posted price is a number a
 * stranger chose and this figure ends up in your books.
 *
 * It uses the same `convert` and shipping rules the storefront renders with,
 * so what is recorded is to the penny what the customer was shown.
 */
export function priceOrder(posted: PostedLine[], currency: Currency, country: string) {
  // Binary floating point does not add decimal money cleanly: three converted
  // rials summed give 32.599999999999994. Every figure that is kept is rounded
  // to the number of places the currency is actually written in.
  const money = (amount: number) => Number(amount.toFixed(currencyMeta[currency].decimals));

  const lines: StoredOrderLine[] = [];

  for (const entry of posted) {
    const slug = typeof entry?.slug === 'string' ? entry.slug : '';
    const product = products.find((p) => p.slug === slug);
    if (!product) continue; // a slug we do not sell is dropped, not guessed at

    const qty = Math.min(Math.max(Math.floor(Number(entry.qty) || 0), 1), 99);
    const unit = convert(product.priceUsd, currency);
    lines.push({ slug: product.slug, qty, name: product.name.en, unit, total: money(unit * qty) });
  }

  if (lines.length === 0) return null;

  const subtotal = money(lines.reduce((sum, line) => sum + line.total, 0));

  // The free-shipping threshold is written in dirhams, so it is tested in
  // dirhams. Converting the threshold instead would let rounding decide
  // whether an order near AED 400 ships free.
  const subtotalAed = lines.reduce((sum, line) => {
    const product = products.find((p) => p.slug === line.slug)!;
    return sum + convert(product.priceUsd, 'AED') * line.qty;
  }, 0);

  const shippingAed =
    subtotalAed >= shippingRules.freeOverAed
      ? 0
      : NEAR.includes(country)
        ? shippingRules.nearRateAed
        : shippingRules.farRateAed;

  const shipping = convertFromAed(shippingAed, currency);
  const total = money(subtotal + shipping);

  return {
    lines,
    subtotal,
    shipping,
    total,
    /** For the admin summary, which adds up orders placed in six currencies. */
    totalUsd: Number((total / currencyMeta[currency].rate).toFixed(2)),
  };
}

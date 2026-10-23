'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart, useCurrency } from './providers';
import { formatPrice, convert } from '@/lib/currency';
import { createOrderReference } from '@/lib/order-reference';
import { encodeOrder } from '@/lib/order-link';
import { products } from '@/data/products';
import { store, whatsappLink } from '@/config/store';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { GlyphLoader } from './glyphs';

export function useCartLines(locale: Locale) {
  const { lines } = useCart();
  return lines
    .map((line) => {
      const product = products.find((p) => p.slug === line.slug);
      return product ? { ...line, product } : null;
    })
    .filter((entry): entry is { slug: string; quantity: number; product: (typeof products)[number] } =>
      Boolean(entry),
    )
    .map((entry) => ({ ...entry, name: entry.product.name[locale] }));
}

export function CartView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { setQuantity, remove, ready } = useCart();
  const { currency } = useCurrency();
  const entries = useCartLines(locale);

  if (!ready) return <GlyphLoader label={dict.common.loading} />;

  if (entries.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-ink-700">{dict.cart.empty}</p>
        <Link
          href={`/${locale}/shop`}
          className="mt-6 inline-block rounded-sm bg-ink-900 px-6 py-3 font-display text-sm uppercase tracking-[0.15em] text-papyrus-100 transition-colors hover:bg-lapis-800"
        >
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  const subtotal = entries.reduce(
    (sum, entry) => sum + convert(entry.product.priceUsd, currency) * entry.quantity,
    0,
  );

  /** Already-converted amounts go through the same formatter as the prices. */
  const money = (amount: number) => formatPrice(amount, currency, locale, { convertFirst: false });

  const buildMessage = () => {
    const reference = createOrderReference();
    /* Country is unknown on this path, so shipping is settled in the chat. */
    const url = `${store.siteUrl}/${locale}/order${encodeOrder({
      reference,
      lines: entries.map((entry) => ({ slug: entry.slug, quantity: entry.quantity })),
      currency,
      country: 'OM',
    })}`;
    return [
      dict.cart.whatsappIntro,
      `${dict.checkout.reference}: ${reference}`,
      '',
      ...entries.map(
        (entry) =>
          `• ${entry.name} ×${entry.quantity} — ${money(
            convert(entry.product.priceUsd, currency) * entry.quantity,
          )}`,
      ),
      '',
      `${dict.cart.subtotal}: ${money(subtotal)}`,
      '',
      url,
    ].join('\n');
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-papyrus-300/70 border-y border-papyrus-300/70">
        {entries.map((entry) => (
          <li key={entry.slug} className="flex gap-4 py-5">
            <Link
              href={`/${locale}/products/${entry.slug}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border border-papyrus-300/60 bg-papyrus-50"
            >
              <Image
                src={entry.product.images[0]}
                alt={entry.name}
                fill
                sizes="96px"
                className="object-contain p-1.5"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                href={`/${locale}/products/${entry.slug}`}
                className="font-display text-base text-ink-900 transition-colors hover:text-gold-600"
              >
                {entry.name}
              </Link>
              <p className="mt-1 text-sm text-ink-500" dir="ltr">
                {formatPrice(entry.product.priceUsd, currency, locale)}
              </p>

              <div className="mt-auto flex items-center gap-4 pt-3">
                <label className="flex items-center gap-2 text-xs text-ink-500">
                  <span>{dict.cart.quantity}</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={entry.quantity}
                    onChange={(event) =>
                      setQuantity(entry.slug, Math.max(1, Number(event.target.value) || 1))
                    }
                    className="w-16 rounded-sm border border-papyrus-300 bg-transparent px-2 py-1 text-center text-ink-900 tabular-nums"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => remove(entry.slug)}
                  className="text-xs text-ink-500 underline underline-offset-4 transition-colors hover:text-carnelian-600"
                >
                  {dict.cart.remove}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-6">
        <h2 className="font-display text-lg text-ink-900">{dict.cart.subtotal}</h2>
        <p className="mt-2 text-2xl font-semibold text-ink-900" dir="ltr">
          {money(subtotal)}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">{dict.cart.shippingNote}</p>

        {/*
          A button rather than a link: every order gets a reference, and a
          reference generated during render would differ between the server
          and the client and change on every re-render.
        */}
        <button
          type="button"
          onClick={() => window.open(whatsappLink(buildMessage()), '_blank', 'noopener')}
          className="mt-5 block w-full rounded-sm bg-malachite-600 px-5 py-3 text-center font-display text-sm uppercase tracking-[0.12em] text-papyrus-50 transition-colors hover:bg-malachite-700"
        >
          {dict.cart.orderOnWhatsapp}
        </button>

        <Link
          href={`/${locale}/checkout`}
          className="mt-3 block rounded-sm border border-ink-900 px-5 py-3 text-center font-display text-sm uppercase tracking-[0.12em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-papyrus-100"
        >
          {dict.cart.checkout}
        </Link>
      </aside>
    </div>
  );
}

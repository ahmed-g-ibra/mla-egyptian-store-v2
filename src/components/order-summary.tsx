'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { products } from '@/data/products';
import { shipping as shippingRules } from '@/data/faq';
import { convert, convertFromAed, formatPrice } from '@/lib/currency';
import { decodeOrder, orderDate } from '@/lib/order-link';
import { store, whatsappLink } from '@/config/store';
import { OrderStatusPanel } from './order-status';
import { Glyph } from './glyphs';

const NEAR = ['OM', 'AE'];

export function OrderSummary({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const order = decodeOrder(useSearchParams());

  if (!order) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="font-display text-3xl text-ink-900">{dict.order.invalidTitle}</h1>
        <p className="mt-4 leading-relaxed text-ink-700">{dict.order.invalidBody}</p>
        <a
          href={whatsappLink(dict.contact.whatsappIntro)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-11 items-center rounded-sm bg-malachite-600 px-6 py-3 font-display text-sm uppercase tracking-[0.12em] text-papyrus-50"
        >
          {dict.contact.whatsapp}
        </a>
      </div>
    );
  }

  const lines = order.lines
    .map((line) => ({ line, product: products.find((p) => p.slug === line.slug) }))
    .filter((entry): entry is { line: typeof entry.line; product: NonNullable<typeof entry.product> } =>
      Boolean(entry.product),
    );

  const money = (amount: number) =>
    formatPrice(amount, order.currency, locale, { convertFirst: false });

  const subtotal = lines.reduce(
    (sum, { line, product }) => sum + convert(product.priceUsd, order.currency) * line.quantity,
    0,
  );
  const subtotalAed = lines.reduce(
    (sum, { line, product }) => sum + convert(product.priceUsd, 'AED') * line.quantity,
    0,
  );
  const shipAed =
    subtotalAed >= shippingRules.freeOverAed
      ? 0
      : NEAR.includes(order.country)
        ? shippingRules.nearRateAed
        : shippingRules.farRateAed;
  const shipCost = convertFromAed(shipAed, order.currency);

  const placed = orderDate(order.reference);
  const placedLabel = placed
    ? new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE-u-ca-gregory-nu-latn' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(placed)
    : null;

  const enquiry = `${dict.order.whatsappAbout} ${order.reference}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Glyph className="text-3xl text-gold-600" width={1}>
        𓋹
      </Glyph>
      <h1 className="mt-3 font-display text-4xl text-ink-900">{dict.order.title}</h1>
      <span className="mt-3 block h-px w-28 bg-gold-500/60" />
      <p className="mt-5 max-w-xl leading-relaxed text-ink-700">{dict.order.lead}</p>

      <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4 rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-5">
        <div>
          <p className="inline-block bg-gold-200/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-800">
            {dict.checkout.reference}
          </p>
          <p className="mt-3 font-mono text-2xl tracking-[0.12em] text-lapis-800" dir="ltr">
            {order.reference}
          </p>
        </div>
        {placedLabel ? (
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
              {dict.order.placedOn}
            </p>
            <p className="mt-2 text-ink-900">{placedLabel}</p>
          </div>
        ) : null}
        <OrderStatusPanel reference={order.reference} locale={locale} dict={dict} />
      </div>

      <h2 className="mt-12 font-display text-xl text-ink-900">{dict.order.pieces}</h2>
      <span className="mt-2 block h-px w-20 bg-gold-500/60" />

      <ul className="mt-6 divide-y divide-papyrus-300/70 border-y border-papyrus-300/70">
        {lines.map(({ line, product }) => (
          <li key={product.slug} className="flex items-center gap-5 py-5">
            <Link
              href={`/${locale}/products/${product.slug}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border border-papyrus-300/60 bg-papyrus-50"
            >
              <Image
                src={product.images[0]}
                alt={product.name[locale]}
                fill
                sizes="96px"
                className="object-contain p-1.5"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/${locale}/products/${product.slug}`}
                className="font-display text-lg text-ink-900 transition-colors hover:text-gold-600"
              >
                {product.name[locale]}
              </Link>
              <p className="mt-1 text-sm text-ink-500">{product.tagline[locale]}</p>
              <p className="mt-1 text-sm text-ink-500">
                {dict.cart.quantity}: <span dir="ltr">{line.quantity}</span>
              </p>
            </div>
            <p className="shrink-0 font-medium tabular-nums text-ink-900" dir="ltr">
              {money(convert(product.priceUsd, order.currency) * line.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 ms-auto max-w-sm space-y-3 text-sm">
        <p className="flex justify-between">
          <span className="text-ink-500">{dict.cart.subtotal}</span>
          <span className="tabular-nums text-ink-900" dir="ltr">
            {money(subtotal)}
          </span>
        </p>
        <p className="flex justify-between">
          <span className="text-ink-500">{dict.checkout.shipping}</span>
          <span
            className={shipAed === 0 ? 'font-medium text-malachite-700' : 'tabular-nums text-ink-900'}
            dir="ltr"
          >
            {shipAed === 0 ? dict.checkout.shippingFree : money(shipCost)}
          </span>
        </p>
        <p className="flex items-baseline justify-between border-t border-papyrus-300/70 pt-3">
          <span className="font-display text-lg text-ink-900">{dict.checkout.total}</span>
          <span className="font-display text-xl font-semibold tabular-nums text-ink-900" dir="ltr">
            {money(subtotal + shipCost)}
          </span>
        </p>
      </div>

      <section className="mt-14 rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-6">
        <h2 className="font-display text-xl text-ink-900">{dict.order.contactTitle}</h2>
        <p className="mt-2 text-sm text-ink-500">{dict.order.contactLead}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <a
            href={whatsappLink(enquiry)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-malachite-600 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-papyrus-50 transition-colors hover:bg-malachite-700"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.6-.1 1.4Z" />
            </svg>
            {store.phoneDisplay}
          </a>
          <a
            href={`mailto:${store.email}?subject=${encodeURIComponent(enquiry)}`}
            className="break-all text-ink-900 underline decoration-gold-500 underline-offset-4 transition-colors hover:text-gold-600"
          >
            {store.email}
          </a>
          <span className="text-ink-500">
            {store.city[locale]}, {store.country[locale]}
          </span>
        </div>
      </section>
    </div>
  );
}

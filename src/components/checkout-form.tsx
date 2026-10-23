'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart, useCurrency } from './providers';
import { useCartLines } from './cart-view';
import { convert, convertFromAed, formatPrice } from '@/lib/currency';
import { createOrderReference } from '@/lib/order-reference';
import { encodeOrder } from '@/lib/order-link';
import { shipping as shippingRules } from '@/data/faq';
import { store, whatsappLink } from '@/config/store';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { Glyph, GlyphLoader } from './glyphs';

const GCC = ['AE', 'SA', 'QA', 'OM', 'BH', 'KW'] as const;
type Country = (typeof GCC)[number];

const COUNTRY_NAMES: Record<Country, { en: string; ar: string }> = {
  AE: { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
  SA: { en: 'Saudi Arabia', ar: 'السعودية' },
  QA: { en: 'Qatar', ar: 'قطر' },
  OM: { en: 'Oman', ar: 'عُمان' },
  BH: { en: 'Bahrain', ar: 'البحرين' },
  KW: { en: 'Kuwait', ar: 'الكويت' },
};

/** Oman and the UAE are the near band; the rest of the Gulf costs more. */
const NEAR: Country[] = ['OM', 'AE'];

export function CheckoutForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { ready } = useCart();
  const { currency } = useCurrency();
  const entries = useCartLines(locale);
  const [placed, setPlaced] = useState<{ reference: string; country: Country } | null>(null);

  if (!ready) return <GlyphLoader label={dict.common.loading} />;

  const subtotal = entries.reduce(
    (sum, entry) => sum + convert(entry.product.priceUsd, currency) * entry.quantity,
    0,
  );
  const subtotalAed = entries.reduce(
    (sum, entry) => sum + convert(entry.product.priceUsd, 'AED') * entry.quantity,
    0,
  );

  /** The real rule from faq.ts, not a flat promise we would have to honour. */
  const shippingAed = (country: Country) =>
    subtotalAed >= shippingRules.freeOverAed
      ? 0
      : NEAR.includes(country)
        ? shippingRules.nearRateAed
        : shippingRules.farRateAed;

  const money = (amount: number) => formatPrice(amount, currency, locale, { convertFirst: false });

  /** Absolute, because it is going into a message read on another device. */
  const orderUrl = (reference: string, country: Country) =>
    `${store.siteUrl}/${locale}/order${encodeOrder({
      reference,
      lines: entries.map((entry) => ({ slug: entry.slug, quantity: entry.quantity })),
      currency,
      country,
    })}`;

  const buildMessage = (reference: string, country: Country) => {
    const ship = shippingAed(country);
    const shipLine = ship === 0 ? dict.checkout.shippingFree : money(convertFromAed(ship, currency));
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
      `${dict.checkout.shipping}: ${shipLine}`,
      `${dict.checkout.total}: ${money(subtotal + convertFromAed(ship, currency))}`,
      '',
      orderUrl(reference, country),
    ].join('\n');
  };

  /* --------------------------------- placed -------------------------------- */

  if (placed) {
    const ship = shippingAed(placed.country);
    const shipCost = convertFromAed(ship, currency);
    const step = 'flex gap-4';
    const bullet =
      'grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lapis-900 text-xs font-semibold text-papyrus-100';

    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <Glyph className="text-3xl text-gold-600" width={1}>
            𓋹
          </Glyph>
          <h2 className="mt-3 font-display text-3xl text-ink-900">{dict.checkout.placed}</h2>
          <span className="mt-3 block h-px w-28 bg-gold-500/60" />

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">
            {dict.checkout.placedBody}
          </p>

          <div className="mt-8 max-w-md rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-5">
            <p className="inline-block bg-gold-200/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-800">
              {dict.checkout.reference}
            </p>
            <p className="mt-3 font-mono text-2xl tracking-[0.12em] text-lapis-800" dir="ltr">
              {placed.reference}
            </p>
            <p className="mt-3 text-sm text-ink-500">{dict.checkout.referenceHint}</p>
          </div>

          <section className="mt-12">
            <h3 className="font-display text-xl text-ink-900">{dict.checkout.nextTitle}</h3>
            <span className="mt-2 block h-px w-20 bg-gold-500/60" />
            <ol className="mt-6 space-y-5">
              {[dict.checkout.next1, dict.checkout.next2, dict.checkout.next3, dict.checkout.next4].map(
                (text, i) => (
                  <li key={text} className={step}>
                    <span className={bullet} aria-hidden>
                      {i + 1}
                    </span>
                    <span className="pt-1 leading-relaxed text-ink-700">{text}</span>
                  </li>
                ),
              )}
            </ol>
          </section>

          <section className="mt-12">
            <h3 className="font-display text-xl text-ink-900">{dict.checkout.contactTitle}</h3>
            <span className="mt-2 block h-px w-20 bg-gold-500/60" />
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              <a
                href={`tel:${store.whatsappNumber}`}
                className="text-ink-900 underline decoration-gold-500 underline-offset-4 transition-colors hover:text-gold-600"
                dir="ltr"
              >
                {store.phoneDisplay}
              </a>
              <a
                href={`mailto:${store.email}?subject=${encodeURIComponent(
                  `${dict.checkout.reference}: ${placed.reference}`,
                )}`}
                className="break-all text-ink-900 underline decoration-gold-500 underline-offset-4 transition-colors hover:text-gold-600"
              >
                {store.email}
              </a>
              <span className="text-ink-500">
                {store.city[locale]}, {store.country[locale]}
              </span>
            </div>
          </section>

          <p className="mt-12 max-w-xl text-sm leading-relaxed text-ink-500">
            {dict.checkout.photosNote}
          </p>
          <Link
            href={`/${locale}/order${encodeOrder({
              reference: placed.reference,
              lines: entries.map((entry) => ({ slug: entry.slug, quantity: entry.quantity })),
              currency,
              country: placed.country,
            })}`}
            className="mt-3 inline-flex min-h-11 items-center rounded-sm border border-lapis-700 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-lapis-800 transition-colors hover:bg-lapis-800 hover:text-papyrus-50"
          >
            {dict.checkout.viewOrder}
          </Link>

          <p className="mt-10 text-sm text-ink-500">{dict.checkout.reopenHint}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href={whatsappLink(buildMessage(placed.reference, placed.country))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-malachite-600 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-malachite-700 transition-colors hover:bg-malachite-600 hover:text-papyrus-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.6-.1 1.4Z" />
              </svg>
              {dict.checkout.reopen}
            </a>
            <Link
              href={`/${locale}/shop`}
              className="inline-flex min-h-11 items-center rounded-sm px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-ink-700 underline underline-offset-4 transition-colors hover:text-gold-600"
            >
              {dict.checkout.backToShop}
            </Link>
          </div>
        </div>

        <aside className="h-fit rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-6">
          <h3 className="font-display text-lg text-ink-900">{dict.checkout.summary}</h3>
          <span className="mt-2 block h-px w-16 bg-gold-500/60" />

          <ul className="mt-5 space-y-3 text-sm">
            {entries.map((entry) => (
              <li key={entry.slug} className="flex justify-between gap-3">
                <span className="text-ink-700">
                  {entry.name} <span className="text-ink-500">× {entry.quantity}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums text-ink-900" dir="ltr">
                  {money(convert(entry.product.priceUsd, currency) * entry.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-5 flex justify-between border-t border-papyrus-300/70 pt-4 text-sm">
            <span className="text-ink-500">{dict.checkout.shipping}</span>
            <span className={ship === 0 ? 'font-medium text-malachite-700' : 'text-ink-900'} dir="ltr">
              {ship === 0 ? dict.checkout.shippingFree : money(shipCost)}
            </span>
          </p>

          <p className="mt-4 flex items-baseline justify-between border-t border-papyrus-300/70 pt-4">
            <span className="font-display text-lg text-ink-900">{dict.checkout.total}</span>
            <span className="font-display text-xl font-semibold tabular-nums text-ink-900" dir="ltr">
              {money(subtotal + shipCost)}
            </span>
          </p>
        </aside>
      </div>
    );
  }

  /* ---------------------------------- form --------------------------------- */

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

  const field =
    'w-full rounded-sm border border-papyrus-300 bg-papyrus-50 px-3 py-2.5 text-ink-900 transition-colors focus-visible:border-gold-500';
  const label = 'block text-xs font-medium uppercase tracking-wide text-ink-500';

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const country = (data.get('country') as Country) ?? 'AE';
          const reference = createOrderReference();

          /*
           * Opened from inside the submit handler so the browser treats it as
           * a user gesture and does not block it. The confirmation then stands
           * on its own with the same link, for when it is blocked anyway.
           */
          window.open(whatsappLink(buildMessage(reference, country)), '_blank', 'noopener');
          setPlaced({ reference, country });
        }}
        className="space-y-8"
      >
        <div
          role="note"
          className="rounded-sm border border-gold-400/60 bg-gold-200/40 px-4 py-3 text-sm leading-relaxed text-ink-800"
        >
          {dict.checkout.demoNotice}
        </div>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg text-ink-900">{dict.checkout.contactSection}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className={label}>{dict.checkout.fullName}</span>
              <input name="name" required autoComplete="name" className={field} />
            </label>
            <label className="space-y-1.5">
              <span className={label}>{dict.checkout.email}</span>
              <input name="email" type="email" required autoComplete="email" className={field} />
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className={label}>{dict.checkout.phone}</span>
              <input name="phone" type="tel" required autoComplete="tel" dir="ltr" className={field} />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg text-ink-900">
            {dict.checkout.shippingSection}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className={label}>{dict.checkout.address}</span>
              <input name="address" required autoComplete="street-address" className={field} />
            </label>
            <label className="space-y-1.5">
              <span className={label}>{dict.checkout.city}</span>
              <input name="city" required autoComplete="address-level2" className={field} />
            </label>
            <label className="space-y-1.5">
              <span className={label}>{dict.checkout.country}</span>
              <select name="country" required autoComplete="country" className={field} defaultValue="AE">
                {GCC.map((code) => (
                  <option key={code} value={code}>
                    {COUNTRY_NAMES[code][locale]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-malachite-600 px-6 py-3.5 font-display text-sm uppercase tracking-[0.12em] text-papyrus-50 transition-colors hover:bg-malachite-700"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.6-.1 1.4Z" />
          </svg>
          {dict.checkout.placeOrder}
        </button>
      </form>

      <aside className="h-fit rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-6">
        <h2 className="font-display text-lg text-ink-900">{dict.checkout.orderSummary}</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {entries.map((entry) => (
            <li key={entry.slug} className="flex justify-between gap-3">
              <span className="min-w-0 text-ink-700">
                {entry.name} <span className="text-ink-500">×{entry.quantity}</span>
              </span>
              <span className="shrink-0 tabular-nums text-ink-900" dir="ltr">
                {money(convert(entry.product.priceUsd, currency) * entry.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex justify-between border-t border-papyrus-300/70 pt-4 font-semibold text-ink-900">
          <span>{dict.cart.subtotal}</span>
          <span dir="ltr" className="tabular-nums">
            {money(subtotal)}
          </span>
        </p>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">{dict.cart.shippingNote}</p>
      </aside>
    </div>
  );
}

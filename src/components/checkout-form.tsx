'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart, useCurrency } from './providers';
import { useCartLines } from './cart-view';
import { convert, currencyMeta, formatPrice } from '@/lib/currency';
import { whatsappLink } from '@/config/store';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { GlyphLoader } from './glyphs';

const GCC = ['AE', 'SA', 'QA', 'OM', 'BH', 'KW'] as const;
const COUNTRY_NAMES: Record<(typeof GCC)[number], { en: string; ar: string }> = {
  AE: { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
  SA: { en: 'Saudi Arabia', ar: 'السعودية' },
  QA: { en: 'Qatar', ar: 'قطر' },
  OM: { en: 'Oman', ar: 'عُمان' },
  BH: { en: 'Bahrain', ar: 'البحرين' },
  KW: { en: 'Kuwait', ar: 'الكويت' },
};

export function CheckoutForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { ready, clear } = useCart();
  const { currency } = useCurrency();
  const entries = useCartLines(locale);
  const [placed, setPlaced] = useState(false);

  if (!ready) return <GlyphLoader label={dict.common.loading} />;

  if (placed) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h2 className="font-display text-2xl text-ink-900">{dict.checkout.placed}</h2>
        <p className="mt-4 leading-relaxed text-ink-700">{dict.checkout.placedBody}</p>
        <Link
          href={`/${locale}/shop`}
          className="mt-8 inline-block rounded-sm bg-ink-900 px-6 py-3 font-display text-sm uppercase tracking-[0.15em] text-papyrus-100 transition-colors hover:bg-lapis-800"
        >
          {dict.checkout.backToShop}
        </Link>
      </div>
    );
  }

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

  const message = [
    dict.cart.whatsappIntro,
    ...entries.map((entry) => `• ${entry.name} ×${entry.quantity}`),
  ].join('\n');

  const field =
    'w-full rounded-sm border border-papyrus-300 bg-papyrus-50 px-3 py-2.5 text-ink-900 transition-colors focus-visible:border-gold-500';
  const label = 'block text-xs font-medium uppercase tracking-wide text-ink-500';

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          clear();
          setPlaced(true);
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
          <legend className="font-display text-lg text-ink-900">
            {dict.checkout.contactSection}
          </legend>
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

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="rounded-sm bg-ink-900 px-6 py-3.5 font-display text-sm uppercase tracking-[0.15em] text-papyrus-100 transition-colors hover:bg-lapis-800"
          >
            {dict.checkout.placeOrder}
          </button>
          <span className="text-sm text-ink-500">{dict.checkout.orSplit}</span>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm bg-malachite-600 px-6 py-3.5 font-display text-sm uppercase tracking-[0.12em] text-papyrus-50 transition-colors hover:bg-malachite-700"
          >
            {dict.cart.orderOnWhatsapp}
          </a>
        </div>
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
                {formatPrice(entry.product.priceUsd * entry.quantity, currency, locale)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex justify-between border-t border-papyrus-300/70 pt-4 font-semibold text-ink-900">
          <span>{dict.cart.subtotal}</span>
          <span dir="ltr" className="tabular-nums">
            {currencyMeta[currency].symbol[locale]}{' '}
            {subtotal.toFixed(subtotal % 1 === 0 ? 0 : currencyMeta[currency].decimals)}
          </span>
        </p>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">{dict.cart.shippingNote}</p>
      </aside>
    </div>
  );
}

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCurrency } from './providers';
import { currencies, currencyMeta, isCurrency, type Currency } from '@/lib/currency';
import { locales, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';

const LOCALE_COOKIE = 'mla_locale';

export function CurrencySwitch({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <label className="inline-flex items-center gap-1.5 text-xs">
      <span className="sr-only">{dict.common.currency}</span>
      <select
        value={currency}
        onChange={(event) => {
          const next = event.target.value;
          if (isCurrency(next)) setCurrency(next as Currency);
        }}
        className="min-h-7 cursor-pointer rounded-sm border border-papyrus-300 bg-transparent px-2 py-1.5 font-body text-ink-800 transition-colors hover:border-gold-500 focus-visible:border-gold-500"
      >
        {currencies.map((code) => (
          <option key={code} value={code}>
            {code} · {currencyMeta[code].symbol[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LocaleSwitch({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const router = useRouter();
  const other = locales.find((l) => l !== locale) ?? locale;

  const swap = () => {
    document.cookie = `${LOCALE_COOKIE}=${other}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    const segments = pathname.split('/');
    segments[1] = other;
    router.push(segments.join('/') || `/${other}`);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={swap}
      lang={other}
      className="inline-flex min-h-7 items-center rounded-sm px-2 py-1.5 text-xs font-medium text-ink-800 underline-offset-4 transition-colors hover:text-gold-600 hover:underline"
      aria-label={`${dict.common.language}: ${other === 'ar' ? dict.common.arabic : dict.common.english}`}
    >
      {other === 'ar' ? dict.common.arabic : dict.common.english}
    </button>
  );
}

export function CartCount({ label }: { label: string }) {
  // Imported lazily by the header so the count can hydrate on its own.
  return <span className="sr-only">{label}</span>;
}

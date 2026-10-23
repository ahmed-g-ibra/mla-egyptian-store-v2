'use client';

import { useCurrency } from './providers';
import { formatPrice } from '@/lib/currency';
import type { Locale } from '@/i18n/config';

export function Price({
  priceUsd,
  locale,
  className = '',
}: {
  priceUsd: number;
  locale: Locale;
  className?: string;
}) {
  const { currency } = useCurrency();
  return (
    <span className={className} dir="ltr">
      {formatPrice(priceUsd, currency, locale)}
    </span>
  );
}

export function ComparePrice({
  priceUsd,
  locale,
  className = '',
}: {
  priceUsd: number;
  locale: Locale;
  className?: string;
}) {
  const { currency } = useCurrency();
  return (
    <s className={className} dir="ltr">
      {formatPrice(priceUsd, currency, locale)}
    </s>
  );
}

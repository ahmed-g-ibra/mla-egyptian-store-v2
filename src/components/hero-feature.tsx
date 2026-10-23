'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Product } from '@/data/types';
import { useCurrency } from './providers';
import { formatPrice } from '@/lib/currency';
import { whatsappLink } from '@/config/store';

/**
 * The first thing a visitor sees has to be a thing they can buy.
 *
 * Price and the "from" figure are client-side because the visitor's currency
 * is: the server renders AED and this corrects on mount, same as every other
 * price on the site.
 */
export function HeroFeature({
  product,
  cheapestUsd,
  locale,
  dict,
}: {
  product: Product;
  cheapestUsd: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const { currency } = useCurrency();
  const [bodyBefore, bodyAfter] = dict.hero.body.split('{from}');

  return (
    <>
      <p className="mt-4 max-w-md text-base leading-relaxed text-papyrus-300 sm:text-lg">
        {bodyBefore}
        <span className="font-semibold text-papyrus-100" dir="ltr">
          {formatPrice(cheapestUsd, currency, locale)}
        </span>
        {bodyAfter}
      </p>

      {/* The buyable thing, above the fold. */}
      <div className="mt-6 flex items-center gap-4 rounded-sm border border-papyrus-400/25 bg-papyrus-50/5 p-3">
        <Link
          href={`/${locale}/products/${product.slug}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-papyrus-50"
        >
          <Image
            src={product.images[0]}
            alt={product.name[locale]}
            fill
            sizes="80px"
            priority
            className="object-contain p-1"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300">
            {dict.hero.featuredLabel}
          </p>
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="mt-0.5 block truncate font-display text-lg text-papyrus-50 transition-colors hover:text-gold-300"
          >
            {product.name[locale]}
          </Link>
          <p className="font-semibold text-gold-300" dir="ltr">
            {formatPrice(product.priceUsd, currency, locale)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={whatsappLink(`${dict.cart.whatsappIntro}\n• ${product.name[locale]}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-malachite-600 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-papyrus-50 transition-colors hover:bg-malachite-700"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.6-.1 1.4Z" />
          </svg>
          {dict.hero.orderNow}
        </a>

        <Link
          href={`/${locale}/shop`}
          className="inline-flex min-h-11 items-center rounded-sm border border-papyrus-400/50 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-papyrus-200 transition-colors hover:border-gold-300 hover:text-gold-300"
        >
          {dict.hero.browseAll}
        </Link>
      </div>
    </>
  );
}

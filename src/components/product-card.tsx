import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Product } from '@/data/types';
import { Price, ComparePrice } from './price';

export function ProductCard({
  product,
  locale,
  priority = false,
}: {
  product: Product;
  locale: Locale;
  priority?: boolean;
}) {
  return (
    <article className="group">
      <Link href={`/${locale}/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-sm border border-papyrus-300/60 bg-papyrus-50">
          <Image
            src={product.images[0]}
            alt={product.name[locale]}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {product.compareAtUsd ? (
            <span className="absolute start-3 top-3 rounded-sm bg-carnelian-600 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-papyrus-50">
              {product.compareAtUsd && locale === 'ar' ? 'خصم' : 'Sale'}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 font-display text-base text-ink-900 transition-colors group-hover:text-gold-600">
          {product.name[locale]}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-500">
          {product.tagline[locale]}
        </p>
        <p className="mt-2 flex items-baseline gap-2">
          <Price priceUsd={product.priceUsd} locale={locale} className="text-sm font-semibold text-ink-900" />
          {product.compareAtUsd ? (
            <ComparePrice
              priceUsd={product.compareAtUsd}
              locale={locale}
              className="text-xs text-ink-500"
            />
          ) : null}
        </p>
      </Link>
    </article>
  );
}

'use client';

import { useMemo, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Product } from '@/data/types';
import type { Collection } from '@/data/collections';
import { ProductCard } from './product-card';
import { useCurrency } from './providers';
import { formatPrice } from '@/lib/currency';

type Sort = 'featured' | 'asc' | 'desc';

/** Bands are held in the supplier's USD and labelled in the visitor's currency. */
const BANDS: { id: string; min: number; max: number }[] = [
  { id: 'under30', min: 0, max: 30 },
  { id: '30to60', min: 30, max: 60 },
  { id: '60to120', min: 60, max: 120 },
  { id: 'over120', min: 120, max: Infinity },
];

export function ProductBrowser({
  products,
  collections,
  locale,
  dict,
  initialCollection = 'all',
}: {
  products: Product[];
  collections: Collection[];
  locale: Locale;
  dict: Dictionary;
  initialCollection?: string;
}) {
  const { currency } = useCurrency();
  const [collection, setCollection] = useState(initialCollection);
  const [band, setBand] = useState('all');
  const [sort, setSort] = useState<Sort>('featured');

  const visible = useMemo(() => {
    const active = BANDS.find((b) => b.id === band);
    const filtered = products.filter(
      (product) =>
        (collection === 'all' || product.collection === collection) &&
        (!active || (product.priceUsd >= active.min && product.priceUsd < active.max)),
    );

    return filtered.sort((a, b) => {
      if (sort === 'asc') return a.priceUsd - b.priceUsd;
      if (sort === 'desc') return b.priceUsd - a.priceUsd;
      return Number(b.featured) - Number(a.featured) || a.name.en.localeCompare(b.name.en);
    });
  }, [products, collection, band, sort]);

  const bandLabel = (b: (typeof BANDS)[number]) => {
    const min = formatPrice(b.min, currency, locale);
    if (b.max === Infinity) return `${min}+`;
    return `${min} – ${formatPrice(b.max, currency, locale)}`;
  };

  const chip = (selected: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
      selected
        ? 'border-ink-900 bg-ink-900 text-papyrus-100'
        : 'border-papyrus-300 text-ink-700 hover:border-gold-500 hover:text-gold-600'
    }`;

  const reset = () => {
    setCollection('all');
    setBand('all');
    setSort('featured');
  };

  return (
    <div>
      <div className="space-y-4 border-y border-papyrus-300/70 py-5">
        <fieldset>
          <legend className="mb-2 font-display text-xs uppercase tracking-widest text-ink-500">
            {dict.shop.filterCollection}
          </legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setCollection('all')} className={chip(collection === 'all')}>
              {dict.shop.filterAll}
            </button>
            {collections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCollection(item.id)}
                className={chip(collection === item.id)}
              >
                {item.name[locale]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <fieldset>
            <legend className="mb-2 font-display text-xs uppercase tracking-widest text-ink-500">
              {dict.shop.filterPrice}
            </legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setBand('all')} className={chip(band === 'all')}>
                {dict.shop.filterAll}
              </button>
              {BANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBand(b.id)}
                  className={chip(band === b.id)}
                  dir="ltr"
                >
                  {bandLabel(b)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-xs text-ink-700">
            <span className="font-display uppercase tracking-widest text-ink-500">
              {dict.shop.sortLabel}
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="cursor-pointer rounded-sm border border-papyrus-300 bg-transparent px-2 py-1.5 transition-colors hover:border-gold-500"
            >
              <option value="featured">{dict.shop.sortFeatured}</option>
              <option value="asc">{dict.shop.sortPriceAsc}</option>
              <option value="desc">{dict.shop.sortPriceDesc}</option>
            </select>
          </label>
        </div>
      </div>

      <p className="py-4 text-sm text-ink-500" aria-live="polite">
        {visible.length} {visible.length === 1 ? dict.shop.resultCountOne : dict.shop.resultCountMany}
      </p>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-ink-700">{dict.shop.empty}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 text-sm text-gold-600 underline underline-offset-4"
          >
            {dict.shop.clear}
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {visible.map((product, index) => (
            <li key={product.slug}>
              <ProductCard product={product} locale={locale} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

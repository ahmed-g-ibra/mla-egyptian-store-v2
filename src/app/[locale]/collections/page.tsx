import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { collections } from '@/data/collections';
import { products } from '@/data/products';
import { Glyph } from '@/components/glyphs';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.nav.collections,
    alternates: {
      canonical: `/${locale}/collections`,
      languages: { en: '/en/collections', ar: '/ar/collections' },
    },
  };
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl text-ink-900">{dict.nav.collections}</h1>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const count = products.filter((p) => p.collection === collection.id).length;
          return (
            <li key={collection.id}>
              <Link
                href={`/${typed}/collections/${collection.id}`}
                className="group block h-full rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-6 transition-colors hover:border-gold-500"
              >
                <Glyph className="text-3xl text-gold-600">{collection.glyph}</Glyph>
                <h2 className="mt-3 font-display text-xl text-ink-900 transition-colors group-hover:text-gold-600">
                  {collection.name[typed]}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {collection.blurb[typed]}
                </p>
                <p className="mt-4 text-xs uppercase tracking-widest text-ink-500">
                  {count} {count === 1 ? dict.shop.resultCountOne : dict.shop.resultCountMany}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

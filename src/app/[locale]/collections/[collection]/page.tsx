import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { products } from '@/data/products';
import { collections, collectionById } from '@/data/collections';
import { ProductBrowser } from '@/components/product-browser';
import { Glyph } from '@/components/glyphs';

export const generateStaticParams = () =>
  locales.flatMap((locale) => collections.map((c) => ({ locale, collection: c.id })));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; collection: string }>;
}): Promise<Metadata> {
  const { locale, collection } = await params;
  if (!isLocale(locale)) return {};
  const found = collectionById(collection);
  if (!found) return {};
  return {
    title: found.name[locale],
    description: found.blurb[locale],
    alternates: {
      canonical: `/${locale}/collections/${collection}`,
      languages: {
        en: `/en/collections/${collection}`,
        ar: `/ar/collections/${collection}`,
      },
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: string; collection: string }>;
}) {
  const { locale, collection } = await params;
  if (!isLocale(locale)) notFound();
  const found = collectionById(collection);
  if (!found) notFound();

  const typed = locale as Locale;
  const dict = getDictionary(typed);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <Glyph className="text-3xl text-gold-600">{found.glyph}</Glyph>
        <h1 className="mt-2 font-display text-4xl text-ink-900">{found.name[typed]}</h1>
        <p className="mt-2 max-w-xl text-ink-500">{found.blurb[typed]}</p>
      </header>
      <ProductBrowser
        products={products}
        collections={collections}
        locale={typed}
        dict={dict}
        initialCollection={found.id}
      />
    </div>
  );
}

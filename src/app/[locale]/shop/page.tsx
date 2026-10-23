import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { products } from '@/data/products';
import { collections } from '@/data/collections';
import { ProductBrowser } from '@/components/product-browser';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.shop.title,
    description: dict.shop.subtitle,
    alternates: { canonical: `/${locale}/shop`, languages: { en: '/en/shop', ar: '/ar/shop' } },
  };
}

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-4xl text-ink-900">{dict.shop.title}</h1>
        <p className="mt-2 text-ink-500">{dict.shop.subtitle}</p>
      </header>
      <ProductBrowser products={products} collections={collections} locale={typed} dict={dict} />
    </div>
  );
}

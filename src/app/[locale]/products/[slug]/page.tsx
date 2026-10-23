import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { products } from '@/data/products';
import { collectionById } from '@/data/collections';
import { specsFor } from '@/data/specs';
import { store } from '@/config/store';
import { ProductGallery } from '@/components/product-gallery';
import { AddToCart } from '@/components/add-to-cart';
import { ProductCard } from '@/components/product-card';
import { Price, ComparePrice } from '@/components/price';
import { SpecTable } from '@/components/specs';
import { whatsappLink } from '@/config/store';

export const generateStaticParams = () =>
  locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};

  return {
    title: product.name[locale],
    description: product.tagline[locale],
    alternates: {
      canonical: `/${locale}/products/${slug}`,
      languages: { en: `/en/products/${slug}`, ar: `/ar/products/${slug}` },
    },
    openGraph: {
      type: 'website',
      title: product.name[locale],
      description: product.tagline[locale],
      images: [
        {
          /*
           * A JPEG card, not the WebP the page itself renders: WhatsApp
           * previews WebP unreliably, and a product link sent on WhatsApp is
           * the most common thing anyone will share here. Built by
           * scripts/build-og-images.mjs.
           */
          url: `/og/products/${product.slug}.jpg`,
          width: 1200,
          height: 630,
          alt: product.name[locale],
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name[locale],
      description: product.tagline[locale],
      images: [`/og/products/${product.slug}.jpg`],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const typed = locale as Locale;
  const dict = getDictionary(typed);
  const collection = collectionById(product.collection);
  const specs = specsFor(product.slug);
  const related = products
    .filter((p) => p.collection === product.collection && p.slug !== product.slug)
    .slice(0, 4);

  // Priced in USD for the feed: a structured-data price has to be a fixed
  // figure, and the visitor's currency is a client-side choice.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[typed],
    description: product.description[typed],
    image: product.images.map((src) => `${store.siteUrl}${src}`),
    brand: { '@type': 'Brand', name: 'MLA' },
    ...(specs.weightKg !== undefined
      ? { weight: { '@type': 'QuantitativeValue', value: specs.weightKg, unitCode: 'KGM' } }
      : {}),
    ...(specs.heightCm !== undefined
      ? { height: { '@type': 'QuantitativeValue', value: specs.heightCm, unitCode: 'CMT' } }
      : {}),
    ...(specs.widthCm !== undefined
      ? { width: { '@type': 'QuantitativeValue', value: specs.widthCm, unitCode: 'CMT' } }
      : {}),
    ...(specs.depthCm !== undefined
      ? { depth: { '@type': 'QuantitativeValue', value: specs.depthCm, unitCode: 'CMT' } }
      : {}),
    ...(specs.material ? { material: specs.material[typed] } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: (product.priceUsd * 1.15).toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `${store.siteUrl}/${typed}/products/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-500">
        <Link href={`/${typed}/shop`} className="underline-offset-4 hover:underline">
          {dict.shop.title}
        </Link>
        {collection ? (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/${typed}/collections/${collection.id}`}
              className="underline-offset-4 hover:underline"
            >
              {collection.name[typed]}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name[typed]} dict={dict} />

        <div>
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{product.name[typed]}</h1>
          <p className="mt-2 text-lg text-ink-500">{product.tagline[typed]}</p>

          <p className="mt-6 flex items-baseline gap-3">
            <Price
              priceUsd={product.priceUsd}
              locale={typed}
              className="font-display text-3xl text-ink-900"
            />
            {product.compareAtUsd ? (
              <ComparePrice
                priceUsd={product.compareAtUsd}
                locale={typed}
                className="text-base text-ink-500"
              />
            ) : null}
          </p>

          <div className="mt-8">
            <AddToCart slug={product.slug} dict={dict} />
          </div>

          <a
            href={whatsappLink(`${dict.contact.whatsappIntro} ${product.name[typed]}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-malachite-700 underline underline-offset-4"
          >
            {dict.product.askAbout}
          </a>

          <section className="mt-10 border-t border-papyrus-300/70 pt-8">
            <h2 className="font-display text-lg text-ink-900">{dict.product.aboutTitle}</h2>
            <p className="mt-3 leading-relaxed text-ink-700">{product.description[typed]}</p>
          </section>

          <SpecTable
            specs={specs}
            locale={typed}
            dict={dict}
            collectionName={collection?.name[typed]}
            askHref={whatsappLink(`${dict.contact.whatsappIntro} ${product.name[typed]}`)}
          />

          <p className="mt-6 rounded-sm border border-papyrus-300/70 bg-papyrus-50 px-4 py-3 text-xs leading-relaxed text-ink-500">
            {dict.product.reproductionNotice}
          </p>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-2xl text-ink-900">{dict.product.relatedTitle}</h2>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.slug}>
                <ProductCard product={item} locale={typed} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

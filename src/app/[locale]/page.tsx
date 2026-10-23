import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { products } from '@/data/products';
import { collections } from '@/data/collections';
import { ProductCard } from '@/components/product-card';
import { Glyph, GlyphFrieze } from '@/components/glyphs';
import { HeroFeature } from '@/components/hero-feature';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  const featured = products.filter((p) => p.featured).slice(0, 8);
  /**
   * The hero piece is mid-priced and instantly recognisable, not the most
   * expensive one. A AED 764 sculpture as the first thing a gift-buyer sees
   * prices the shop out of their head before they have scrolled.
   */
  const hero = products.find((p) => p.slug === 'bastet-cat-statue') ?? products[0];
  const cheapestUsd = Math.min(...products.map((p) => p.priceUsd));

  return (
    <>
      <section className="relative overflow-hidden border-b border-papyrus-300/70 bg-ink-900 text-papyrus-100">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-16 md:grid-cols-2">
          <div>
            <p className="font-display text-[11px] uppercase tracking-[0.3em] text-gold-300 sm:text-xs">
              {dict.hero.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-[1.75rem] leading-[1.15] text-papyrus-50 sm:text-4xl lg:text-5xl">
              {dict.hero.title}
            </h1>

            <HeroFeature
              product={hero}
              cheapestUsd={cheapestUsd}
              locale={typed}
              dict={dict}
            />
          </div>

          {/* Decorative on mobile, where the compact feature card does the work. */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-sm overflow-hidden rounded-sm border border-gold-400/30 bg-papyrus-50 shadow-2xl md:block">
            <Image
              src={hero.images[0]}
              alt={hero.name[typed]}
              fill
              sizes="(min-width: 768px) 24rem, 0px"
              priority
              className="object-cover"
            />
          </div>
        </div>

        <p className="border-t border-papyrus-400/15 px-4 py-3 text-center text-xs tracking-wide text-papyrus-400">
          {dict.home.shippingStrip}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <header className="mb-10 text-center">
          <h2 className="font-display text-3xl text-ink-900">{dict.home.bestsellersTitle}</h2>
          <p className="mt-2 text-ink-500">{dict.home.bestsellersBody}</p>
        </header>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {featured.map((product, index) => (
            <li key={product.slug}>
              <ProductCard product={product} locale={typed} priority={index < 2} />
            </li>
          ))}
        </ul>
      </section>

      <GlyphFrieze />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-10 text-center font-display text-3xl text-ink-900">
          {dict.home.collectionsTitle}
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link
                href={`/${typed}/collections/${collection.id}`}
                className="group block h-full rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-6 transition-colors hover:border-gold-500"
              >
                <Glyph className="text-3xl text-gold-600">{collection.glyph}</Glyph>
                <h3 className="mt-3 font-display text-xl text-ink-900 transition-colors group-hover:text-gold-600">
                  {collection.name[typed]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {collection.blurb[typed]}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-lapis-900 text-papyrus-100">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl text-papyrus-50">{dict.home.storyTitle}</h2>
          <p className="mt-5 leading-relaxed text-papyrus-200">{dict.home.storyBody}</p>
          <Link
            href={`/${typed}/story`}
            className="mt-8 inline-block rounded-sm border border-gold-300/60 px-6 py-3 font-display text-sm uppercase tracking-[0.15em] text-gold-300 transition-colors hover:bg-gold-300 hover:text-ink-900"
          >
            {dict.home.storyCta}
          </Link>
        </div>
      </section>
    </>
  );
}

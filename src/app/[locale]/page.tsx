import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { products } from '@/data/products';
import { collections } from '@/data/collections';
import { ProductCard } from '@/components/product-card';
import { Glyph, GlyphFrieze } from '@/components/glyphs';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const hero = products.find((p) => p.slug === 'anubis-grand-sculpture') ?? products[0];

  return (
    <>
      <section className="relative overflow-hidden border-b border-papyrus-300/70 bg-ink-900 text-papyrus-100">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-gold-300">
              {dict.home.heroEyebrow}
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight text-papyrus-50 sm:text-5xl">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-md leading-relaxed text-papyrus-300">{dict.home.heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${typed}/shop`}
                className="rounded-sm bg-gold-400 px-6 py-3.5 font-display text-sm uppercase tracking-[0.15em] text-ink-900 transition-colors hover:bg-gold-300"
              >
                {dict.home.heroCta}
              </Link>
              <Link
                href={`/${typed}/story`}
                className="rounded-sm border border-papyrus-400/50 px-6 py-3.5 font-display text-sm uppercase tracking-[0.15em] text-papyrus-200 transition-colors hover:border-gold-300 hover:text-gold-300"
              >
                {dict.home.heroCtaSecondary}
              </Link>
            </div>
          </div>

          {/* Framed deliberately: supplier photographs carry their own studio
              backgrounds, so a plate reads better than a floating cut-out. */}
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-sm border border-gold-400/30 bg-papyrus-50 shadow-2xl">
            <Image
              src={hero.images[0]}
              alt={hero.name[typed]}
              fill
              sizes="(min-width: 768px) 24rem, 80vw"
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

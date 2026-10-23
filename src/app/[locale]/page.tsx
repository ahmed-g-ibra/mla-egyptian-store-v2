import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { products } from '@/data/products';
import { collections } from '@/data/collections';
import { ProductCard } from '@/components/product-card';
import { Glyph, GlyphFrieze } from '@/components/glyphs';
import { Hero } from '@/components/hero';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  const featured = products.filter((p) => p.featured).slice(0, 8);
  /**
   * The hero cycles five pieces and the headline names whichever is showing,
   * so the words and the photograph always agree.
   *
   * They are chosen for distinct, instantly recognisable subjects rather than
   * by rank: the previous set drew Isis twice and included "Canopic Jars, Set
   * of Four — Verdigris", which makes an unusable headline. All five sit in
   * the gift band, and Bastet leads because the server renders index 0 and
   * opening on the AED 764 sculpture would price the shop out of a
   * gift-buyer's head before they scrolled.
   */
  const heroSlugs = [
    'bastet-cat-statue',
    'anubis-standing-statue',
    'nefertiti-bust',
    'tutankhamun-scarab-box',
    'isis-winged-statue',
  ];
  const heroPieces = heroSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  const cheapestUsd = Math.min(...products.map((p) => p.priceUsd));

  return (
    <>
      <section className="relative overflow-hidden border-b border-papyrus-300/70 bg-ink-900 text-papyrus-100">
        <Hero
          products={heroPieces}
          cheapestUsd={cheapestUsd}
          locale={typed}
          dict={dict}
        />

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

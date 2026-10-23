import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  Cinzel,
  EB_Garamond,
  Noto_Kufi_Arabic,
  Noto_Sans_Egyptian_Hieroglyphs,
} from 'next/font/google';
import { locales, isLocale, dir, htmlLang, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { defaultCurrency } from '@/lib/currency';
import { store } from '@/config/store';
import { products } from '@/data/products';
import { formatPrice } from '@/lib/currency';
import { Providers } from '@/components/providers';
import { GlyphReady } from '@/components/glyph-ready';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import '../globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cinzel',
  display: 'swap',
  preload: false,
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  display: 'swap',
  preload: false,
});

/**
 * One Arabic family rather than two. Pairing Noto Kufi with Amiri looked
 * better on the story pages and cost another ~120 KB on every Arabic route,
 * which is the wrong trade on the connections this shop actually sells over.
 * Kufi carries both the headings and the body.
 */
const kufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-kufi',
  display: 'swap',
  preload: false,
});


/**
 * Egyptian Hieroglyphs (U+13000) render as tofu on most Windows and Android
 * devices without this. next/font self-hosts it, but it is by far the heaviest
 * asset on the page, so it is loaded off the critical path.
 */
const hieroglyph = Noto_Sans_Egyptian_Hieroglyphs({
  subsets: ['egyptian-hieroglyphs'],
  weight: ['400'],
  variable: '--font-hieroglyph',
  // 260 KB for about twenty decorative signs. Never preloaded and never
  // render-blocking; the signs stay hidden until it arrives (see globals.css),
  // so a slow connection gets no tofu and no layout shift — just no ornament.
  display: 'optional',
  preload: false,
});

const fontVariables: Record<Locale, string> = {
  en: `${cinzel.variable} ${garamond.variable}`,
  ar: kufi.variable,
};

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  /*
   * The share card quotes the cheapest piece in AED. Metadata is rendered on
   * the server, where the visitor's currency is not yet known, so it uses the
   * default rather than a figure that would be wrong for half the Gulf.
   */
  const from = formatPrice(
    Math.min(...products.map((product) => product.priceUsd)),
    defaultCurrency,
    locale,
  );
  const description = dict.hero.body.replace('{from}', from);

  return {
    metadataBase: new URL(store.siteUrl),
    title: {
      default: `${dict.brand.name} — ${dict.brand.tagline}`,
      template: `%s — ${dict.brand.name}`,
    },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', ar: '/ar', 'x-default': '/en' },
    },
    openGraph: {
      type: 'website',
      siteName: dict.brand.name,
      title: `${dict.brand.name} — ${dict.brand.tagline}`,
      description,
      locale: locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: `/${locale}`,
      images: [
        {
          // JPEG, not the WebP the product photos use: WhatsApp previews are
          // unreliable with WebP and WhatsApp is where the orders come from.
          url: '/og/share.jpg',
          width: 1200,
          height: 630,
          alt: `${dict.brand.name} — ${dict.brand.tagline}`,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${dict.brand.name} — ${dict.brand.tagline}`,
      description,
      images: ['/og/share.jpg'],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const dict = getDictionary(typed);

  return (
    <html
      lang={htmlLang[typed]}
      dir={dir(typed)}
      /*
       * Only the active locale's two faces are declared. An English page never
       * references the Arabic variables, so the browser never fetches Amiri or
       * Kufi, and the Arabic page never fetches Cinzel or Garamond — halving
       * the font payload on a connection where it is the dominant cost.
       */
      className={`${fontVariables[typed]} ${hieroglyph.variable}`}
    >
      <body className="papyrus-grain min-h-dvh bg-papyrus-100 text-ink-900 antialiased">
        <GlyphReady />
        <Providers initialCurrency={defaultCurrency}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-papyrus-100"
          >
            {dict.nav.skipToContent}
          </a>
          <SiteHeader locale={typed} dict={dict} />
          <main id="main">{children}</main>
          <SiteFooter locale={typed} dict={dict} />
        </Providers>
      </body>
    </html>
  );
}

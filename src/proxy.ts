import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { currencyForCountry, isCurrency, defaultCurrency } from '@/lib/currency';

export const LOCALE_COOKIE = 'mla_locale';
export const CURRENCY_COOKIE = 'mla_currency';

const pickLocale = (request: NextRequest): Locale => {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;

  // Light Accept-Language parse: enough to catch an Arabic-first browser.
  const header = request.headers.get('accept-language') ?? '';
  for (const part of header.split(',')) {
    const tag = part.split(';')[0]?.trim().toLowerCase();
    if (!tag) continue;
    const base = tag.split('-')[0];
    if (base && isLocale(base)) return base;
  }
  return defaultLocale;
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  const response = hasLocale
    ? NextResponse.next()
    : NextResponse.redirect(
        new URL(
          `/${pickLocale(request)}${pathname === '/' ? '' : pathname}${request.nextUrl.search}`,
          request.url,
        ),
      );

  // Preselect a currency from the edge geo header. Vercel sets this; locally it
  // is absent and we fall back to the default. The visitor's own choice, once
  // made, is written to the same cookie by the picker and wins from then on.
  const existing = request.cookies.get(CURRENCY_COOKIE)?.value;
  if (!existing || !isCurrency(existing)) {
    const country = request.headers.get('x-vercel-ip-country') ?? '';
    response.cookies.set(CURRENCY_COOKIE, currencyForCountry[country] ?? defaultCurrency, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Any path whose last segment has a dot is an asset, not a page. The dot
    // has to be matched at any depth: an earlier version only caught files at
    // the root, so /icon.png was fine but /og/share.jpg was still redirected
    // to /en/og/share.jpg and 404ed.
    '/((?!api|_next/static|_next/image|products|sitemap.xml|robots.txt|.*\\.[^/]*$).*)',
  ],
};

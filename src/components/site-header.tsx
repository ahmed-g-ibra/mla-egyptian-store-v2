'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { Cartouche } from './glyphs';
import { CurrencySwitch, LocaleSwitch } from './switches';
import { CartBadge } from './cart-badge';

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  /**
   * The panel remembers which route it was opened on rather than holding a
   * boolean. Any navigation — a link, a browser back — changes `pathname` and
   * the panel is closed by derivation, with no effect and no extra render.
   */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const links = [
    { href: `/${locale}/shop`, label: dict.nav.shop },
    { href: `/${locale}/collections`, label: dict.nav.collections },
    { href: `/${locale}/story`, label: dict.nav.story },
    { href: `/${locale}/faq`, label: dict.nav.faq },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-papyrus-300/70 bg-papyrus-100/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href={`/${locale}`}
          className="shrink-0 text-ink-900 transition-colors hover:text-gold-600"
          aria-label={dict.brand.name}
        >
          {/* 48px rather than 36: below this the hieroglyphs stop resolving and
              read as a smudge rather than as signs. */}
          <Cartouche label={dict.brand.wordmark} className="h-12 w-auto" titleId="brand-cartouche" />
        </Link>

        <nav aria-label={dict.nav.menu} className="ms-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                  className={`rounded-sm px-3 py-2 text-sm tracking-wide transition-colors hover:text-gold-600 ${
                    isCurrent(link.href)
                      ? 'text-gold-600 underline decoration-gold-500 underline-offset-8'
                      : 'text-ink-800'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <div className="hidden sm:flex sm:items-center sm:gap-1">
            <CurrencySwitch locale={locale} dict={dict} />
            <LocaleSwitch locale={locale} dict={dict} />
          </div>

          <Link
            href={`/${locale}/cart`}
            className="relative rounded-sm p-2 text-ink-800 transition-colors hover:text-gold-600"
            aria-label={dict.nav.cart}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path
                d="M6 7h12l-1 13H7L6 7Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9 7a3 3 0 1 1 6 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <CartBadge />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-sm p-2 text-ink-800 transition-colors hover:text-gold-600 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? dict.nav.close : dict.nav.menu}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              {open ? (
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-papyrus-300/70 bg-papyrus-100 lg:hidden">
          <nav aria-label={dict.nav.menu} className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            <ul className="divide-y divide-papyrus-200">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent(link.href) ? 'page' : undefined}
                    className="block py-3 text-base text-ink-800 transition-colors hover:text-gold-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 py-3 sm:hidden">
              <CurrencySwitch locale={locale} dict={dict} />
              <LocaleSwitch locale={locale} dict={dict} />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

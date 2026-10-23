import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { store, whatsappLink } from '@/config/store';
import { GlyphFrieze } from './glyphs';

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const browse = [
    { href: `/${locale}/shop`, label: dict.nav.shop },
    { href: `/${locale}/collections`, label: dict.nav.collections },
    { href: `/${locale}/story`, label: dict.nav.story },
  ];
  const help = [
    { href: `/${locale}/faq`, label: dict.nav.faq },
    { href: `/${locale}/size-guide`, label: dict.specs.sizeGuide },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  return (
    <footer className="on-ink mt-24 bg-ink-900 text-papyrus-200">
      <GlyphFrieze className="pt-10" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl tracking-[0.3em] text-gold-300">
            {dict.brand.wordmark}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-papyrus-300">
            {dict.brand.tagline}
          </p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-papyrus-400">
            {dict.footer.reproductions}
          </p>
        </div>

        <nav aria-label={dict.footer.quickLinks}>
          <h2 className="font-display text-sm uppercase tracking-widest text-gold-300">
            {dict.footer.quickLinks}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {browse.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-papyrus-300 transition-colors hover:text-gold-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={dict.footer.help}>
          <h2 className="font-display text-sm uppercase tracking-widest text-gold-300">
            {dict.footer.help}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {help.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-papyrus-300 transition-colors hover:text-gold-300">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={whatsappLink(dict.contact.whatsappIntro)}
                className="text-papyrus-300 transition-colors hover:text-gold-300"
                rel="noopener noreferrer"
                target="_blank"
              >
                {dict.contact.whatsapp}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${store.email}`}
                className="break-all text-papyrus-300 transition-colors hover:text-gold-300"
              >
                {store.email}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-papyrus-400/20">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-papyrus-400 sm:px-6">
          © {store.copyrightYear} {dict.brand.name} · {store.city[locale]}, {store.country[locale]} ·{' '}
          {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}

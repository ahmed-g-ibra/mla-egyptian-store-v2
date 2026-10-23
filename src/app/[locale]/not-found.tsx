import Link from 'next/link';
import { en } from '@/i18n/dictionaries/en';
import { Glyph } from '@/components/glyphs';

/**
 * Rendered inside the locale layout, so the chrome and direction are already
 * right. The copy stays English: this file cannot read the route params.
 */
export default function LocaleNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-28 text-center sm:px-6">
      <Glyph className="text-4xl text-gold-600" width={2}>
        𓂋𓏤
      </Glyph>
      <h1 className="mt-5 font-display text-3xl text-ink-900">{en.common.notFoundTitle}</h1>
      <p className="mt-3 text-ink-700">{en.common.notFoundBody}</p>
      <Link
        href="/en/shop"
        className="mt-8 inline-block rounded-sm bg-ink-900 px-6 py-3 font-display text-sm uppercase tracking-[0.15em] text-papyrus-100 transition-colors hover:bg-lapis-800"
      >
        {en.shop.title}
      </Link>
    </div>
  );
}

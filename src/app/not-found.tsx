import Link from 'next/link';
import { en } from '@/i18n/dictionaries/en';
import './globals.css';

/**
 * Root-level 404: reached for paths outside any locale, so it has to render its
 * own document.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-papyrus-100 text-ink-900">
        <div className="px-6 text-center">
          <h1 className="font-display text-3xl">{en.common.notFoundTitle}</h1>
          <p className="mt-3 text-ink-700">{en.common.notFoundBody}</p>
          <Link href="/en" className="mt-8 inline-block underline underline-offset-4">
            {en.common.backHome}
          </Link>
        </div>
      </body>
    </html>
  );
}

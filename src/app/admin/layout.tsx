import type { ReactNode } from 'react';
import { Cinzel, EB_Garamond } from 'next/font/google';
import '../globals.css';

/**
 * The admin page is outside the storefront's [locale] tree, so it renders its
 * own document. It is English only and always left-to-right: it is one
 * person's back office, not a shopfront.
 */
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${cinzel.variable} ${garamond.variable}`}>
      <body className="bg-papyrus-100 text-ink-900 antialiased">{children}</body>
    </html>
  );
}

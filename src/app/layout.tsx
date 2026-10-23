import type { ReactNode } from 'react';

/**
 * Pass-through. The real document — <html lang> and <body dir> — is rendered by
 * app/[locale]/layout.tsx, which is the first point at which the locale is known.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

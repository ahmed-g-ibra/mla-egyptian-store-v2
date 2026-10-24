import Link from 'next/link';
import type { ReactNode } from 'react';
import { logout } from './actions';

/**
 * The frame every admin screen sits in. Deliberately plain: this is the room
 * he works in rather than a page anyone is being sold to.
 */
export function Shell({
  children,
  signedIn = false,
  weakPassword = false,
}: {
  children: ReactNode;
  signedIn?: boolean;
  weakPassword?: boolean;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-papyrus-300/70 pb-5 print:hidden">
        <Link href="/admin" className="group flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-[0.12em] text-ink-900">MLA</span>
          <span className="text-sm uppercase tracking-[0.2em] text-ink-500 transition-colors group-hover:text-gold-600">
            Orders
          </span>
        </Link>
        {signedIn ? (
          <form action={logout}>
            <button
              type="submit"
              className="min-h-9 cursor-pointer text-sm font-medium text-ink-500 underline underline-offset-4 transition-colors hover:text-carnelian-600"
            >
              Sign out
            </button>
          </form>
        ) : null}
      </header>

      {weakPassword ? (
        <p className="mt-5 rounded-sm border border-carnelian-600/40 bg-carnelian-600/5 px-4 py-3 text-sm leading-relaxed text-carnelian-700 print:hidden">
          This password would not survive anyone trying, and this page is on a
          public URL with your customers&rsquo; names, phones and addresses on
          it. Change <code className="font-mono">ADMIN_PASSWORD</code> in Vercel
          before you take a real order.
        </p>
      ) : null}

      {children}
    </main>
  );
}

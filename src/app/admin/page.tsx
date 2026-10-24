import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { currencyMeta, formatPrice } from '@/lib/currency';
import { adminIsConfigured, adminPasswordIsWeak, isSignedIn } from '@/lib/orders/auth';
import { getOrderStore } from '@/lib/orders/store';
import { statusLabel, statusTone } from '@/lib/orders/labels';
import { ORDER_STATUSES, type OrderStatus, type StoredOrder } from '@/lib/orders/types';
import { LoginForm } from './LoginForm';
import { Shell } from './Shell';

export const metadata: Metadata = {
  title: 'Orders — MLA',
  robots: { index: false, follow: false },
};

type Search = { status?: string; q?: string };

/**
 * Everything on these screens reads the session cookie and the database, so
 * none of it can be prerendered. Under `cacheComponents` the Suspense boundary
 * is how you say that — there is no route segment config to set.
 */
export default function AdminPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

/* ------------------------------- the screen ------------------------------- */

async function Dashboard({ searchParams }: { searchParams: Promise<Search> }) {
  // Request time, explicitly. Everything below reads the session cookie and the
  // database, and `isSignedIn` reads the clock — under `cacheComponents` Next
  // will otherwise try to prerender this and complain about the unstable value.
  await connection();

  const store = getOrderStore();
  const missing: string[] = [];
  if (!store) missing.push('DATABASE_URL');
  if (!adminIsConfigured()) missing.push('ADMIN_PASSWORD (8 characters or more)');
  if (missing.length > 0) return <Setup missing={missing} />;

  if (!(await isSignedIn())) {
    return (
      <Shell>
        <h1 className="mt-8 font-display text-2xl text-ink-900">Sign in</h1>
        <LoginForm />
      </Shell>
    );
  }

  const { status, q } = await searchParams;
  const all = await store!.list();

  const needle = (q ?? '').trim().toLowerCase();
  const digits = needle.replace(/\D/g, '');
  const matches = (order: StoredOrder) =>
    !needle ||
    order.reference.toLowerCase().includes(needle) ||
    order.customer.name.toLowerCase().includes(needle) ||
    order.customer.email.toLowerCase().includes(needle) ||
    order.customer.city.toLowerCase().includes(needle) ||
    (digits.length >= 3 && order.customer.phone.replace(/\D/g, '').includes(digits));

  const shown = all
    .filter(matches)
    .filter((order) => !status || status === 'all' || order.status === status);

  const counts = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, all.filter((order) => order.status === s).length]),
  ) as Record<OrderStatus, number>;

  // Anything not yet handed to a courier is something he still has to do.
  const waiting = counts.new + counts.confirmed + counts.paid;
  const earnedUsd = all
    .filter((order) => order.status === 'delivered')
    .reduce((sum, order) => sum + order.totalUsd, 0);
  const owedUsd = all
    .filter((order) => order.status === 'confirmed')
    .reduce((sum, order) => sum + order.totalUsd, 0);

  const rials = (usd: number) =>
    formatPrice(usd * currencyMeta.OMR.rate, 'OMR', 'en', { convertFirst: false });

  const keep = (next: Partial<Search>) => {
    const params = new URLSearchParams();
    const merged = { status, q, ...next };
    if (merged.status && merged.status !== 'all') params.set('status', merged.status);
    if (merged.q) params.set('q', merged.q);
    const query = params.toString();
    return query ? `/admin?${query}` : '/admin';
  };

  return (
    <Shell signedIn weakPassword={adminPasswordIsWeak()}>
      <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Needs you" value={String(waiting)} hint="not shipped yet" accent />
        <Tile label="In transit" value={String(counts.shipped)} hint="with the courier" />
        <Tile label="Delivered" value={String(counts.delivered)} hint={rials(earnedUsd)} />
        <Tile label="Awaiting payment" value={String(counts.confirmed)} hint={rials(owedUsd)} />
      </section>

      <form className="mt-7 flex gap-2" action="/admin">
        {status && status !== 'all' ? (
          <input type="hidden" name="status" value={status} />
        ) : null}
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Reference, name, phone or city"
          aria-label="Search orders"
          className="min-h-11 flex-1 rounded-sm border border-papyrus-300 bg-papyrus-50 px-3 py-2 text-ink-900 transition-colors focus-visible:border-gold-500"
        />
        <button
          type="submit"
          className="min-h-11 cursor-pointer rounded-sm border border-lapis-700 px-5 font-display text-sm uppercase tracking-[0.12em] text-lapis-800 transition-colors hover:bg-lapis-800 hover:text-papyrus-50"
        >
          Search
        </button>
        {needle ? (
          <Link
            href={keep({ q: '' })}
            className="inline-flex min-h-11 items-center px-3 text-sm text-ink-500 underline underline-offset-4 hover:text-carnelian-600"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Filter by status">
        {(['all', ...ORDER_STATUSES] as const).map((s) => (
          <Link
            key={s}
            href={keep({ status: s })}
            className={`min-h-9 rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? 'all') === s
                ? 'border-lapis-700 bg-lapis-800 text-papyrus-50'
                : 'border-papyrus-300 text-ink-700 hover:border-lapis-600'
            }`}
          >
            {s === 'all' ? `All ${all.length}` : `${statusLabel[s]} ${counts[s]}`}
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <p className="mt-12 text-ink-500">
          {all.length === 0
            ? 'No orders yet. The next one placed on the site lands here.'
            : 'Nothing matches that.'}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-papyrus-300/70 border-y border-papyrus-300/70">
          {shown.map((order) => (
            <li key={order.reference}>
              {/* On a phone this stacks to reference + total, then who it is,
                  then how old it is; `order-*` rearranges the same four cells
                  into one line on a wider screen. */}
              <Link
                href={`/admin/${order.reference}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-4 transition-colors hover:bg-papyrus-50 sm:grid-cols-[12rem_1fr_auto_7rem]"
              >
                <span
                  className="font-mono text-sm tracking-[0.08em] text-lapis-800 sm:order-1"
                  dir="ltr"
                >
                  {order.reference}
                </span>
                <span
                  className="text-end text-sm font-medium tabular-nums text-ink-900 sm:order-3"
                  dir="ltr"
                >
                  {formatPrice(order.total, order.currency, 'en', { convertFirst: false })}
                </span>
                <span className="col-span-2 text-sm text-ink-700 sm:order-2 sm:col-span-1">
                  {order.customer.name}
                  <span className="text-ink-500">
                    {' · '}
                    {order.customer.city} · {pieces(order)}
                  </span>
                </span>
                <span className="col-span-2 flex items-center justify-end gap-3 sm:order-4 sm:col-span-1">
                  <span className="text-xs text-ink-500">{ago(order.placedAt)}</span>
                  <span
                    className={`inline-block rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusTone[order.status]}`}
                  >
                    {statusLabel[order.status]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-500">
        <p>Showing the 500 most recent orders.</p>
        {/* A real navigation, not a client one: this response is a download,
            and <Link> would try to render it as a page. */}
        <a
          href="/admin/export"
          download
          className="underline underline-offset-4 transition-colors hover:text-lapis-800"
        >
          Download all orders as CSV
        </a>
      </div>
    </Shell>
  );
}

/* --------------------------------- pieces -------------------------------- */

function Tile({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-sm border p-4 ${
        accent && value !== '0'
          ? 'border-gold-400 bg-gold-200/40'
          : 'border-papyrus-300/70 bg-papyrus-50'
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums text-ink-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

function Setup({ missing }: { missing: string[] }) {
  return (
    <Shell>
      <p className="mt-8 text-ink-700">
        Not set up yet. Add these in Vercel → the project → Settings →
        Environment Variables, then redeploy:
      </p>
      <ul className="mt-4 space-y-3">
        {missing.map((item) => (
          <li key={item} className="rounded-sm border border-papyrus-300 bg-papyrus-50 p-3">
            <code className="font-mono text-sm font-semibold text-lapis-800">{item}</code>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ink-500">
        Until then the shop takes orders over WhatsApp exactly as before — they
        are simply not recorded. ORDERS.md in the repository has the steps.
      </p>
    </Shell>
  );
}

const pieces = (order: StoredOrder) => {
  const total = order.lines.reduce((sum, line) => sum + line.qty, 0);
  return `${total} ${total === 1 ? 'piece' : 'pieces'}`;
};

/** Rough and readable: how long an order has been sitting there. */
function ago(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

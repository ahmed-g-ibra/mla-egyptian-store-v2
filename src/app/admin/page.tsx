import type { Metadata } from 'next';
import { Suspense } from 'react';
import { currencyMeta, formatPrice } from '@/lib/currency';
import { adminIsConfigured, isSignedIn } from '@/lib/orders/auth';
import { getOrderStore } from '@/lib/orders/store';
import { statusLabel } from '@/lib/orders/labels';
import { ORDER_STATUSES, OPEN_STATUSES, type OrderStatus } from '@/lib/orders/types';
import { logout } from './actions';
import { LoginForm } from './LoginForm';
import { OrderCard } from './OrderCard';

export const metadata: Metadata = {
  title: 'Orders — MLA',
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink-900">Orders</h1>
      <span className="mt-3 block h-px w-24 bg-gold-500/60" />
      {children}
    </main>
  );
}

function Setup({ missing }: { missing: string[] }) {
  return (
    <Shell>
      <p className="mt-6 text-ink-700">
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

/**
 * Everything here reads the session cookie and the database, so none of it can
 * be prerendered. The Suspense boundary is what tells Next that, rather than a
 * route segment config — this app runs with `cacheComponents`, where the
 * boundary is the opt-out.
 */
export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const store = getOrderStore();
  const missing: string[] = [];
  if (!store) missing.push('DATABASE_URL');
  if (!adminIsConfigured()) missing.push('ADMIN_PASSWORD (12 characters or more)');
  if (missing.length > 0) return <Setup missing={missing} />;

  if (!(await isSignedIn())) {
    return (
      <Shell>
        <LoginForm />
      </Shell>
    );
  }

  const { status } = await searchParams;
  const all = await store!.list();
  const shown =
    status && status !== 'all' ? all.filter((order) => order.status === status) : all;

  const open = all.filter((order) => OPEN_STATUSES.includes(order.status));
  // Delivered is the only status that means money actually came in.
  const takenUsd = all
    .filter((order) => order.status === 'delivered')
    .reduce((sum, order) => sum + order.totalUsd, 0);
  const taken = formatPrice(takenUsd * currencyMeta.OMR.rate, 'OMR', 'en', {
    convertFirst: false,
  });

  const counts = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, all.filter((order) => order.status === s).length]),
  ) as Record<OrderStatus, number>;

  return (
    <Shell>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <span className="text-ink-700">
          <strong className="text-ink-900">{all.length}</strong> recorded
        </span>
        <span className="text-ink-700">
          <strong className="text-ink-900">{open.length}</strong> still open
        </span>
        <span className="text-ink-700">
          delivered: <strong className="tabular-nums text-ink-900">{taken}</strong>
        </span>
        <form action={logout} className="ms-auto">
          <button
            type="submit"
            className="min-h-9 cursor-pointer text-sm font-medium text-ink-500 underline underline-offset-4 transition-colors hover:text-carnelian-600"
          >
            Sign out
          </button>
        </form>
      </div>

      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Filter by status">
        {(['all', ...ORDER_STATUSES] as const).map((s) => (
          <a
            key={s}
            href={s === 'all' ? '/admin' : `/admin?status=${s}`}
            className={`min-h-9 rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? 'all') === s
                ? 'border-lapis-700 bg-lapis-800 text-papyrus-50'
                : 'border-papyrus-300 text-ink-700 hover:border-lapis-600'
            }`}
          >
            {s === 'all' ? `All ${all.length}` : `${statusLabel[s]} ${counts[s]}`}
          </a>
        ))}
      </nav>

      {shown.length === 0 ? (
        <p className="mt-10 text-ink-500">
          {all.length === 0
            ? 'No orders yet. The next one placed on the site lands here.'
            : 'Nothing with that status.'}
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {shown.map((order) => (
            <OrderCard key={order.reference} order={order} />
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-ink-500">
        Showing the 500 most recent orders. Statuses and notes are saved the
        moment you click.
      </p>
    </Shell>
  );
}

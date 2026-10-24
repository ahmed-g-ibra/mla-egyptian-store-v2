import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { store as shop } from '@/config/store';
import { formatPrice } from '@/lib/currency';
import { adminIsConfigured, isSignedIn } from '@/lib/orders/auth';
import { getOrderStore } from '@/lib/orders/store';

export const metadata: Metadata = {
  title: 'Packing slip — MLA',
  robots: { index: false, follow: false },
};

export default function SlipPage({ params }: { params: Promise<{ reference: string }> }) {
  return (
    <Suspense fallback={null}>
      <Slip params={params} />
    </Suspense>
  );
}

/**
 * The sheet that goes in the box.
 *
 * It names every piece as a **contemporary reproduction**, because this is the
 * paper a customs officer reads. Nothing shipped from here may be described as
 * an antique or an artifact: genuine antiquities are Egyptian state property
 * under Law 117 of 1983, and a parcel declared as one invites seizure.
 */
async function Slip({ params }: { params: Promise<{ reference: string }> }) {
  // Request time, explicitly. Everything below reads the session cookie and the
  // database, and `isSignedIn` reads the clock — under `cacheComponents` Next
  // will otherwise try to prerender this and complain about the unstable value.
  await connection();

  const orders = getOrderStore();
  if (!orders || !adminIsConfigured() || !(await isSignedIn())) notFound();

  const { reference } = await params;
  const order = await orders.get(decodeURIComponent(reference).toUpperCase());
  if (!order) notFound();

  const money = (amount: number) =>
    formatPrice(amount, order.currency, 'en', { convertFirst: false });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 print:px-0 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/admin/${order.reference}`}
          className="text-sm text-ink-500 underline underline-offset-4 hover:text-lapis-800"
        >
          ← Back to the order
        </Link>
        <p className="text-xs text-ink-500">Print this page (⌘P) onto the box.</p>
      </div>

      <article className="mt-6 border border-papyrus-300 bg-papyrus-50 p-8 print:border-0 print:bg-white print:p-0">
        <header className="flex items-start justify-between gap-6 border-b border-papyrus-300 pb-5">
          <div>
            <p className="font-display text-2xl tracking-[0.18em] text-ink-900">MLA</p>
            <p className="mt-1 text-xs text-ink-500">
              {shop.city.en}, {shop.country.en} · {shop.phoneDisplay}
            </p>
          </div>
          <div className="text-end">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-500">Packing slip</p>
            <p className="mt-1 font-mono text-lg tracking-[0.1em] text-ink-900" dir="ltr">
              {order.reference}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              {new Intl.DateTimeFormat('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(order.placedAt))}
            </p>
          </div>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-500">Deliver to</p>
            <p className="mt-2 font-medium text-ink-900">{order.customer.name}</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
              {order.customer.address}
              {'\n'}
              {order.customer.city}, {order.customer.country}
            </p>
            <p className="mt-1 text-sm text-ink-700" dir="ltr">
              {order.customer.phone}
            </p>
          </div>
          {order.tracking ? (
            <div className="sm:text-end">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-500">Tracking</p>
              <p className="mt-2 font-mono text-sm text-ink-900" dir="ltr">
                {order.tracking}
              </p>
            </div>
          ) : null}
        </section>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-papyrus-300 text-[11px] uppercase tracking-[0.14em] text-ink-500">
              <th className="py-2 text-start font-medium">Piece</th>
              <th className="py-2 text-end font-medium">Qty</th>
              <th className="py-2 text-end font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.slug} className="border-b border-papyrus-200">
                <td className="py-2.5 text-ink-800">
                  {line.name}
                  <span className="block text-xs text-ink-500">Contemporary reproduction</span>
                </td>
                <td className="py-2.5 text-end tabular-nums text-ink-800" dir="ltr">
                  {line.qty}
                </td>
                <td className="py-2.5 text-end tabular-nums text-ink-800" dir="ltr">
                  {money(line.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-3 text-end text-ink-500">
                Shipping
              </td>
              <td className="pt-3 text-end tabular-nums text-ink-800" dir="ltr">
                {order.shipping === 0 ? 'Free' : money(order.shipping)}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="pt-1 text-end font-semibold text-ink-900">
                Total
              </td>
              <td className="pt-1 text-end font-semibold tabular-nums text-ink-900" dir="ltr">
                {money(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 border-t border-papyrus-300 pt-4 text-xs leading-relaxed text-ink-500">
          Every piece in this parcel is a <strong>contemporary reproduction</strong>{' '}
          made in Egypt. Nothing here is an antiquity, and it must not be
          declared as one on any customs document.
        </p>
        <p className="mt-3 text-xs text-ink-500">
          Thank you — questions on {shop.phoneDisplay} or {shop.email}.
        </p>
      </article>
    </main>
  );
}

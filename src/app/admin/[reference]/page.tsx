import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { products } from '@/data/products';
import { formatPrice } from '@/lib/currency';
import { adminIsConfigured, adminPasswordIsWeak, isSignedIn } from '@/lib/orders/auth';
import { getOrderStore } from '@/lib/orders/store';
import { nextStatus, statusLabel, statusTone, STATUS_FLOW } from '@/lib/orders/labels';
import { customerChatLink, orderUrl } from '@/lib/orders/messages';
import { ORDER_STATUSES, type StoredOrder } from '@/lib/orders/types';
import { addNote, advanceStatus, updateStatus, updateTracking } from '../actions';
import { CopyButton } from '../CopyButton';
import { Shell } from '../Shell';

export const metadata: Metadata = {
  title: 'Order — MLA',
  robots: { index: false, follow: false },
};

export default function OrderAdminPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <OrderScreen params={params} />
    </Suspense>
  );
}

async function OrderScreen({ params }: { params: Promise<{ reference: string }> }) {
  // Request time, explicitly. Everything below reads the session cookie and the
  // database, and `isSignedIn` reads the clock — under `cacheComponents` Next
  // will otherwise try to prerender this and complain about the unstable value.
  await connection();

  const store = getOrderStore();
  if (!store || !adminIsConfigured() || !(await isSignedIn())) notFound();

  const { reference } = await params;
  const order = await store.get(decodeURIComponent(reference).toUpperCase());
  if (!order) notFound();

  const money = (amount: number) =>
    formatPrice(amount, order.currency, 'en', { convertFirst: false });
  const next = nextStatus[order.status];
  const address = [
    order.customer.name,
    order.customer.address,
    `${order.customer.city}, ${order.customer.country}`,
    order.customer.phone,
  ].join('\n');

  return (
    <Shell signedIn weakPassword={adminPasswordIsWeak()}>
      <Link
        href="/admin"
        className="mt-6 inline-block text-sm text-ink-500 underline underline-offset-4 transition-colors hover:text-lapis-800 print:hidden"
      >
        ← All orders
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-papyrus-300/70 pb-6">
        <div>
          <h1 className="font-mono text-2xl tracking-[0.1em] text-lapis-800" dir="ltr">
            {order.reference}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Placed {when(order.placedAt)} · read in {order.locale === 'ar' ? 'Arabic' : 'English'} ·
            updated {when(order.updatedAt)}
          </p>
        </div>
        <div className="text-end">
          <p className="font-display text-3xl font-semibold tabular-nums text-ink-900" dir="ltr">
            {money(order.total)}
          </p>
          <span
            className={`mt-2 inline-block rounded-sm border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusTone[order.status]}`}
          >
            {statusLabel[order.status]}
          </span>
        </div>
      </header>

      <Pipeline order={order} />

      {/* ------------------------------- actions ------------------------------ */}

      <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
        {next ? (
          <form action={advanceStatus}>
            <input type="hidden" name="reference" value={order.reference} />
            <input type="hidden" name="from" value={order.status} />
            <button
              type="submit"
              className="min-h-12 cursor-pointer rounded-sm bg-lapis-800 px-6 py-3 font-display text-sm uppercase tracking-[0.12em] text-papyrus-50 transition-colors hover:bg-lapis-700"
            >
              Mark as {statusLabel[next].toLowerCase()}
            </button>
          </form>
        ) : null}

        <a
          href={customerChatLink(order)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-malachite-600 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-malachite-700 transition-colors hover:bg-malachite-600 hover:text-papyrus-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.6-.1 1.4Z" />
          </svg>
          Send the update
        </a>

        <Link
          href={`/admin/${order.reference}/slip`}
          className="inline-flex min-h-12 items-center rounded-sm border border-papyrus-400 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-ink-700 transition-colors hover:border-lapis-600 hover:text-lapis-800"
        >
          Packing slip
        </Link>
      </div>

      <p className="mt-3 max-w-xl text-xs leading-relaxed text-ink-500 print:hidden">
        “Send the update” opens WhatsApp with a message already written in the
        language this customer was reading, carrying the status, the tracking
        number and their order link. Nothing is sent until you press send.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          {/* -------------------------------- items ------------------------------- */}

          <h2 className="font-display text-xl text-ink-900">Pieces</h2>
          <span className="mt-2 block h-px w-16 bg-gold-500/60" />
          <ul className="mt-4 divide-y divide-papyrus-300/70 border-y border-papyrus-300/70">
            {order.lines.map((line) => {
              const product = products.find((p) => p.slug === line.slug);
              return (
                <li key={line.slug} className="flex items-center gap-4 py-4">
                  {product ? (
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-papyrus-300/60 bg-papyrus-50">
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block text-ink-900">{line.name}</span>
                    <span className="block text-sm text-ink-500" dir="ltr">
                      {money(line.unit)} × {line.qty}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-900" dir="ltr">
                    {money(line.total)}
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-4 ms-auto max-w-xs space-y-2 text-sm">
            <Row term="Subtotal" value={money(order.subtotal)} />
            <Row
              term="Shipping"
              value={order.shipping === 0 ? 'Free' : money(order.shipping)}
            />
            <div className="flex items-baseline justify-between border-t border-papyrus-300/70 pt-2">
              <dt className="font-display text-lg text-ink-900">Total</dt>
              <dd className="font-display text-lg font-semibold tabular-nums text-ink-900" dir="ltr">
                {money(order.total)}
              </dd>
            </div>
          </dl>

          {/* -------------------------------- notes ------------------------------- */}

          <h2 className="mt-12 font-display text-xl text-ink-900">Notes</h2>
          <span className="mt-2 block h-px w-16 bg-gold-500/60" />

          {order.notes.length > 0 ? (
            <ul className="mt-4 space-y-3 border-s-2 border-papyrus-300 ps-4">
              {order.notes.map((note) => (
                <li key={note.id}>
                  <p className="text-ink-800">{note.body}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{when(note.createdAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-500">Nothing written down yet.</p>
          )}

          <form action={addNote} className="mt-4 flex flex-wrap items-end gap-3 print:hidden">
            <label className="min-w-48 flex-1">
              <span className="sr-only">Add a note</span>
              <input
                name="note"
                placeholder="What was agreed, when it goes out, why it was cancelled"
                className="w-full rounded-sm border border-papyrus-300 bg-papyrus-50 px-3 py-2.5 text-sm text-ink-900 transition-colors focus-visible:border-gold-500"
              />
            </label>
            <input type="hidden" name="reference" value={order.reference} />
            <button
              type="submit"
              className="min-h-11 cursor-pointer rounded-sm border border-papyrus-400 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-lapis-600 hover:text-lapis-800"
            >
              Add
            </button>
          </form>
        </div>

        {/* ------------------------------- sidebar ------------------------------ */}

        <aside className="space-y-8">
          <section className="rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-5">
            <h2 className="font-display text-lg text-ink-900">Customer</h2>
            <p className="mt-3 font-medium text-ink-900">{order.customer.name}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">
              {order.customer.address}
              {'\n'}
              {order.customer.city}, {order.customer.country}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <a
                  href={`https://api.whatsapp.com/send?phone=${order.customer.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-malachite-700 underline underline-offset-4"
                  dir="ltr"
                >
                  {order.customer.phone}
                </a>
              </p>
              <p className="break-all">
                <a
                  href={`mailto:${order.customer.email}?subject=${encodeURIComponent(`Order ${order.reference}`)}`}
                  className="text-ink-700 underline underline-offset-4"
                >
                  {order.customer.email}
                </a>
              </p>
            </div>
            <p className="mt-3 print:hidden">
              <CopyButton text={address} />
            </p>
          </section>

          <section className="rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-5 print:hidden">
            <h2 className="font-display text-lg text-ink-900">Tracking</h2>
            <form action={updateTracking} className="mt-3">
              <input type="hidden" name="reference" value={order.reference} />
              <input
                name="tracking"
                defaultValue={order.tracking ?? ''}
                placeholder="Courier reference"
                dir="ltr"
                className="w-full rounded-sm border border-papyrus-300 bg-papyrus-50 px-3 py-2.5 font-mono text-sm text-ink-900 transition-colors focus-visible:border-gold-500"
              />
              <button
                type="submit"
                className="mt-3 min-h-10 w-full cursor-pointer rounded-sm border border-lapis-700 px-4 py-2 text-sm font-medium text-lapis-800 transition-colors hover:bg-lapis-800 hover:text-papyrus-50"
              >
                Save
              </button>
            </form>
            <p className="mt-2 text-xs text-ink-500">The customer sees this on their order page.</p>
          </section>

          <section className="print:hidden">
            <h2 className="font-display text-lg text-ink-900">Set the status</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {ORDER_STATUSES.map((s) => (
                <form key={s} action={updateStatus}>
                  <input type="hidden" name="reference" value={order.reference} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    disabled={s === order.status}
                    className={`min-h-9 cursor-pointer rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                      s === order.status
                        ? `${statusTone[s]} cursor-default font-semibold`
                        : 'border-papyrus-300 text-ink-700 hover:border-lapis-600 hover:text-lapis-800'
                    }`}
                  >
                    {statusLabel[s]}
                  </button>
                </form>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-500">
              For going back a step or cancelling. The button at the top is the
              normal way forward.
            </p>
          </section>

          <section className="print:hidden">
            <h2 className="font-display text-lg text-ink-900">Their link</h2>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              The page this customer sees, with the status and tracking on it.
            </p>
            <a
              href={orderUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all text-xs text-lapis-800 underline underline-offset-4"
            >
              {orderUrl(order)}
            </a>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

/* --------------------------------- pieces -------------------------------- */

/** The happy path as a line, so where an order has got to is one glance. */
function Pipeline({ order }: { order: StoredOrder }) {
  if (order.status === 'cancelled') {
    return (
      <p className="mt-6 rounded-sm border border-carnelian-600/40 bg-carnelian-600/5 px-4 py-3 text-sm text-carnelian-700">
        This order was cancelled. It is kept on the books rather than deleted.
      </p>
    );
  }

  const reached = STATUS_FLOW.indexOf(order.status);

  return (
    <ol className="mt-6 flex flex-wrap items-center gap-x-1 gap-y-2">
      {STATUS_FLOW.map((step, index) => {
        const done = index <= reached;
        return (
          <li key={step} className="flex items-center gap-1">
            <span
              className={`rounded-sm px-2.5 py-1 text-xs font-medium tracking-[0.06em] ${
                index === reached
                  ? 'bg-lapis-800 text-papyrus-50'
                  : done
                    ? 'bg-papyrus-200 text-ink-700'
                    : 'text-ink-500'
              }`}
            >
              {statusLabel[step]}
            </span>
            {index < STATUS_FLOW.length - 1 ? (
              <span className={done ? 'text-lapis-700' : 'text-papyrus-300'} aria-hidden>
                →
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-500">{term}</dt>
      <dd className="tabular-nums text-ink-900" dir="ltr">
        {value}
      </dd>
    </div>
  );
}

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

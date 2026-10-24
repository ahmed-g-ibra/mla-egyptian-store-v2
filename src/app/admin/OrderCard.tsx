import { formatPrice } from '@/lib/currency';
import { statusLabel, statusTone } from '@/lib/orders/labels';
import { ORDER_STATUSES, type StoredOrder } from '@/lib/orders/types';
import { addNote, updateStatus, updateTracking } from './actions';

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

/** Digits only, so a number typed as "+968 7717 0373" still opens a chat. */
const waNumber = (phone: string) => phone.replace(/\D/g, '');

export function OrderCard({ order }: { order: StoredOrder }) {
  const money = (amount: number) =>
    formatPrice(amount, order.currency, 'en', { convertFirst: false });

  const field =
    'w-full rounded-sm border border-papyrus-300 bg-papyrus-50 px-3 py-2 text-sm text-ink-900 focus-visible:border-gold-500';

  return (
    <article className="rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-5">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <p className="font-mono text-lg tracking-[0.1em] text-lapis-800" dir="ltr">
            {order.reference}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            Placed {when(order.placedAt)} · {order.locale.toUpperCase()} · updated{' '}
            {when(order.updatedAt)}
          </p>
        </div>
        <div className="text-end">
          <p className="font-display text-xl font-semibold tabular-nums text-ink-900" dir="ltr">
            {money(order.total)}
          </p>
          <span
            className={`mt-1 inline-block rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusTone[order.status]}`}
          >
            {statusLabel[order.status]}
          </span>
        </div>
      </header>

      {/* ---------------------------------- who --------------------------------- */}

      <div className="mt-5 grid gap-x-8 gap-y-2 border-t border-papyrus-300/70 pt-4 text-sm sm:grid-cols-2">
        <p className="font-medium text-ink-900">{order.customer.name}</p>
        <p className="text-ink-700 sm:text-end">
          <a
            href={`https://api.whatsapp.com/send?phone=${waNumber(order.customer.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-malachite-700 underline underline-offset-4"
            dir="ltr"
          >
            {order.customer.phone}
          </a>
        </p>
        <p className="text-ink-700">
          {order.customer.address}, {order.customer.city}, {order.customer.country}
        </p>
        <p className="break-all text-ink-700 sm:text-end">
          <a href={`mailto:${order.customer.email}`} className="underline underline-offset-4">
            {order.customer.email}
          </a>
        </p>
      </div>

      {/* --------------------------------- lines -------------------------------- */}

      <ul className="mt-4 space-y-1.5 border-t border-papyrus-300/70 pt-4 text-sm">
        {order.lines.map((line) => (
          <li key={line.slug} className="flex justify-between gap-4">
            <span className="text-ink-700">
              {line.name} <span className="text-ink-500">× {line.qty}</span>
            </span>
            <span className="shrink-0 tabular-nums text-ink-900" dir="ltr">
              {money(line.total)}
            </span>
          </li>
        ))}
        <li className="flex justify-between gap-4 pt-1 text-ink-500">
          <span>Shipping</span>
          <span className="tabular-nums" dir="ltr">
            {order.shipping === 0 ? 'Free' : money(order.shipping)}
          </span>
        </li>
      </ul>

      {/* -------------------------------- status -------------------------------- */}

      <div className="mt-5 border-t border-papyrus-300/70 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <form key={status} action={updateStatus}>
              <input type="hidden" name="reference" value={order.reference} />
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                disabled={status === order.status}
                className={`min-h-9 cursor-pointer rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                  status === order.status
                    ? `${statusTone[status]} cursor-default font-semibold`
                    : 'border-papyrus-300 text-ink-700 hover:border-lapis-600 hover:text-lapis-800'
                }`}
              >
                {statusLabel[status]}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* ------------------------------- tracking ------------------------------- */}

      <form action={updateTracking} className="mt-5 flex flex-wrap items-end gap-3">
        <label className="min-w-48 flex-1">
          <span className="block text-xs font-medium uppercase tracking-wide text-ink-500">
            Tracking number
          </span>
          <input
            name="tracking"
            defaultValue={order.tracking ?? ''}
            placeholder="Courier reference — the customer sees this"
            className={`mt-2 ${field}`}
            dir="ltr"
          />
        </label>
        <input type="hidden" name="reference" value={order.reference} />
        <button
          type="submit"
          className="min-h-10 cursor-pointer rounded-sm border border-lapis-700 px-4 py-2 text-sm font-medium text-lapis-800 transition-colors hover:bg-lapis-800 hover:text-papyrus-50"
        >
          Save
        </button>
      </form>

      {/* --------------------------------- notes -------------------------------- */}

      {order.notes.length > 0 ? (
        <ul className="mt-5 space-y-2 border-t border-papyrus-300/70 pt-4">
          {order.notes.map((note) => (
            <li key={note.id} className="text-sm">
              <span className="text-ink-700">{note.body}</span>
              <span className="ms-2 text-xs text-ink-500">{when(note.createdAt)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <form action={addNote} className="mt-3 flex flex-wrap items-end gap-3">
        <label className="min-w-48 flex-1">
          <span className="block text-xs font-medium uppercase tracking-wide text-ink-500">
            Add a note
          </span>
          <input
            name="note"
            placeholder="What was agreed, when it goes out, why it was cancelled"
            className={`mt-2 ${field}`}
          />
        </label>
        <input type="hidden" name="reference" value={order.reference} />
        <button
          type="submit"
          className="min-h-10 cursor-pointer rounded-sm border border-papyrus-400 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-lapis-600 hover:text-lapis-800"
        >
          Add
        </button>
      </form>
    </article>
  );
}

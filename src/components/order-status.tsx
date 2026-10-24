'use client';

import { useEffect, useState } from 'react';
import { statusTone } from '@/lib/orders/labels';
import type { OrderStatus, PublicOrderStatus } from '@/lib/orders/types';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';

/**
 * Where an order has got to, asked for after the page has rendered.
 *
 * The order page itself is built entirely from the link, so it is readable
 * with no database and no network — the status is an addition on top of a page
 * that already works. While it is loading, or if the lookup fails, the page
 * simply shows no status rather than an error the customer can do nothing with.
 */
export function useOrderStatuses(references: string[]) {
  const [found, setFound] = useState<Record<string, PublicOrderStatus> | null>(null);
  const key = references.slice(0, 10).join(',');

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/orders/status?ref=${encodeURIComponent(key)}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((data: { orders?: PublicOrderStatus[] }) => {
        if (cancelled) return;
        setFound(Object.fromEntries((data.orders ?? []).map((order) => [order.reference, order])));
      })
      .catch(() => {
        if (!cancelled) setFound({});
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  // With nothing to ask about there is nothing to wait for, so this answers
  // "none" rather than "still loading" — and without setting state in an
  // effect, which would cost a second render on every page that has no orders.
  return key ? found : {};
}

export function StatusChip({
  status,
  dict,
}: {
  status: OrderStatus;
  dict: Dictionary;
}) {
  return (
    <span
      className={`inline-block rounded-sm border px-2.5 py-1 text-xs font-semibold tracking-[0.08em] ${statusTone[status]}`}
    >
      {dict.order.statuses[status]}
    </span>
  );
}

const when = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE-u-ca-gregory-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));

/** The status block on a single order's page. */
export function OrderStatusPanel({
  reference,
  locale,
  dict,
}: {
  reference: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const found = useOrderStatuses([reference]);
  if (found === null) return null;

  const order = found[reference];

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">{dict.order.status}</p>
      {order ? (
        <>
          <p className="mt-2">
            <StatusChip status={order.status} dict={dict} />
          </p>
          <p className="mt-2 text-xs text-ink-500">
            {dict.order.lastUpdated}: {when(order.updatedAt, locale)}
          </p>
          {order.tracking ? (
            <p className="mt-1 text-xs text-ink-700">
              {dict.order.tracking}:{' '}
              <span className="font-mono" dir="ltr">
                {order.tracking}
              </span>
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-2 max-w-xs text-sm text-ink-500">{dict.order.statusPending}</p>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readOrders, type RememberedOrder } from '@/lib/order-history';
import { orderDate } from '@/lib/order-link';
import { StatusChip, useOrderStatuses } from './order-status';
import type { PublicOrderStatus } from '@/lib/orders/types';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { Glyph, GlyphLoader } from './glyphs';

const REFERENCE = /^MLA-\d{6}-[A-Z2-9]{4}$/;

export function OrderHistoryView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [mine, setMine] = useState<RememberedOrder[] | null>(null);

  // localStorage only exists after hydration; reading it during render would
  // make the first client paint disagree with the server's HTML.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMine(readOrders());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const statuses = useOrderStatuses((mine ?? []).map((order) => order.reference));

  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE-u-ca-gregory-nu-latn' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Glyph className="text-3xl text-gold-600" width={1}>
        𓈖
      </Glyph>
      <h1 className="mt-3 font-display text-4xl text-ink-900">{dict.orders.title}</h1>
      <span className="mt-3 block h-px w-28 bg-gold-500/60" />
      <p className="mt-5 max-w-xl leading-relaxed text-ink-700">{dict.orders.lead}</p>

      {mine === null ? (
        <div className="mt-10">
          <GlyphLoader label={dict.common.loading} />
        </div>
      ) : mine.length === 0 ? (
        <div className="mt-10">
          <p className="text-ink-700">{dict.orders.empty}</p>
          <Link
            href={`/${locale}/shop`}
            className="mt-6 inline-block rounded-sm bg-ink-900 px-6 py-3 font-display text-sm uppercase tracking-[0.15em] text-papyrus-100 transition-colors hover:bg-lapis-800"
          >
            {dict.orders.emptyCta}
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-papyrus-300/70 border-y border-papyrus-300/70">
          {mine.map((order) => {
            const live = statuses?.[order.reference];
            const placed = order.placedAt ?? orderDate(order.reference)?.toISOString();
            return (
              <li
                key={order.reference}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5"
              >
                <div>
                  <p className="font-mono text-lg tracking-[0.1em] text-lapis-800" dir="ltr">
                    {order.reference}
                  </p>
                  {placed ? (
                    <p className="mt-1 text-sm text-ink-500">
                      {dict.order.placedOn} {date(placed)}
                    </p>
                  ) : null}
                  {live?.tracking ? (
                    <p className="mt-1 text-sm text-ink-700">
                      {dict.order.tracking}:{' '}
                      <span className="font-mono" dir="ltr">
                        {live.tracking}
                      </span>
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-4">
                  {live ? <StatusChip status={live.status} dict={dict} /> : null}
                  <Link
                    href={`/${locale}/order${order.search}`}
                    className="text-sm text-ink-900 underline decoration-gold-500 underline-offset-4 transition-colors hover:text-gold-600"
                  >
                    {dict.orders.view}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink-500">
        {dict.orders.deviceNote}
      </p>

      <Lookup locale={locale} dict={dict} />
    </div>
  );
}

/* --------------------------- reference lookup ---------------------------- */

/**
 * For the order placed on another phone. It answers with the status and the
 * tracking number and nothing else — a reference is short enough to be guessed
 * at eventually, so it must never be the key to somebody's name and address.
 */
function Lookup({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [state, setState] = useState<
    { kind: 'idle' } | { kind: 'busy' } | { kind: 'missing' } | { kind: 'found'; order: PublicOrderStatus }
  >({ kind: 'idle' });

  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE-u-ca-gregory-nu-latn' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));

  return (
    <section className="mt-14 rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-6">
      <h2 className="font-display text-xl text-ink-900">{dict.orders.lookupTitle}</h2>
      <span className="mt-2 block h-px w-20 bg-gold-500/60" />
      <p className="mt-4 text-sm text-ink-500">{dict.orders.lookupLead}</p>

      <form
        className="mt-5 flex flex-wrap items-end gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const value = String(new FormData(event.currentTarget).get('reference') ?? '')
            .trim()
            .toUpperCase();
          if (!REFERENCE.test(value)) {
            setState({ kind: 'missing' });
            return;
          }
          setState({ kind: 'busy' });
          try {
            const response = await fetch(`/api/orders/status?ref=${encodeURIComponent(value)}`, {
              cache: 'no-store',
            });
            const data: { orders?: PublicOrderStatus[] } = await response.json();
            const order = data.orders?.[0];
            setState(order ? { kind: 'found', order } : { kind: 'missing' });
          } catch {
            setState({ kind: 'missing' });
          }
        }}
      >
        <label className="min-w-56 flex-1">
          <span className="block text-xs font-medium uppercase tracking-wide text-ink-500">
            {dict.orders.lookupLabel}
          </span>
          <input
            name="reference"
            placeholder="MLA-261024-AB3K"
            dir="ltr"
            className="mt-2 w-full rounded-sm border border-papyrus-300 bg-papyrus-50 px-3 py-2.5 font-mono text-ink-900 transition-colors focus-visible:border-gold-500"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 cursor-pointer rounded-sm border border-lapis-700 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-lapis-800 transition-colors hover:bg-lapis-800 hover:text-papyrus-50"
        >
          {dict.orders.lookupCta}
        </button>
      </form>

      {state.kind === 'busy' ? (
        <p className="mt-4 text-sm text-ink-500">{dict.orders.refresh}</p>
      ) : null}
      {state.kind === 'missing' ? (
        <p className="mt-4 text-sm text-carnelian-700">{dict.orders.lookupMissing}</p>
      ) : null}
      {state.kind === 'found' ? (
        <div className="mt-5 border-t border-papyrus-300/70 pt-4">
          <p className="font-mono text-lg tracking-[0.1em] text-lapis-800" dir="ltr">
            {state.order.reference}
          </p>
          <p className="mt-2">
            <StatusChip status={state.order.status} dict={dict} />
          </p>
          <p className="mt-2 text-xs text-ink-500">
            {dict.order.lastUpdated}: {date(state.order.updatedAt)}
          </p>
          {state.order.tracking ? (
            <p className="mt-1 text-sm text-ink-700">
              {dict.order.tracking}:{' '}
              <span className="font-mono" dir="ltr">
                {state.order.tracking}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

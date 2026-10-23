'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Product } from '@/data/types';
import { useCurrency } from './providers';
import { formatPrice } from '@/lib/currency';
import { whatsappLink } from '@/config/store';

const INTERVAL_MS = 5000;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * A media query is an external store, so React has an API for it. Reading it
 * in an effect would mean a second render on every mount and a lint rule
 * telling you so.
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener('change', notify);
      return () => query.removeEventListener('change', notify);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * The hero cycles through the bestsellers rather than showing one piece.
 *
 * Index 0 is what the server renders, so the first paint is deterministic and
 * hydration matches. The *order of everything after* is shuffled once on
 * mount, which is where the randomness lives: two visitors landing on the same
 * page see the same first piece and then diverge.
 */
export function Hero({
  products,
  cheapestUsd,
  locale,
  dict,
}: {
  products: Product[];
  cheapestUsd: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const { currency } = useCurrency();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /**
   * The headline only fades once the hero has actually changed piece. The
   * fade starts at opacity 0, and the headline is the largest text on the
   * page — animating it on first paint made it the LCP element and pushed
   * LCP from 2.1s to 4.8s, 90% of it render delay, for a flourish nobody
   * sees on arrival.
   */
  const [rotated, setRotated] = useState(false);
  const reduced = usePrefersReducedMotion();
  const orderRef = useRef<number[]>([]);

  // Shuffle the rotation after the first slide, once, on the client.
  useEffect(() => {
    const rest = products.map((_, i) => i).slice(1);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    orderRef.current = [0, ...rest];
  }, [products]);

  // Auto-advance, unless the visitor is interacting or asked for less motion.
  // WCAG 2.2.2 wants a way to stop moving content; hovering, focusing or
  // picking a dot all do, and reduced motion never starts it.
  useEffect(() => {
    if (paused || reduced || products.length < 2) return;
    const timer = window.setInterval(() => {
      setRotated(true);
      setIndex((current) => {
        const order = orderRef.current;
        const at = order.indexOf(current);
        return order[(at + 1) % order.length] ?? 0;
      });
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, products.length]);

  const active = products[index] ?? products[0];
  const [bodyBefore, bodyAfter] = useMemo(() => dict.hero.body.split('{from}'), [dict.hero.body]);

  const hold = () => setPaused(true);
  const release = () => setPaused(false);

  return (
    <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-16 md:grid-cols-2">
      {/*
        Pause is scoped to the card, the actions and the dots rather than the
        whole hero: on a desktop this grid fills the viewport, so pausing on
        any hover would mean a cursor resting anywhere stops the rotation for
        good. Focus still pauses, which is what keyboard and screen reader
        users need.
      */}
      <div>
        <p className="font-display text-[11px] uppercase tracking-[0.3em] text-gold-300 sm:text-xs">
          {dict.hero.eyebrow}
        </p>
        {/*
          min-height reserves what the longest name needs so swapping the
          headline never nudges the page. Measured at each breakpoint with
          every name in the rotation, not guessed: the tallest is 6.04rem at
          375px, 10.35rem at 768 and 13.8rem at 1024.
        */}
        <h1 className="mt-3 min-h-[6.3rem] font-display text-[1.75rem] leading-[1.15] text-papyrus-50 sm:min-h-[10.5rem] sm:text-4xl lg:min-h-[14rem] lg:text-5xl">
          <span key={active.slug} className={rotated ? 'animate-hero-name' : undefined}>
            {dict.hero.title.replace('{name}', (active.heroName ?? active.name)[locale])}
          </span>
        </h1>

        <p className="mt-4 max-w-md text-base leading-relaxed text-papyrus-300 sm:text-lg">
          {bodyBefore}
          <span className="font-semibold text-papyrus-100" dir="ltr">
            {formatPrice(cheapestUsd, currency, locale)}
          </span>
          {bodyAfter}
        </p>

        {/* The buyable thing, above the fold, changing as the hero cycles. */}
        <div
          onMouseEnter={hold}
          onMouseLeave={release}
          onFocusCapture={hold}
          onBlurCapture={release}
        >
        <div className="mt-6 flex items-center gap-4 rounded-sm border border-papyrus-400/25 bg-papyrus-50/5 p-3">
          <Link
            href={`/${locale}/products/${active.slug}`}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-papyrus-50"
          >
            {products.map((product, i) => (
              <Image
                key={product.slug}
                src={product.images[0]}
                alt={i === index ? product.name[locale] : ''}
                fill
                sizes="80px"
                priority={i === 0}
                className={`object-contain p-1 transition-opacity duration-700 ${
                  i === index ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300">
              {dict.hero.featuredLabel}
            </p>
            <Link
              href={`/${locale}/products/${active.slug}`}
              className="mt-0.5 block truncate font-display text-lg text-papyrus-50 transition-colors hover:text-gold-300"
            >
              {active.name[locale]}
            </Link>
            <p className="font-semibold text-gold-300" dir="ltr">
              {formatPrice(active.priceUsd, currency, locale)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={whatsappLink(`${dict.cart.whatsappIntro}\n• ${active.name[locale]}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-malachite-600 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-papyrus-50 transition-colors hover:bg-malachite-700"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.6-.1 1.4Z" />
            </svg>
            {dict.hero.orderNow}
          </a>

          <Link
            href={`/${locale}/shop`}
            className="inline-flex min-h-11 items-center rounded-sm border border-papyrus-400/50 px-5 py-3 font-display text-sm uppercase tracking-[0.12em] text-papyrus-200 transition-colors hover:border-gold-300 hover:text-gold-300"
          >
            {dict.hero.browseAll}
          </Link>
        </div>

        {products.length > 1 ? (
          <div className="mt-5 flex gap-2">
            {products.map((product, i) => (
              <button
                key={product.slug}
                type="button"
                onClick={() => {
                  setRotated(true);
                  setIndex(i);
                }}
                aria-label={product.name[locale]}
                aria-current={i === index}
                className="group grid h-7 w-7 place-items-center rounded-full"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-500 ${
                    i === index
                      ? 'w-5 bg-gold-300'
                      : 'w-1.5 bg-papyrus-400/50 group-hover:bg-papyrus-300'
                  }`}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      </div>

      {/* Decorative on mobile, where the compact card does the work. */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-sm overflow-hidden rounded-sm border border-gold-400/30 bg-papyrus-50 shadow-2xl md:block">
        {products.map((product, i) => (
          <Image
            key={product.slug}
            src={product.images[0]}
            alt=""
            fill
            sizes="(min-width: 768px) 24rem, 0px"
            priority={i === 0}
            className={`object-cover transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

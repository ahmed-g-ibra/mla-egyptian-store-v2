'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { defaultCurrency, isCurrency, type Currency } from '@/lib/currency';

const CURRENCY_COOKIE = 'mla_currency';
const CART_KEY = 'mla_cart_v1';

/* ---------------------------------- currency --------------------------------- */

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (next: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const readCookie = (name: string) =>
  typeof document === 'undefined'
    ? undefined
    : document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`))
        ?.split('=')[1];

/* ------------------------------------ cart ----------------------------------- */

export type CartLine = { slug: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  add: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  /** Puts a line back at the quantity it had, for undo. */
  restore: (slug: string, quantity: number) => void;
  clear: () => void;
  count: number;
  /** False until the browser's stored cart has been read, so SSR and the first
   *  client paint agree and React does not warn about a hydration mismatch. */
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * The server always renders prices in the default currency so every page can be
 * generated statically. On mount we read the cookie the proxy set from the
 * visitor's geo and re-render if it differs — one correction, no blocking
 * render, and the visitor's own choice persists from then on.
 */
export function Providers({
  initialCurrency,
  children,
}: {
  initialCurrency: Currency;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  /*
   * Reading the cookie and the stored cart has to happen after hydration —
   * neither exists on the server, and touching them during render would make
   * the first client paint disagree with the server's HTML. This runs once on
   * mount and costs exactly one extra render, which is the price of the
   * pattern rather than a mistake in it.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = readCookie(CURRENCY_COOKIE);
    if (stored && isCurrency(stored) && stored !== currency) setCurrencyState(stored);
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLines(
            parsed.filter(
              (l): l is CartLine =>
                !!l &&
                typeof (l as CartLine).slug === 'string' &&
                Number.isFinite((l as CartLine).quantity),
            ),
          );
        }
      }
    } catch {
      // A corrupt or unreadable cart is not worth breaking the page over.
    }
    setReady(true);
    // Runs once on mount; `currency` is only read to avoid a redundant set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      // Private mode and full quotas both land here. The cart still works for
      // this page view; it just will not survive a reload.
    }
  }, [lines, ready]);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, []);

  const add = useCallback((slug: string) => {
    setLines((current) => {
      const existing = current.find((l) => l.slug === slug);
      return existing
        ? current.map((l) => (l.slug === slug ? { ...l, quantity: l.quantity + 1 } : l))
        : [...current, { slug, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((l) => l.slug !== slug)
        : current.map((l) => (l.slug === slug ? { ...l, quantity } : l)),
    );
  }, []);

  const remove = useCallback(
    (slug: string) => setLines((current) => current.filter((l) => l.slug !== slug)),
    [],
  );

  const restore = useCallback((slug: string, quantity: number) => {
    setLines((current) =>
      current.some((l) => l.slug === slug)
        ? current.map((l) => (l.slug === slug ? { ...l, quantity } : l))
        : [...current, { slug, quantity }],
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const cartValue = useMemo<CartContextValue>(
    () => ({
      lines,
      add,
      setQuantity,
      remove,
      restore,
      clear,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      ready,
    }),
    [lines, add, setQuantity, remove, restore, clear, ready],
  );

  const currencyValue = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);

  return (
    <CurrencyContext.Provider value={currencyValue}>
      <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used inside <Providers>');
  return context;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <Providers>');
  return context;
}

export { defaultCurrency };

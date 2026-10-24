import type { Currency } from '@/lib/currency';

/**
 * The life of an order, in the order it actually happens here.
 *
 * This shop sells over WhatsApp, so the steps are the conversation: it arrives
 * (`new`), we agree what is being bought (`confirmed`), the money lands
 * (`paid`), it goes out (`shipped`), it gets there (`delivered`). `cancelled`
 * can happen from any of them and is kept rather than deleted — a cancelled
 * order is a fact about the month, not an absence.
 */
export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const isOrderStatus = (value: string): value is OrderStatus =>
  (ORDER_STATUSES as readonly string[]).includes(value);

/** Which statuses still need something from you. Drives the "open" count. */
export const OPEN_STATUSES: readonly OrderStatus[] = ['new', 'confirmed', 'paid', 'shipped'];

export type StoredOrderLine = {
  slug: string;
  qty: number;
  /** The English name, frozen at the time of the order. The catalogue can be
   *  renamed or a piece dropped; what was sold must not change underneath. */
  name: string;
  /** Retail, in the order's own currency — what the customer actually saw. */
  unit: number;
  total: number;
};

export type OrderCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  /** ISO 3166-1 alpha-2, one of the six GCC countries. */
  country: string;
};

export type OrderNote = {
  id: string;
  body: string;
  createdAt: string;
};

export type StoredOrder = {
  reference: string;
  placedAt: string;
  updatedAt: string;
  locale: 'en' | 'ar';
  /** The currency the order was placed in. Every amount below is in it. */
  currency: Currency;
  status: OrderStatus;
  customer: OrderCustomer;
  lines: StoredOrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  /**
   * The same total converted to dollars, so the admin summary can add up
   * orders placed in six different currencies without re-reading the rates.
   */
  totalUsd: number;
  /** Courier reference once it ships. Shown to the customer. */
  tracking: string | null;
  notes: OrderNote[];
};

/** What the customer is allowed to see about their own order from a reference. */
export type PublicOrderStatus = {
  reference: string;
  status: OrderStatus;
  updatedAt: string;
  tracking: string | null;
};

/**
 * Both stores implement this. Nothing above this interface knows whether the
 * orders are in Postgres or in a JSON file on your laptop.
 */
export type OrderStore = {
  kind: 'postgres' | 'file';
  init(): Promise<void>;
  save(order: StoredOrder): Promise<void>;
  list(): Promise<StoredOrder[]>;
  get(reference: string): Promise<StoredOrder | null>;
  setStatus(reference: string, status: OrderStatus): Promise<void>;
  setTracking(reference: string, tracking: string | null): Promise<void>;
  addNote(reference: string, body: string): Promise<void>;
};

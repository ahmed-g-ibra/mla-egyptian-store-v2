import type { OrderStatus } from './types';

/** What each status is called on the admin page, which is English only. */
export const statusLabel: Record<OrderStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/**
 * Colour carries meaning here, so it is never the only thing that does: every
 * chip also says its status in words.
 */
export const statusTone: Record<OrderStatus, string> = {
  new: 'border-gold-400 bg-gold-200/70 text-ink-800',
  confirmed: 'border-lapis-600 bg-lapis-200/50 text-lapis-900',
  paid: 'border-malachite-600 bg-malachite-600/15 text-malachite-700',
  shipped: 'border-lapis-700 bg-lapis-800 text-papyrus-50',
  delivered: 'border-malachite-700 bg-malachite-700 text-papyrus-50',
  cancelled: 'border-carnelian-600 bg-carnelian-600/10 text-carnelian-700',
};

/**
 * The step you would normally take next, which is the button the order page
 * leads with. Delivered and cancelled are ends, so they have none.
 */
export const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  new: 'confirmed',
  confirmed: 'paid',
  paid: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
};

/** The happy path, drawn as a line on the order page. Cancelled is not on it. */
export const STATUS_FLOW: readonly OrderStatus[] = [
  'new',
  'confirmed',
  'paid',
  'shipped',
  'delivered',
];

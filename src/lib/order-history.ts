/**
 * The orders this browser has placed.
 *
 * There are no accounts on this shop, so "my orders" can only mean "the orders
 * this browser remembers". The whole order is kept — as the same query string
 * the WhatsApp link carries — so the list can link to a full order page
 * without a lookup, and so a cleared database could never silently empty
 * somebody's history.
 *
 * It follows that the list does not travel between devices. That is said
 * plainly on the page rather than papered over, and the reference lookup is
 * there for the other phone.
 */
const KEY = 'mla_orders_v1';
const LIMIT = 50;

export type RememberedOrder = {
  reference: string;
  /** The `?ref=…&items=…` query string that reconstructs the order page. */
  search: string;
  placedAt: string;
};

export function readOrders(): RememberedOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is RememberedOrder =>
        !!entry &&
        typeof (entry as RememberedOrder).reference === 'string' &&
        typeof (entry as RememberedOrder).search === 'string',
    );
  } catch {
    return [];
  }
}

export function rememberOrder(order: RememberedOrder) {
  if (typeof window === 'undefined') return;
  try {
    const existing = readOrders().filter((entry) => entry.reference !== order.reference);
    window.localStorage.setItem(KEY, JSON.stringify([order, ...existing].slice(0, LIMIT)));
  } catch {
    // Private browsing and a full quota both land here. Losing the local copy
    // costs the customer a list; the order itself is recorded on the server.
  }
}

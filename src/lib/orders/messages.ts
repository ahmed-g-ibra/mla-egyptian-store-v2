import { store } from '@/config/store';
import { encodeOrder } from '@/lib/order-link';
import { formatPrice } from '@/lib/currency';
import type { StoredOrder } from './types';

/**
 * The customer's own order page, rebuilt from what was stored.
 *
 * The link is not kept in the database — it does not need to be. It is the
 * order: slugs, quantities, currency and country, which is exactly what is on
 * the record. Rebuilding it means a customer who lost the WhatsApp message can
 * be sent it again.
 */
export const orderUrl = (order: StoredOrder) =>
  `${store.siteUrl}/${order.locale}/order${encodeOrder({
    reference: order.reference,
    lines: order.lines.map((line) => ({ slug: line.slug, quantity: line.qty })),
    currency: order.currency,
    country: order.customer.country,
  })}`;

/**
 * What to send the customer now that the status has moved — written in the
 * language they were shopping in, which is the one they will reply in.
 *
 * It is a draft, not a send: it opens WhatsApp with the message ready and he
 * presses send. Nothing here goes out on its own.
 */
export function customerMessage(order: StoredOrder): string {
  const first = order.customer.name.split(' ')[0] || order.customer.name;
  const total = formatPrice(order.total, order.currency, order.locale, { convertFirst: false });
  const ref = order.reference;
  const ar = order.locale === 'ar';

  const body = ar
    ? {
        new: `مرحبًا ${first}، وصلنا طلبك ${ref}. سنؤكّد معك التفاصيل قريبًا.`,
        confirmed: `مرحبًا ${first}، تم تأكيد طلبك ${ref} — ${total}. وسنخبرك فور شحنه.`,
        paid: `مرحبًا ${first}، استلمنا مبلغ طلبك ${ref}. شكرًا لك، ويُغلَّف ويُرسل تاليًا.`,
        shipped: `مرحبًا ${first}، طلبك ${ref} في طريقه إليك.`,
        delivered: `مرحبًا ${first}، تم تسليم طلبك ${ref}. شكرًا لتسوّقك من MLA.`,
        cancelled: `مرحبًا ${first}، أُلغي طلبك ${ref}. إن لم يكن ذلك صحيحًا فراسلنا هنا.`,
      }[order.status]
    : {
        new: `Hello ${first}, we have your order ${ref}. We will confirm the details with you shortly.`,
        confirmed: `Hello ${first}, your order ${ref} is confirmed — ${total}. We will let you know the moment it ships.`,
        paid: `Hello ${first}, we have received your payment for order ${ref}. Thank you — it is being packed next.`,
        shipped: `Hello ${first}, your order ${ref} is on its way to you.`,
        delivered: `Hello ${first}, your order ${ref} has been delivered. Thank you for shopping with MLA.`,
        cancelled: `Hello ${first}, your order ${ref} has been cancelled. If that is not right, just reply here.`,
      }[order.status];

  const lines = [body];

  if (order.tracking && (order.status === 'shipped' || order.status === 'delivered')) {
    lines.push(ar ? `رقم التتبّع: ${order.tracking}` : `Tracking number: ${order.tracking}`);
  }
  if (order.status !== 'cancelled') {
    lines.push('', ar ? `تفاصيل طلبك: ${orderUrl(order)}` : `Your order: ${orderUrl(order)}`);
  }

  return lines.join('\n');
}

/** Click-to-chat with this customer, with the update already written. */
export const customerChatLink = (order: StoredOrder) =>
  `https://api.whatsapp.com/send?phone=${order.customer.phone.replace(/\D/g, '')}&text=${encodeURIComponent(
    customerMessage(order),
  )}`;

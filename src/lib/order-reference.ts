/**
 * A short reference the customer can quote back.
 *
 * MLA-YYMMDD-XXXX. The date makes it sortable and tells us at a glance how old
 * an enquiry is; the suffix separates orders placed the same day.
 *
 * The alphabet drops O, I, 0 and 1 on purpose: these get read aloud and typed
 * back over WhatsApp, where O/0 and I/1 are the mistakes people make.
 *
 * Generated on submit, never during render — a random value produced while
 * rendering would differ between server and client and break hydration.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createOrderReference(now: Date = new Date()): string {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  const bytes =
    typeof crypto !== 'undefined' && 'getRandomValues' in crypto
      ? crypto.getRandomValues(new Uint8Array(4))
      : Uint8Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));

  const suffix = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  return `MLA-${yy}${mm}${dd}-${suffix}`;
}

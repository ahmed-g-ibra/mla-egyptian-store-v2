/**
 * The only file you need to edit to point this storefront at the business.
 * Everything customer-facing that is not a product or a translation reads here.
 */
export const store = {
  /** Digits only, full international format, no '+' and no spaces. */
  whatsappNumber: '96877170373',
  phoneDisplay: '+968 7717 0373',
  email: 'REDACTED',
  city: { en: 'Muscat', ar: 'مسقط' },
  country: { en: 'Oman', ar: 'عُمان' },
  /** ISO code of the country orders ship from. Drives the shipping copy. */
  baseCountry: 'OM',
  instagram: 'mla.egypt',
  /**
   * Shown in the footer. A literal rather than `new Date()`: the pages are
   * prerendered, and a clock reading at build time is not a fact about the
   * page. Bump it each January — see README.
   */
  copyrightYear: 2026,
  /** Set once the production domain is attached in Vercel. */
  siteUrl: 'https://mla-egyptian-store-v2.vercel.app',
} as const;

/**
 * Builds a click-to-chat link.
 *
 * Deliberately api.whatsapp.com and not the shorter wa.me. On the owner's own
 * network wa.me resolves and the TCP connection opens, then the TLS handshake
 * is reset by peer — the signature of SNI-level domain blocking, and a common
 * one because wa.me is a generic Meta shortener that filters treat as spam.
 * api.whatsapp.com returned 200 for the same number at the same moment.
 *
 * Both are official endpoints and behave identically, deep-linking into the
 * app on mobile. There is no case where wa.me is the better choice, and
 * WhatsApp is the only way to actually place an order here, so a blocked link
 * is a dead shop rather than a broken button.
 */
export const whatsappLink = (message: string) =>
  `https://api.whatsapp.com/send?phone=${store.whatsappNumber}&text=${encodeURIComponent(message)}`;

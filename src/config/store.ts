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

export const whatsappLink = (message: string) =>
  `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(message)}`;

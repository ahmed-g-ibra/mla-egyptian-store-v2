/**
 * Prices are held once, in the supplier's USD, and converted at render time.
 *
 * Five of the six GCC currencies are hard-pegged to the US dollar by their
 * central banks, so those rates are fixed by policy and do not drift — a live
 * FX call would spend a network round trip to fetch five constants. Only the
 * Kuwaiti dinar floats, against an undisclosed basket, and it moves by well
 * under a percent a year. Re-check KWD quarterly; see README.
 */
export const currencies = ['AED', 'SAR', 'QAR', 'OMR', 'BHD', 'KWD'] as const;
export type Currency = (typeof currencies)[number];

export const defaultCurrency: Currency = 'AED';

/** MLA's margin over the supplier's listed price. */
export const MARKUP = 1.15;

type CurrencyMeta = {
  /** Units of this currency per 1 USD. */
  rate: number;
  decimals: number;
  pegged: boolean;
  symbol: { en: string; ar: string };
  name: { en: string; ar: string };
};

export const currencyMeta: Record<Currency, CurrencyMeta> = {
  AED: {
    rate: 3.6725,
    decimals: 2,
    pegged: true,
    symbol: { en: 'AED', ar: 'د.إ' },
    name: { en: 'UAE Dirham', ar: 'درهم إماراتي' },
  },
  SAR: {
    rate: 3.75,
    decimals: 2,
    pegged: true,
    symbol: { en: 'SAR', ar: 'ر.س' },
    name: { en: 'Saudi Riyal', ar: 'ريال سعودي' },
  },
  QAR: {
    rate: 3.64,
    decimals: 2,
    pegged: true,
    symbol: { en: 'QAR', ar: 'ر.ق' },
    name: { en: 'Qatari Riyal', ar: 'ريال قطري' },
  },
  OMR: {
    rate: 0.3845,
    decimals: 3,
    pegged: true,
    symbol: { en: 'OMR', ar: 'ر.ع' },
    name: { en: 'Omani Rial', ar: 'ريال عُماني' },
  },
  BHD: {
    rate: 0.376,
    decimals: 3,
    pegged: true,
    symbol: { en: 'BHD', ar: 'د.ب' },
    name: { en: 'Bahraini Dinar', ar: 'دينار بحريني' },
  },
  KWD: {
    // Basket peg, not a dollar peg. This one drifts.
    rate: 0.307,
    decimals: 3,
    pegged: false,
    symbol: { en: 'KWD', ar: 'د.ك' },
    name: { en: 'Kuwaiti Dinar', ar: 'دينار كويتي' },
  },
};

/** Which currency to preselect for a visitor in a given country. */
export const currencyForCountry: Record<string, Currency> = {
  AE: 'AED',
  SA: 'SAR',
  QA: 'QAR',
  OM: 'OMR',
  BH: 'BHD',
  KW: 'KWD',
};

export const isCurrency = (value: string): value is Currency =>
  (currencies as readonly string[]).includes(value);

/**
 * Lands on a retail-looking figure rather than a conversion artefact: whole
 * units where one unit is small change, one decimal where it is not.
 */
const roundRetail = (value: number, decimals: number) =>
  decimals === 2 ? Math.round(value) : Math.round(value * 10) / 10;

export const convert = (priceUsd: number, currency: Currency) =>
  roundRetail(priceUsd * MARKUP * currencyMeta[currency].rate, currencyMeta[currency].decimals);

/**
 * Shipping is quoted in dirhams in faq.ts, because that is the currency the
 * rates were agreed in. This puts a dirham figure into whatever the visitor
 * is seeing, without the product markup — we do not mark shipping up.
 */
export const convertFromAed = (aed: number, currency: Currency) => {
  const usd = aed / currencyMeta.AED.rate;
  const meta = currencyMeta[currency];
  return meta.decimals === 2
    ? Math.round(usd * meta.rate)
    : Math.round(usd * meta.rate * 10) / 10;
};

export const formatPrice = (
  priceUsd: number,
  currency: Currency,
  locale: 'en' | 'ar',
  { convertFirst = true }: { convertFirst?: boolean } = {},
) => {
  const meta = currencyMeta[currency];
  const amount = convertFirst ? convert(priceUsd, currency) : priceUsd;
  // Western digits in both locales: Gulf storefronts overwhelmingly use them,
  // and they keep prices scannable when a page mixes scripts.
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE-u-nu-latn' : 'en-AE', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 1,
    maximumFractionDigits: meta.decimals,
  }).format(amount);
  return `${meta.symbol[locale]} ${formatted}`;
};

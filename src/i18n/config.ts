export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const dir = (locale: Locale) => (locale === 'ar' ? 'rtl' : 'ltr');

/** Used for <html lang> and hreflang. */
export const htmlLang: Record<Locale, string> = { en: 'en', ar: 'ar' };

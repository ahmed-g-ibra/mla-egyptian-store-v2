import type { Locale } from './config';
import { en, type Dictionary } from './dictionaries/en';
import { ar } from './dictionaries/ar';

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
export type { Dictionary };

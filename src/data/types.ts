import type { Locale } from '@/i18n/config';

export type Localised = Record<Locale, string>;

export const collectionIds = [
  'gods',
  'pharaohs',
  'scarabs',
  'afterlife',
  'monuments',
  'gifts',
] as const;

export type CollectionId = (typeof collectionIds)[number];

export type Product = {
  slug: string;
  collection: CollectionId;
  name: Localised;
  /** One line for cards and meta descriptions. */
  tagline: Localised;
  /**
   * What the piece is called in the home page headline, where the catalogue
   * name is too long or too specific — "Bastet" rather than "Bastet, Seated".
   * Falls back to `name`.
   */
  heroName?: Localised;
  description: Localised;
  /** As listed by the supplier, before MLA's markup. Never shown directly. */
  priceUsd: number;
  /** Supplier's own "was" price, where one was listed and is a real discount. */
  compareAtUsd: number | null;
  featured: boolean;
  images: string[];
};

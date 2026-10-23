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
  description: Localised;
  /**
   * Null where the source listing did not state it. The storefront shows
   * "on request" rather than inventing a figure — see README.
   */
  heightCm: number | null;
  material: Localised | null;
  /** As listed by the supplier, before MLA's markup. Never shown directly. */
  priceUsd: number;
  /** Supplier's own "was" price, where one was listed and is a real discount. */
  compareAtUsd: number | null;
  featured: boolean;
  images: string[];
};

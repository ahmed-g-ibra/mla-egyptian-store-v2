import type { Localised } from './types';

/**
 * Measured physical facts, one entry per product slug.
 *
 * Kept apart from products.ts on purpose. That file is generated from the
 * supplier feeds and gets regenerated when the catalogue is re-scraped; these
 * are measurements taken by hand, and they must survive that. It is also one
 * short file to work through rather than thirty entries to hunt for.
 *
 * Everything is optional. An empty object means "not measured yet" and the
 * product page says so rather than guessing — see README.
 *
 * Heights include the base, because that is what sits on the shelf.
 */
export type Specs = {
  /** Floor of the base to the highest point. */
  heightCm?: number;
  /** Widest point, left to right. */
  widthCm?: number;
  /** Deepest point, front to back. */
  depthCm?: number;
  /** Shipping weight is quoted separately; this is the piece itself. */
  weightKg?: number;
  material?: Localised;
};

export const specs: Record<string, Specs> = {
  'tutankhamun-scarab-box': {},
  'bastet-cat-statue': {},
  'isis-winged-statue': {},
  'ankh-standing-statue': {},
  'sobek-statue': {},
  'bes-statue': {},
  'scarab-blue-soapstone': { material: { en: 'Carved soapstone', ar: 'حجر صابوني منحوت' } },
  'bastet-cat-patina': {},
  'giza-pyramid-model': {},
  'canopic-jar-imsety': {},
  'scarab-green-soapstone': { material: { en: 'Carved soapstone', ar: 'حجر صابوني منحوت' } },
  'canopic-jar-set-patina': {},
  'isis-tall-statue': {},
  'ramses-seated-statue': {},
  'anubis-standing-statue': {},
  'bastet-cat-blue': {},
  'sekhmet-sistrum': {},
  'taweret-hippo-statue': { heightCm: 6 },
  'anubis-grand-sculpture': {},
  'scarab-lidded-box': {},
  'nile-crocodile-statue': {},
  'canopic-jar-set-four': {},
  'khafra-pharaoh-statue': {},
  'hathor-sistrum': {},
  'nefertari-statue': {},
  'anubis-sarcophagus-box': {},
  'ramses-crook-flail': {},
  'horus-falcon-statue': {},
  'sphinx-box': { heightCm: 11 },
  'nefertiti-bust': {},
};

export const specsFor = (slug: string): Specs => specs[slug] ?? {};

/** True when there is at least one measurement to show. */
export const hasSpecs = (s: Specs) =>
  s.heightCm !== undefined ||
  s.widthCm !== undefined ||
  s.depthCm !== undefined ||
  s.weightKg !== undefined ||
  s.material !== undefined;

/** Tallest measured piece, used to scale the size comparison. */
export const tallestMeasuredCm = () =>
  Math.max(0, ...Object.values(specs).map((s) => s.heightCm ?? 0));

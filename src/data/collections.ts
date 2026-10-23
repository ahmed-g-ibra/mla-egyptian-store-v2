import type { Localised } from './types';
import { collectionIds, type CollectionId } from './types';

export type Collection = {
  id: CollectionId;
  name: Localised;
  blurb: Localised;
  /** Egyptian Hieroglyphs block (U+13000) — decorative, aria-hidden in the UI. */
  glyph: string;
};

export const collections: Collection[] = [
  {
    id: 'gods',
    name: { en: 'Gods & Goddesses', ar: 'آلهة وربّات' },
    blurb: {
      en: 'Bastet, Anubis, Isis, Horus — the figures Egypt kept in the house, not only in the temple.',
      ar: 'باستت وأنوبيس وإيزيس وحورس — الأشكال التي أبقتها مصر في البيت لا في المعبد وحده.',
    },
    glyph: '𓁹',
  },
  {
    id: 'pharaohs',
    name: { en: 'Pharaohs & Queens', ar: 'فراعنة وملكات' },
    blurb: {
      en: 'Khafre, Ramses, Nefertiti, Nefertari — rulers carved as the office they held.',
      ar: 'خفرع ورمسيس ونفرتيتي ونفرتاري — حكّام نُحتوا بوصفهم المنصب الذي شغلوه.',
    },
    glyph: '𓋹',
  },
  {
    id: 'scarabs',
    name: { en: 'Scarabs & Amulets', ar: 'جُعرانات وتمائم' },
    blurb: {
      en: 'The sign for becoming, carved in soapstone and hollowed into boxes.',
      ar: 'علامة التحوّل، منحوتة في الحجر الصابوني ومجوَّفة علبًا.',
    },
    glyph: '𓆣',
  },
  {
    id: 'afterlife',
    name: { en: 'The Afterlife', ar: 'العالم الآخر' },
    blurb: {
      en: 'Canopic jars and sarcophagus boxes — the part of the ritual the family saw.',
      ar: 'أوانٍ كانوبية وعلب توابيت — الجزء الذي كان الأهل يرونه من الطقس.',
    },
    glyph: '𓊹',
  },
  {
    id: 'monuments',
    name: { en: 'Monuments', ar: 'آثار ومعالم' },
    blurb: {
      en: 'Giza at desk scale: the pyramid and the lion with a king’s head.',
      ar: 'الجيزة بمقياس المكتب: الهرم والأسد ذو رأس الملك.',
    },
    glyph: '𓉴',
  },
  {
    id: 'gifts',
    name: { en: 'Gifts', ar: 'هدايا' },
    blurb: {
      en: 'Small pieces that need no explaining when they are handed over.',
      ar: 'قطع صغيرة لا تحتاج شرحًا حين تُهدى.',
    },
    glyph: '𓌻',
  },
];

export const collectionById = (id: string): Collection | undefined =>
  collections.find((c) => c.id === id);

export { collectionIds };
export type { CollectionId };

import type { Localised } from './types';

export type FaqEntry = { question: Localised; answer: Localised };

/**
 * DRAFTS, written to describe how this shop actually operates rather than
 * copied from a template — but not legal advice and not reviewed by a lawyer.
 * Have them checked against Omani and UAE consumer law before launch.
 *
 * Shipping figures confirmed by the owner on 23 Oct 2026. They live here and
 * nowhere else; change them here and the FAQ prose below must be edited to
 * match, in both languages.
 */
export const shipping = {
  freeOverAed: 400,
  nearRateAed: 45,
  farRateAed: 75,
  daysGcc: 15,
};

export const faq: FaqEntry[] = [
  {
    question: { en: 'Where do you ship?', ar: 'إلى أين تشحنون؟' },
    answer: {
      en: 'To all six GCC countries — Oman, the UAE, Saudi Arabia, Qatar, Bahrain and Kuwait. Orders leave from Muscat. Shipping beyond the Gulf is possible but quoted case by case, so ask before ordering.',
      ar: 'إلى دول مجلس التعاون الستّ — عُمان والإمارات والسعودية وقطر والبحرين والكويت. وتخرج الطلبات من مسقط. والشحن خارج الخليج ممكن لكن بعرض سعر لكل حالة، فاسأل قبل الطلب.',
    },
  },
  {
    question: { en: 'How long does delivery take?', ar: 'كم يستغرق التوصيل؟' },
    answer: {
      en: 'Up to fifteen days across the Gulf, counted from the day the order is confirmed and not from the day it is placed. Customs clearance sits inside that window and is the part we do not control.',
      ar: 'حتى خمسة عشر يومًا في أنحاء الخليج، تُحسب من يوم تأكيد الطلب لا من يوم تقديمه. ويقع التخليص الجمركي داخل هذه المدّة، وهو الجزء الذي لا نتحكّم فيه.',
    },
  },
  {
    question: { en: 'What does shipping cost?', ar: 'كم تكلفة الشحن؟' },
    answer: {
      en: 'Free on orders over AED 400. Below that, AED 45 to Oman and the UAE, and AED 75 to Saudi Arabia, Qatar, Bahrain and Kuwait. Heavy or oversized pieces are quoted separately and confirmed in writing before you pay — we do not mark shipping up.',
      ar: 'مجاني للطلبات التي تتجاوز 400 درهم إماراتي. وما دون ذلك، 45 درهمًا إلى عُمان والإمارات، و75 درهمًا إلى السعودية وقطر والبحرين والكويت. أما القطع الثقيلة أو كبيرة الحجم فتُسعَّر على حدة وتُؤكَّد كتابةً قبل الدفع — ولا نضيف هامشًا على الشحن.',
    },
  },
  {
    question: { en: 'Are these real antiquities?', ar: 'هل هذه آثار حقيقية؟' },
    answer: {
      en: 'No, and we would not sell them if they were. Every piece is a contemporary reproduction made by a working Egyptian craftsperson. Egypt prohibits the export of its antiquities, and we declare every parcel accurately as a modern reproduction at its real value. Declaring one as an antique is how a parcel gets seized.',
      ar: 'لا، ولو كانت كذلك لما بعناها. فكل قطعة نسخة معاصرة صنعها حرفيّ مصري يعمل اليوم. ومصر تمنع تصدير آثارها، ونحن نصرّح بكل طرد بدقّة بوصفه نسخة حديثة وبقيمته الحقيقية. فالتصريح بأي قطعة على أنها أثر هو ما يؤدّي إلى مصادرة الطرد.',
    },
  },
  {
    question: { en: 'Who pays customs duty?', ar: 'من يدفع الرسوم الجمركية؟' },
    answer: {
      en: 'The buyer. Any import duty or VAT charged in the destination country is yours to settle, and it varies by country and by order value. We will not under-declare a shipment or label an order as a gift to reduce it.',
      ar: 'المشتري. فأي رسوم استيراد أو ضريبة قيمة مضافة تُفرض في بلد الوصول تقع عليك، وهي تختلف بحسب الدولة وقيمة الطلب. ولن نُقلِّل قيمة شحنة أو نصفها بأنها هدية لتخفيضها.',
    },
  },
  {
    question: { en: 'What if a piece arrives broken?', ar: 'ماذا لو وصلت القطعة مكسورة؟' },
    answer: {
      en: 'Photograph it before you unpack anything else and send the photographs on WhatsApp the same day. Stone and resin travel well but not perfectly. A breakage in transit is replaced or refunded in full, shipping included — that is our cost, not yours.',
      ar: 'صوّرها قبل أن تفرغ أي شيء آخر وأرسل الصور عبر واتساب في اليوم نفسه. فالحجر والراتنج يتحمّلان السفر جيدًا لا تمامًا. وأي كسر أثناء النقل يُستبدَل أو يُرَدّ ثمنه كاملًا شاملًا الشحن — فهذه تكلفتنا لا تكلفتك.',
    },
  },
  {
    question: { en: 'Can I return something I simply did not like?', ar: 'هل أستطيع إرجاع قطعة لم تعجبني فحسب؟' },
    answer: {
      en: 'Yes, within fourteen days of delivery, unused and in its packaging. Return shipping is yours unless the piece was faulty or not what was ordered. Engraved and made-to-order pieces are the exception and cannot be returned.',
      ar: 'نعم، خلال أربعة عشر يومًا من الاستلام، غير مستعملة وفي عبوتها. وتقع تكلفة شحن الإرجاع عليك إلا إذا كانت القطعة معيبة أو مخالفة للطلب. ويُستثنى من ذلك القطع المحفورة والمصنوعة بالطلب، فلا تُرَدّ.',
    },
  },
  {
    question: { en: 'How do I actually pay?', ar: 'كيف أدفع فعليًا؟' },
    answer: {
      en: 'Through WhatsApp, for now. Send us the basket, we confirm the total including shipping, and we arrange payment by bank transfer or a payment link. The checkout page on this site is a demonstration and takes no money.',
      ar: 'عبر واتساب، في الوقت الحالي. أرسل لنا السلة، فنؤكّد الإجمالي شاملًا الشحن، ونرتّب الدفع بتحويل بنكي أو برابط دفع. أما صفحة الدفع في هذا الموقع فهي للعرض التوضيحي ولا تستوفي أي مبلغ.',
    },
  },
];

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { OrderSummary } from '@/components/order-summary';
import { GlyphLoader } from '@/components/glyphs';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  // An order is nobody's business but the buyer's and ours.
  return { title: dict.order.title, robots: { index: false, follow: false } };
}

export default async function OrderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  return (
    <Suspense fallback={<GlyphLoader label={dict.common.loading} />}>
      <OrderSummary locale={typed} dict={dict} />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { faq } from '@/data/faq';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.faq.title,
    description: dict.faq.lead,
    alternates: { canonical: `/${locale}/faq`, languages: { en: '/en/faq', ar: '/ar/faq' } },
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((entry) => ({
      '@type': 'Question',
      name: entry.question[typed],
      acceptedAnswer: { '@type': 'Answer', text: entry.answer[typed] },
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="font-display text-4xl text-ink-900">{dict.faq.title}</h1>
      <p className="mt-4 text-lg text-ink-700">{dict.faq.lead}</p>

      <dl className="mt-12 divide-y divide-papyrus-300/70 border-y border-papyrus-300/70">
        {faq.map((entry) => (
          <div key={entry.question.en} className="py-6">
            <dt className="font-display text-lg text-ink-900">{entry.question[typed]}</dt>
            <dd className="mt-2 leading-relaxed text-ink-700">{entry.answer[typed]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

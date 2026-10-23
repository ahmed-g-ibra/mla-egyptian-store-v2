import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { GlyphFrieze } from '@/components/glyphs';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.sizeGuide.title,
    description: dict.sizeGuide.lead,
    alternates: {
      canonical: `/${locale}/size-guide`,
      languages: { en: '/en/size-guide', ar: '/ar/size-guide' },
    },
  };
}

export default async function SizeGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  const sections = [
    { heading: dict.sizeGuide.howTitle, body: dict.sizeGuide.howBody },
    { heading: dict.sizeGuide.unitsTitle, body: dict.sizeGuide.unitsBody },
    { heading: dict.sizeGuide.commonTitle, body: dict.sizeGuide.commonBody },
    { heading: dict.sizeGuide.missingTitle, body: dict.sizeGuide.missingBody },
  ];

  /** cm → inches, for the quick conversion table. */
  const rows = [5, 10, 15, 20, 25, 30, 40];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl text-ink-900">{dict.sizeGuide.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-700">{dict.sizeGuide.lead}</p>

      <GlyphFrieze className="my-10" />

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl text-ink-900">{section.heading}</h2>
            <p className="mt-3 leading-relaxed text-ink-700">{section.body}</p>
          </section>
        ))}
      </div>

      <table className="mt-12 w-full border-collapse text-sm">
        <caption className="pb-3 text-start font-display text-xl text-ink-900">
          {dict.sizeGuide.unitsTitle}
        </caption>
        <thead>
          <tr className="border-b border-papyrus-300">
            <th scope="col" className="py-2 text-start text-xs uppercase tracking-widest text-ink-500">
              cm
            </th>
            <th scope="col" className="py-2 text-start text-xs uppercase tracking-widest text-ink-500">
              in
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((cm) => (
            <tr key={cm} className="border-b border-papyrus-200">
              <td className="py-2 text-ink-900" dir="ltr">
                {cm}
              </td>
              <td className="py-2 text-ink-700" dir="ltr">
                {Math.round((cm / 2.54) * 10) / 10}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

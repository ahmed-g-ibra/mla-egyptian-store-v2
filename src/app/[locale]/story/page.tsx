import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { storySections } from '@/data/story';
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
    title: dict.story.title,
    description: dict.story.lead,
    alternates: { canonical: `/${locale}/story`, languages: { en: '/en/story', ar: '/ar/story' } },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl text-ink-900">{dict.story.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-700">{dict.story.lead}</p>
      <GlyphFrieze className="my-10" />
      <div className="space-y-10">
        {storySections.map((section) => (
          <section key={section.heading.en}>
            <h2 className="font-display text-xl text-ink-900">{section.heading[typed]}</h2>
            <p className="mt-3 leading-relaxed text-ink-700">{section.body[typed]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

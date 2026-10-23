import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { store, whatsappLink } from '@/config/store';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.contact.title,
    description: dict.contact.lead,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { en: '/en/contact', ar: '/ar/contact' },
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  const rows = [
    {
      label: dict.contact.whatsapp,
      value: store.phoneDisplay,
      href: whatsappLink(dict.contact.whatsappIntro),
      external: true,
    },
    { label: dict.contact.email, value: store.email, href: `mailto:${store.email}`, external: false },
    {
      label: dict.contact.phone,
      value: store.phoneDisplay,
      href: `tel:${store.whatsappNumber}`,
      external: false,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl text-ink-900">{dict.contact.title}</h1>
      <p className="mt-4 text-lg text-ink-700">{dict.contact.lead}</p>

      <dl className="mt-12 divide-y divide-papyrus-300/70 border-y border-papyrus-300/70">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5">
            <dt className="w-28 shrink-0 text-xs uppercase tracking-widest text-ink-500">
              {row.label}
            </dt>
            <dd>
              <a
                href={row.href}
                dir="ltr"
                {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="break-all text-ink-900 underline decoration-gold-500 underline-offset-4 transition-colors hover:text-gold-600"
              >
                {row.value}
              </a>
            </dd>
          </div>
        ))}
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5">
          <dt className="w-28 shrink-0 text-xs uppercase tracking-widest text-ink-500">
            {dict.contact.basedIn}
          </dt>
          <dd className="text-ink-900">
            {store.city[typed]}, {store.country[typed]}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-sm text-ink-500">{dict.contact.hours}</p>
    </div>
  );
}

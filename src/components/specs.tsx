import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { hasSpecs, type Specs } from '@/data/specs';

/** An A4 sheet stood on its long edge. Nearly everyone has one to hand. */
const REFERENCE_CM = 29.7;

const toInches = (cm: number) => Math.round((cm / 2.54) * 10) / 10;

const formatCm = (cm: number, locale: Locale) =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-AE-u-nu-latn' : 'en-AE', {
    maximumFractionDigits: 1,
  }).format(cm);

/**
 * Height against a familiar object. A statue bought online is almost always
 * pictured alone against a white background, which tells you nothing about
 * how big it is; this does.
 */
function ScaleComparison({
  heightCm,
  locale,
  dict,
}: {
  heightCm: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const max = Math.max(heightCm, REFERENCE_CM);
  const bar = (cm: number) => ({ height: `${Math.round((cm / max) * 100)}%` });

  return (
    <figure className="mt-6 rounded-sm border border-papyrus-300/70 bg-papyrus-50 p-5">
      <div className="flex h-32 items-end gap-6" aria-hidden>
        <div className="flex h-full flex-col justify-end">
          <div
            className="w-14 rounded-t-sm bg-gold-400 ring-1 ring-gold-600/40"
            style={bar(heightCm)}
          />
        </div>
        <div className="flex h-full flex-col justify-end">
          <div
            className="w-14 rounded-t-sm border border-dashed border-ink-500/50 bg-papyrus-200/60"
            style={bar(REFERENCE_CM)}
          />
        </div>
      </div>

      <figcaption className="mt-3 flex gap-6 text-xs text-ink-500">
        <span className="w-14 text-center">
          <span className="block font-semibold text-ink-900" dir="ltr">
            {formatCm(heightCm, locale)} cm
          </span>
          {dict.specs.thisPiece}
        </span>
        <span className="w-14 text-center">
          <span className="block font-semibold text-ink-700" dir="ltr">
            30 cm
          </span>
          {dict.specs.reference}
        </span>
      </figcaption>
    </figure>
  );
}

export function SpecTable({
  specs,
  locale,
  dict,
  collectionName,
  askHref,
}: {
  specs: Specs;
  locale: Locale;
  dict: Dictionary;
  collectionName?: string;
  askHref: string;
}) {
  const measurements: { label: string; cm: number }[] = [
    { label: dict.product.height, cm: specs.heightCm ?? NaN },
    { label: dict.specs.width, cm: specs.widthCm ?? NaN },
    { label: dict.specs.depth, cm: specs.depthCm ?? NaN },
  ].filter((row) => Number.isFinite(row.cm));

  return (
    <section className="mt-8 border-t border-papyrus-300/70 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-ink-900">{dict.specs.title}</h2>
        <Link
          href={`/${locale}/size-guide`}
          className="text-xs text-gold-600 underline underline-offset-4"
        >
          {dict.specs.sizeGuide}
        </Link>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-3">
        {collectionName ? (
          <div>
            <dt className="text-xs uppercase tracking-widest text-ink-500">
              {dict.product.collection}
            </dt>
            <dd className="mt-1 text-ink-900">{collectionName}</dd>
          </div>
        ) : null}

        {measurements.map((row) => (
          <div key={row.label}>
            <dt className="text-xs uppercase tracking-widest text-ink-500">{row.label}</dt>
            <dd className="mt-1 text-ink-900" dir="ltr">
              {formatCm(row.cm, locale)} cm
              <span className="text-ink-500"> ({toInches(row.cm)}&quot;)</span>
            </dd>
          </div>
        ))}

        {specs.weightKg !== undefined ? (
          <div>
            <dt className="text-xs uppercase tracking-widest text-ink-500">{dict.specs.weight}</dt>
            <dd className="mt-1 text-ink-900" dir="ltr">
              {formatCm(specs.weightKg, locale)} kg
            </dd>
          </div>
        ) : null}

        {specs.material ? (
          <div>
            <dt className="text-xs uppercase tracking-widest text-ink-500">
              {dict.product.material}
            </dt>
            <dd className="mt-1 text-ink-900">{specs.material[locale]}</dd>
          </div>
        ) : null}
      </dl>

      {specs.heightCm !== undefined ? (
        <ScaleComparison heightCm={specs.heightCm} locale={locale} dict={dict} />
      ) : null}

      {!hasSpecs(specs) ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-500">
          {dict.specs.notMeasured}{' '}
          <a
            href={askHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-malachite-700 underline underline-offset-4"
          >
            {dict.specs.askForIt}
          </a>
        </p>
      ) : null}
    </section>
  );
}

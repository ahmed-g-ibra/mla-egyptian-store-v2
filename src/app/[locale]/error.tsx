'use client';

import { useEffect } from 'react';
import { en } from '@/i18n/dictionaries/en';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-28 text-center sm:px-6">
      <h1 className="font-display text-3xl text-ink-900">{en.common.error}</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-sm bg-ink-900 px-6 py-3 font-display text-sm uppercase tracking-[0.15em] text-papyrus-100 transition-colors hover:bg-lapis-800"
      >
        {en.common.backHome}
      </button>
    </div>
  );
}

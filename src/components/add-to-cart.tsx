'use client';

import { useEffect, useState } from 'react';
import { useCart } from './providers';
import type { Dictionary } from '@/i18n/get-dictionary';

export function AddToCart({ slug, dict }: { slug: string; dict: Dictionary }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [justAdded]);

  return (
    <button
      type="button"
      onClick={() => {
        add(slug);
        setJustAdded(true);
      }}
      className="w-full rounded-sm bg-ink-900 px-6 py-3.5 font-display text-sm uppercase tracking-[0.15em] text-papyrus-100 transition-colors hover:bg-lapis-800 sm:w-auto"
    >
      {justAdded ? dict.product.added : dict.product.addToCart}
    </button>
  );
}

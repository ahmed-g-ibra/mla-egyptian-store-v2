'use client';

import { useCart } from './providers';

export function CartBadge() {
  const { count, ready } = useCart();
  if (!ready || count === 0) return null;

  return (
    <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-carnelian-600 px-1 text-[10px] font-semibold text-papyrus-50 tabular-nums">
      {count}
    </span>
  );
}

'use client';

import { useState } from 'react';

/** Copies the delivery address in one tap, for pasting into a courier form. */
export function CopyButton({ text, label = 'Copy address' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          // Clipboard access is refused in some in-app browsers. The address is
          // on screen either way, so this stays quiet.
        }
      }}
      className="min-h-9 cursor-pointer text-xs font-medium uppercase tracking-[0.12em] text-ink-500 underline underline-offset-4 transition-colors hover:text-lapis-800"
    >
      {done ? 'Copied' : label}
    </button>
  );
}

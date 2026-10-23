'use client';

import { useEffect } from 'react';

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

/**
 * Reveals the hieroglyph ornament once its face is usable.
 *
 * The request is deliberately deferred to idle. `display: optional` and
 * `preload: false` keep the face off the critical path, but calling
 * `fonts.load()` during page load puts 260 KB straight back onto it, competing
 * with the hero image for bandwidth. Ornament can wait for a quiet moment.
 */
export function GlyphReady() {
  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      if (!cancelled) document.documentElement.classList.add('glyphs-ready');
    };

    if (!('fonts' in document)) {
      reveal();
      return;
    }

    const start = () => {
      if (cancelled) return;
      document.fonts
        .load('1rem "Noto Sans Egyptian Hieroglyphs"')
        .then((faces) => {
          if (faces.length > 0) reveal();
        })
        .catch(() => {
          // No ornament on this visit. Nothing else depends on it.
        });
    };

    const win = window as IdleWindow;
    const idle = typeof win.requestIdleCallback === 'function';
    const handle = idle
      ? win.requestIdleCallback!(start, { timeout: 4000 })
      : window.setTimeout(start, 2000);

    return () => {
      cancelled = true;
      if (idle) win.cancelIdleCallback?.(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  return null;
}

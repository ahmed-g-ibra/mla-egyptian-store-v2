import type { ReactNode } from 'react';

/**
 * Decorative hieroglyphs. Always aria-hidden: they are ornament, and a screen
 * reader announcing "Egyptian hieroglyph eye" between every section is noise.
 *
 * `width` reserves the slot in em — set it to the number of signs inside, so
 * the layout is identical before and after the face arrives.
 */
export function Glyph({
  children,
  className = '',
  width = 1,
}: {
  children: ReactNode;
  className?: string;
  width?: number;
}) {
  return (
    <span aria-hidden className={`glyph-slot ${className}`} style={{ minWidth: `${width}em` }}>
      <span className="glyph-font">{children}</span>
    </span>
  );
}

/** A frieze of repeating signs, used to close a section. */
export function GlyphFrieze({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-12 bg-gold-500/40 sm:w-24" />
      <Glyph className="text-lg text-gold-600/70" width={5}>
        𓆓𓏏𓇯𓆓𓏏
      </Glyph>
      <span className="h-px w-12 bg-gold-500/40 sm:w-24" />
    </div>
  );
}

/**
 * The store name inside a cartouche — the oval Egyptian scribes drew around a
 * royal name. SVG, so it is exact at any size and costs no font.
 */
export function Cartouche({
  label,
  className = '',
  titleId,
}: {
  label: string;
  className?: string;
  titleId?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 56"
      className={className}
      role="img"
      aria-labelledby={titleId}
      preserveAspectRatio="xMidYMid meet"
    >
      {titleId ? <title id={titleId}>{label}</title> : null}
      <rect
        x="2"
        y="2"
        width="156"
        height="52"
        rx="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* The bar that closes the loop — a cartouche is a rope, tied at one end. */}
      <line x1="10" y1="12" x2="10" y2="44" stroke="currentColor" strokeWidth="4" />
      <text
        x="86"
        y="29"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontSize="24"
        letterSpacing="6"
        fontFamily="var(--font-display)"
      >
        {label}
      </text>
    </svg>
  );
}

/**
 * Loading state. Five signs breathing in sequence once the face is up; five
 * reserved slots, and nothing jumping, before that.
 */
export function GlyphLoader({ label }: { label: string }) {
  const signs = ['𓂀', '𓆣', '𓋹', '𓊽', '𓍊'];
  return (
    <div className="flex items-center justify-center gap-2 py-16" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {signs.map((sign, i) => (
        <span
          key={sign}
          aria-hidden
          className="glyph-slot animate-glyph-pulse text-2xl text-gold-600"
          style={{ animationDelay: `${i * 0.14}s` }}
        >
          <span className="glyph-font">{sign}</span>
        </span>
      ))}
    </div>
  );
}

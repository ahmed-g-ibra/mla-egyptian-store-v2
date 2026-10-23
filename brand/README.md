# MLA logo

The mark is an Egyptian **cartouche** — the rope loop scribes drew around a
royal name — holding the name twice over:

- **MLA** in Cinzel Bold, the inscriptional Roman face the site sets headings in.
- **𓅓 𓃭 𓄿** — the same name spelled phonetically: the owl (*m*), the recumbent
  lion (*rw/l*) and the Egyptian vulture (*ꜣ*). Real signs from the Unicode
  Egyptian Hieroglyphs block, not invented shapes.

It is drawn in code as `Cartouche` in `src/components/glyphs.tsx`, tinted with
`currentColor`. These files are exports of exactly that.

## Both runs are outlines

Neither Cinzel nor the hieroglyph face is needed to render this. The supplied
artwork used live text with a Google Fonts `@import`, which works when you open
the SVG directly but silently substitutes a fallback when it is the `src` of an
`<img>` — and in Figma, Illustrator and most rasterisers. Outlines remove the
dependency entirely.

## The spacing was corrected

In the supplied version the **A of MLA overlapped the owl by 4.7 units**, only
visible above about 200px wide. Rebuilding from measured ink bounds gives a
clear 5-unit gap and symmetric 8.3-unit margins inside the loop, with the type
6% smaller so both runs fit the frame. The viewBox went from 124×44 to 126×44,
a ratio change of 2.818 to 2.864.

## Files

| File | Use |
| --- | --- |
| `mla-logo-ink.svg` | On papyrus or any light ground |
| `mla-logo-gold.svg` | On ink or any dark ground |
| `mla-logo-lapis.svg` | Single colour, for print or a stamp |
| `mla-logo-ink-1024.png` · `-512.png` | Transparent raster |
| `mla-logo-gold-1024.png` | Gold on ink |
| `mla-avatar-papyrus-1024.png` | Square, for a social profile |
| `mla-avatar-ink-1024.png` | Square on ink |

## Colours

| Role | Hex |
| --- | --- |
| Ink | `#14110c` |
| Gold on dark | `#e0c877` |
| Lapis | `#16365f` |
| Papyrus ground | `#f5eedf` |

## The app icon

`src/app/icon.png` and `apple-icon.png` are the M of MLA alone, gold on ink,
in the same Cinzel Bold and the cartouche's corner radius. The full lockup
cannot survive a 16px browser tab — the hieroglyphs turn to mush — so the
icon uses the letter instead of shrinking the mark. They replaced the default
Next.js logo, which had been shipping on the live site.

## Rules

- **Do not use it below about 40px tall.** The hieroglyphs stop resolving and
  read as a smudge. The site header runs it at 48px for this reason. If you
  need something smaller — a favicon, an app icon — use the MLA letters alone
  rather than shrinking the full lockup.
- Keep clear space of at least half the loop's height on every side.
- Do not re-type the wordmark in another face; the outlines are the asset.
- Do not stretch it. The lockup is a fixed 126:44.

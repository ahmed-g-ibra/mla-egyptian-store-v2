# MLA logo

The logo is drawn in code — `Cartouche` in `src/components/glyphs.tsx` — so the
site has no logo image file. These are exports of exactly that component.

The wordmark is **Cinzel**, converted to outlines. Nothing here depends on the
font being installed, so it renders identically in a browser, in Figma or
Illustrator, and in any rasteriser.

| File | Use |
| --- | --- |
| `mla-logo-ink.svg` | On papyrus or any light ground — the header lockup |
| `mla-logo-gold.svg` | On ink or any dark ground — the footer lockup |
| `mla-logo-lapis.svg` | Single-colour lapis, for print or stamps |
| `mla-logo-ink-1024.png` | Transparent raster, 1024px wide |
| `mla-logo-ink-512.png` | Transparent raster, 512px wide |
| `mla-logo-gold-1024.png` | Gold on ink, 1024px wide |
| `mla-avatar-papyrus-1024.png` | Square, for a social profile picture |
| `mla-avatar-ink-1024.png` | Square on ink, for a dark profile |

## Colours

| Role | Hex |
| --- | --- |
| Ink | `#14110c` |
| Gold (on dark) | `#e0c877` |
| Lapis | `#16365f` |
| Papyrus ground | `#f5eedf` |

## Rules

- Keep clear space of at least half the cartouche height on every side.
- Do not re-type the wordmark in another face; the outlines are the asset.
- Do not stretch it. The cartouche is a fixed 160:56.
- The bar sits at the **start** edge. In Arabic layouts the component mirrors
  with the page; these files are the left-to-right version.

## Regenerating

The SVGs were produced from the deployed component's geometry with the Cinzel
outlines extracted from the font the site ships. Verified against production:
the wordmark bounding box measured `x=50.54, width=70.92` in both.

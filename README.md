# MLA — Egyptian Store (V2)

A bilingual (EN/AR) storefront selling contemporary Egyptian reproductions into
the six GCC markets. Next.js App Router, TypeScript, Tailwind 4, no database.

Everything here is a **reproduction**. Nothing on this site is an antiquity, and
the copy is written so no customer could reasonably conclude otherwise. If you
change product text, keep it that way — see *Honest description* below.

---

## Running it

```bash
npm install
npm run dev     # http://localhost:3000 — redirects to /en or /ar
npm run build   # production build
npm run lint
```

## What lives where

| Path | What it holds |
|---|---|
| `src/config/store.ts` | **Edit this first.** WhatsApp number, email, city, copyright year, site URL. |
| `src/data/products.ts` | The 30 products: EN/AR names, taglines, descriptions, prices, images. |
| `src/data/collections.ts` | The six collections and their hieroglyph. |
| `src/data/faq.ts` | Shipping figures + the FAQ, EN/AR. |
| `src/data/story.ts` | The story page, EN/AR. |
| `src/lib/currency.ts` | The six GCC currencies, their rates, decimals and the markup. |
| `src/i18n/dictionaries/` | Every other string, `en.ts` and `ar.ts`. |
| `scripts/source-products.json` | The raw scraped rows the catalogue was built from. |
| `scripts/fetch-images.mjs` | Downloads and converts the product photos. |

---

## Editing products

Products are plain typed objects in `src/data/products.ts`. To change wording,
price or ordering, edit the entry. The type is enforced, so a missing Arabic
string is a build error rather than a blank space on the site.

```ts
{
  slug: 'bastet-cat-statue',       // also the URL and the image folder name
  collection: 'gods',
  name: { en: 'Bastet, Seated', ar: 'باستت جالسة' },
  tagline: { en: '…', ar: '…' },   // one line, used on cards and in meta tags
  description: { en: '…', ar: '…' },
  heightCm: null,                   // null renders "On request — ask us"
  material: null,
  priceUsd: 26.5,                   // supplier's price, before markup
  compareAtUsd: null,               // a real "was" price, or null
  featured: true,                   // shows on the home page
  images: [...],                    // /public/products/<slug>/1..5.webp
}
```

**`heightCm` and `material` are `null` on most products, deliberately.** The
supplier feeds carried no dimensions and no materials, and inventing them would
put a false spec on a product page. Fill them in as you confirm them with the
supplier; until then the page says "on request".

### Adding a product

1. Add a row to `scripts/source-products.json` with its `slug` and image URLs.
2. `node scripts/fetch-images.mjs` — downloads, converts to WebP, skips what
   already exists, and writes `scripts/failed-images.json` if anything 404s.
3. Add the matching entry to `src/data/products.ts`.

---

## Prices, currency and the markup

Each product stores **one** price: `priceUsd`, exactly as the supplier listed
it. Everything the customer sees is derived:

```
displayed price = priceUsd × MARKUP × rate[currency], rounded
```

- `MARKUP` is in `src/lib/currency.ts`. It is currently **1.15** (15%).
- Rates are in the same file.

Keeping the supplier's figure as the stored value means a re-scrape updates
cleanly and the margin stays one number in one place.

### Why the rates are a static file and not an API

Five of the six are pegged to the US dollar by their own central banks — AED,
SAR, QAR, OMR and BHD do not drift, and a live API call would spend a network
round trip fetching five constants. **Only KWD floats** (it tracks an
undisclosed basket) and it moves well under 1% a year.

**Check KWD once a quarter** and update `currencyMeta.KWD.rate`. The rest need
touching only if a central bank re-pegs, which is news.

Decimals are per-currency and already correct: AED/SAR/QAR carry 2, and
OMR/BHD/KWD carry 3.

### How a visitor's currency gets picked

1. `src/proxy.ts` reads Vercel's `x-vercel-ip-country` header at the edge and
   writes a `mla_currency` cookie.
2. The visitor can override it from the header; that writes the same cookie.
3. Pages are rendered statically in **AED** and corrected on mount if the
   cookie says otherwise.

That last point is a deliberate trade: every page stays static and fast, and
non-AED visitors see one price correction on first paint instead of the whole
site waiting on a per-visitor render.

---

## Translations

`src/i18n/dictionaries/en.ts` defines the shape; `ar.ts` must match it exactly
or the build fails. Add a key to `en.ts` first, then `ar.ts`.

The dictionary is plain data — no functions — because it is passed to client
components. For plurals, add two keys (see `resultCountOne` / `resultCountMany`)
rather than a function.

Arabic is a full RTL layout, not translated English: `dir="rtl"` drives logical
CSS properties (`ms-*`, `start-*`) throughout, so spacing and alignment mirror
on their own.

### Fonts

- English: Cinzel (display) + EB Garamond (body)
- Arabic: Noto Kufi Arabic, both display and body

Each locale loads **only its own faces** — an English page never downloads the
Arabic font and vice versa. This is done by applying only that locale's CSS
variables in `src/app/[locale]/layout.tsx`; the RTL block in `globals.css`
re-points `--font-display` and `--font-body` rather than overriding headings,
because a `font-*` utility sits in a later cascade layer than any base rule and
would win.

Arabic uses one family rather than a Kufi/Amiri pair: the second face cost
another ~120 KB on every Arabic page, which is the wrong trade for this market.

### Hieroglyphs

Decorative signs use the Unicode Egyptian Hieroglyphs block via Noto Sans
Egyptian Hieroglyphs. That face is ~260 KB for about twenty signs, so:

- it is never preloaded and uses `display: optional`;
- the signs are `display: none` until the face has actually loaded — a merely
  *hidden* element still counts as using the family and the browser fetches the
  whole thing immediately, which was worth 1.5s of LCP on mobile;
- `GlyphReady` requests it at idle and adds `.glyphs-ready`;
- each sign sits in a slot sized in `em`, so revealing it shifts nothing.

On a slow connection the ornament simply never appears. Nothing depends on it —
every glyph is `aria-hidden`.

---

## Shipping figures

In `src/data/faq.ts`:

```ts
export const shipping = {
  freeOverAed: 400,
  nearRateAed: 45,   // Oman, UAE
  farRateAed: 75,    // Saudi, Qatar, Bahrain, Kuwait
  daysGcc: 15,
};
```

Confirmed by the owner on 23 October 2026. The FAQ prose in the same file
quotes these numbers in both languages, so if you change a figure here, edit
the English and Arabic answers to match — they are not interpolated.

## Honest description

The FAQ, the story page and every product page state that the pieces are
contemporary reproductions, that Egypt prohibits exporting antiquities, and that
parcels are declared accurately. This is not decoration:

- describing a reproduction as an antiquity is a misrepresentation under
  Omani and UAE consumer law;
- a parcel declared as an antique invites seizure at customs.

The policy drafts have **not been reviewed by a lawyer.** Get them checked
before launch.

---

## Checkout

The checkout page is a **demonstration**. It validates, shows a summary and
confirms — and takes no money. Real orders go through WhatsApp, which every cart
and product page links to with the basket pre-filled.

To make it real you need a payment provider; the order summary and address form
are already shaped to hand over to one.

---

## Deploying

Pushes to `main` deploy automatically once the repo is linked to Vercel.

After attaching a custom domain, update `store.siteUrl` in
`src/config/store.ts` — canonical URLs, `hreflang`, Open Graph images, the
sitemap and the product structured data all read from it.

### Measured on a local production build

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/en` mobile | 96–97 | 100 | 100 | 100 |
| `/ar` mobile | 93 | 100 | 100 | 100 |
| `/en` desktop | 96 | 100 | 100 | 100 |

CLS is 0 on every page. These are local numbers against `npm run start`;
Vercel's CDN caches the optimised images, so production should be at least this
good.

## Known gaps

- `heightCm` / `material` are null on 28 of 30 products (see above).
- Policies are not legally reviewed.
- Product photography comes from the suppliers' own listings.
- `npm audit` reports advisories in the ESLint toolchain only — dev
  dependencies, nothing in the shipped bundle.

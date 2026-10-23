# MLA — Egyptian Store

A bilingual (English / Arabic) storefront selling contemporary Egyptian
reproductions into the six GCC markets. Next.js App Router, TypeScript,
Tailwind 4. No database — the catalogue is typed data in the repo.

**Live: https://mla-egyptian-store-v2.vercel.app**

Everything here is a **reproduction**. Nothing on this site is an antiquity,
and the copy is written so no customer could reasonably conclude otherwise.
See *Honest description* before changing any product text.

---

## Where to change things

| I want to… | Edit | Section |
| --- | --- | --- |
| **Change a price** | `src/data/products.ts` → `priceUsd` | [Prices](#prices-and-discounts) |
| **Put something on sale** | `src/data/products.ts` → `compareAtUsd` | [Prices](#prices-and-discounts) |
| **Change the margin on everything** | `src/lib/currency.ts` → `MARKUP` | [Prices](#prices-and-discounts) |
| **Change the WhatsApp number or email** | `src/config/store.ts` | [Orders](#orders) |
| **Add a product's measurements** | `src/data/specs.ts` | [Measurements](#measurements) |
| **Change shipping rates** | `src/data/faq.ts` → `shipping` | [Shipping](#shipping) |
| **Change any wording** | `src/i18n/dictionaries/en.ts` + `ar.ts` | [Translations](#translations) |
| **Add a product** | `scripts/source-products.json` (local), then `products.ts` | [Products](#products) |
| **Update exchange rates** | `src/lib/currency.ts` → `currencyMeta` | [Currency](#currency) |

---

## Running it

```bash
npm install
npm run dev     # http://localhost:3000 — redirects to /en or /ar
npm run build
npm run lint
```

---

## Prices and discounts

### Changing a price

Open `src/data/products.ts`, find the product by its `slug` or English name,
and change **`priceUsd`**. That is the only place a price lives.

```ts
{
  slug: 'nefertiti-bust',
  priceUsd: 29,          // the supplier's price
  compareAtUsd: null,    // set this to put it on sale
}
```

**`priceUsd` is not what the customer pays.** It is the supplier's listed
price. The site multiplies by your markup and then converts:

```
what the customer sees = priceUsd × MARKUP × rate[their currency], rounded
```

So `priceUsd: 29` displays as **AED 122**, not 29 of anything. If you think in
dirhams, divide: for AED 150 on the page, set `priceUsd` to about `35.5`.

### Putting something on sale

Set **`compareAtUsd`** to the old, higher price and lower `priceUsd` to the new
one. 25% off a $29 piece:

```ts
priceUsd: 21.75,
compareAtUsd: 29,
```

That one field switches on three things at once:

- a red **SALE** badge (**خصم** in Arabic) on the product card
- the old price struck through beside the new one, on the card and the page
- both figures converted to whatever currency the visitor is browsing in

You never type a percentage — the discount is the gap between the two numbers.
Set `compareAtUsd` back to `null` to end the sale.

### The margin

`MARKUP` in `src/lib/currency.ts` is currently **1.15** (15%), applied to every
product. Change it there and every price on the site moves at once.

Your margin is 15% of cost, which is **13% of what the customer pays**. Worth
holding against the free-shipping threshold in [Shipping](#shipping).

### The build refuses a nonsensical sale

`src/data/validate.ts` runs when `products.ts` loads, so `next build` and
`next dev` both fail if any `compareAtUsd` is less than or equal to its
`priceUsd` — a "sale" at the same or a higher price. The error names the
product and prints both numbers.

This is not hypothetical: the Khafre statue arrived from the supplier feed with
both fields at $160.

---

## Products

Products are typed objects in `src/data/products.ts`. The type is enforced, so
a missing Arabic string is a build error rather than a blank space on the site.

```ts
{
  slug: 'bastet-cat-statue',       // the URL and the image folder name
  collection: 'gods',
  name: { en: 'Bastet, Seated', ar: 'باستت جالسة' },
  heroName: { en: 'Bastet', ar: 'باستت' },  // optional, for the home headline
  tagline: { en: '…', ar: '…' },
  description: { en: '…', ar: '…' },
  priceUsd: 26.5,
  compareAtUsd: null,
  featured: true,                   // eligible for the home page
  images: [...],                    // order matters — first one leads
}
```

`images` is not always file order. Some supplier photographs have sizing
labels burned into them; the clean shot is listed first and the rest stay in
the gallery.

### Adding a product

1. Add a row to `scripts/source-products.json` with its slug and image URLs.
   That file is **gitignored** — it records which supplier each photograph came
   from, which is nobody else's business. Keep your copy; it is not in the
   repository.
2. `node scripts/fetch-images.mjs` — downloads, converts to WebP, skips what
   exists, and writes `scripts/failed-images.json` if anything 404s.
3. Add the entry to `src/data/products.ts`.
4. `node scripts/build-og-images.mjs` — builds its share card.

### Measurements

All physical facts live in `src/data/specs.ts`, one line per slug:

```ts
'sphinx-box': { heightCm: 11 },
'nefertiti-bust': {},            // not measured yet
'canopic-jar-set-four': {
  heightCm: 24, widthCm: 9, depthCm: 9, weightKg: 1.8,
  material: { en: 'Painted resin', ar: 'راتنج مطليّ' },
},
```

Kept apart from `products.ts` because that file is generated from the supplier
feeds and gets regenerated on a re-scrape; measurements are taken by hand and
must survive that.

**An empty `{}` is a statement, not a gap.** The page says the piece has not
been measured and offers to measure it on WhatsApp — better than a number
nobody checked. Two entries are pre-filled from sizes the source listings
stated; the other 28 are waiting.

Where a height exists the page draws it against a sheet of A4, and the figures
feed the product's structured data. `/size-guide` explains how each is taken.

---

## Orders

There is no payment on this site. An order is captured by the checkout form
and completed on WhatsApp.

1. The customer fills the checkout form and presses **Send my order**.
2. WhatsApp opens with the order already written, including a reference.
3. The confirmation page shows that reference, the totals, your contact
   details and a link to the order page.

### The reference

`MLA-YYMMDD-XXXX`, built by `src/lib/order-reference.ts` on submit — never
during render, because a random value produced while rendering differs between
server and client and breaks hydration.

The alphabet drops **O, I, 0 and 1**: this gets read aloud and typed back over
WhatsApp, where those are the characters people confuse.

### The order page

A WhatsApp click-to-chat link **carries text and nothing else** — you cannot
attach a photograph to one. Sending images would need the WhatsApp Business
API. So the message links to a page that shows them:

```
/en/order?ref=MLA-261024-T6W5&items=bastet-cat-statue~2,sphinx-box~1&cur=OMR&ctry=OM
```

The order is encoded in the URL rather than stored, because there is no
database and an order living in one browser's localStorage is no use to the
person receiving it. The same link opens for both sides, on any device. A
malformed link renders an apology and a way to reach you. The page is
`noindex`.

### WhatsApp links

Every link is built by `whatsappLink()` in `src/config/store.ts`, which uses
**api.whatsapp.com**, not the shorter wa.me.

That is not a style preference. On the owner's own network wa.me resolves and
the TCP connection opens, then the TLS handshake is reset by peer — SNI-level
domain blocking, which wa.me attracts because it is a generic Meta shortener.
api.whatsapp.com returned 200 for the same number at the same moment. Since
WhatsApp is the only way to place an order, a blocked link is a dead shop.
**Do not "simplify" it back.**

Change the number, email or city in `src/config/store.ts` and every one of
those places follows.

---

## Currency

Six GCC currencies. Each product stores **one** price and everything else is
derived.

### Why the rates are a static file and not an API

Five of the six are pegged to the US dollar by their own central banks — AED,
SAR, QAR, OMR and BHD do not drift, and a live API call would spend a network
round trip fetching five constants. **Only KWD floats** (a basket peg) and it
moves well under 1% a year.

**Check KWD once a quarter** and update `currencyMeta.KWD.rate`. The rest need
touching only if a central bank re-pegs, which is news.

Decimals are already correct: AED/SAR/QAR carry 2, OMR/BHD/KWD carry 3.

### How a visitor's currency is picked

1. `src/proxy.ts` reads Vercel's `x-vercel-ip-country` at the edge and writes
   a `mla_currency` cookie.
2. The header lets them override it; that writes the same cookie.
3. Pages render statically in **AED** and correct on mount if the cookie says
   otherwise.

A deliberate trade: every page stays static, and non-AED visitors see one
price correction on first paint instead of the whole site waiting on a
per-visitor render.

### One formatter

Every amount goes through `formatPrice()`. Use `{ convertFirst: false }` for
an already-converted figure such as a subtotal. Do not reach for `toFixed` —
that is how `OMR 34.800` ended up beside `OMR 12.8`.

---

## Translations

`src/i18n/dictionaries/en.ts` defines the shape; `ar.ts` must match it exactly
or the build fails. Add a key to `en.ts` first, then `ar.ts`.

The dictionary is plain data, no functions, because it is passed to client
components. For plurals add two keys rather than a function.

Arabic is a full RTL layout, not translated English: `dir="rtl"` drives logical
CSS properties (`ms-*`, `start-*`) throughout.

**Arabic is sometimes not a translation.** The home headline reads "from
Cairo's workshops to your door" rather than "made in Cairo", because the
English needs a verb agreeing with the piece's gender and أنوبيس and باستت
disagree. Match the promise, not the words.

### Fonts

- English: Cinzel (display) + EB Garamond (body)
- Arabic: Noto Kufi Arabic, both

Each locale loads **only its own faces**. The RTL block in `globals.css`
re-points `--font-display` and `--font-body` rather than overriding headings,
because a `font-*` utility sits in a later cascade layer than any base rule
and would win.

### Hieroglyphs

Decorative signs use the Unicode Egyptian Hieroglyphs block. That face is
~260 KB for about twenty signs, so it is never preloaded, uses
`display: optional`, and the signs are **`display: none`** until it loads — a
merely *hidden* element still counts as using the family and the browser
fetches the whole thing immediately, which was worth 1.5s of LCP. Each sign
sits in an `em`-sized slot, so revealing it shifts nothing.

On a slow connection the ornament never appears. Every glyph is `aria-hidden`.

---

## Shipping

In `src/data/faq.ts`:

```ts
export const shipping = {
  freeOverAed: 400,
  nearRateAed: 45,   // Oman, UAE
  farRateAed: 75,    // Saudi, Qatar, Bahrain, Kuwait
  daysGcc: 15,
};
```

Confirmed by the owner on 23 October 2026. The checkout and the order page
both compute from these. The FAQ prose quotes the numbers in both languages
and is **not** interpolated — change a figure here and edit those answers too.

⚠️ **Your margin is 13% of what the customer pays, and free shipping starts at
AED 400.** Break-even on a far-GCC order is about AED 575, so orders between
400 and 575 to Saudi, Qatar, Bahrain or Kuwait lose money on shipping. Either
raise the threshold or raise `MARKUP`.

---

## Brand and share cards

`brand/` holds the logo as vector and raster, with its own README covering the
hieroglyphs in the mark, the colours and the minimum size. The wordmark is
Cinzel converted to **outlines**, so nothing depends on the font being
installed.

`node scripts/build-og-images.mjs` writes `public/og/share.jpg` and one card
per product. They are **JPEG** while the site itself serves WebP, because
WhatsApp previews WebP unreliably and a link that previews blank on your
selling channel is worse than a slightly larger file.

---

## Honest description

The FAQ, the story page and every product page state that the pieces are
contemporary reproductions, that Egypt prohibits exporting antiquities, and
that parcels are declared accurately. This is not decoration:

- describing a reproduction as an antiquity is a misrepresentation under Omani
  and UAE consumer law;
- a parcel declared as an antique invites seizure at customs.

The policy drafts have **not been reviewed by a lawyer.** Get them checked
before launch.

---

## Deploying

Pushes to `main` deploy automatically once the repo is linked to Vercel.

After attaching a custom domain, update `store.siteUrl` in
`src/config/store.ts` — canonical URLs, `hreflang`, Open Graph images, the
sitemap, product structured data and the order links all read from it.

### Measured on a local production build

| | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| `/en` mobile | 99 | 100 | 100 | 100 |
| `/ar` mobile | 90–91 | 100 | 100 | 100 |

CLS is 0 on `/en`. `/ar` sits at the 90 line because its LCP element is the
headline waiting on the Arabic webfont.

---

## Licence

`LICENSE` — proprietary, all rights reserved. Published to be read, not
reused.

Deliberately **not** open source. A permissive licence would grant anyone the
right to run this shop, and re-theming it or swapping the catalogue would not
change that — so the notice rules out derivative works explicitly, not just
verbatim copying.

---

## Known gaps

- **28 of 30 products are unmeasured** — `src/data/specs.ts` is waiting.
- **Policies are not legally reviewed.**
- **No dark mode.** The whole palette is a papyrus ground, so a dark variant
  is a design project rather than a media query.
- **Free shipping loses money between AED 400 and 575** to the far GCC.
- **No analytics**, so nothing is measuring what any of this does.
- Product photography comes from the suppliers' own listings.
- `npm audit` advisories are in the ESLint toolchain only — dev dependencies,
  nothing in the shipped bundle.

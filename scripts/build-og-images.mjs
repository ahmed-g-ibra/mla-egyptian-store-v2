/**
 * Builds every Open Graph image the site serves.
 *
 * They are JPEG on purpose. The product photos themselves are WebP, which
 * WhatsApp previews unreliably — and WhatsApp is where this shop's orders
 * come from, so a link that previews blank is a lost sale rather than a
 * cosmetic problem.
 *
 * Re-runnable and idempotent: run it after changing the catalogue or the logo.
 *   node scripts/build-og-images.mjs
 */
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(root, 'public/og');
const W = 1200;
const H = 630;
const PAPYRUS = '#f5eedf';
const INK = '#14110c';
const PLATE = '#ffffff';   // the supplier photographs are shot on white
const BORDER = '#d8c9a9'; // papyrus-300, the site's own card border

/**
 * Slug plus its leading photograph, read from the product data rather than
 * the filesystem: the declared order is not always file order, because the
 * first shot on disk is sometimes the supplier's sizing image.
 */
const productSource = await readFile(join(root, 'src/data/products.ts'), 'utf8');
const products = [...productSource.matchAll(
  /slug: '([^']+)',[\s\S]*?images: \[([^\]]+)\]/g,
)].map(([, slug, list]) => ({
  slug,
  first: `${list.match(/'([^']+)'/)[1]}.webp`,
}));

const goldMark = await readFile(join(root, 'brand/mla-logo-gold.svg'));
const inkMark = await readFile(join(root, 'brand/mla-logo-ink.svg'));

const render = (svg, width) =>
  sharp(Buffer.from(svg), { density: 900 }).resize({ width }).png().toBuffer();

await mkdir(join(OUT, 'products'), { recursive: true });

/* ---- the site-wide card: the mark on ink, beside a piece ---- */
{
  const PANEL = 460;
  const mark = await render(goldMark, 520);
  const { width: mw, height: mh } = await sharp(mark).metadata();
  const product = await sharp(join(root, 'public/products/anubis-grand-sculpture/1.webp'))
    .resize(PANEL, H, { fit: 'cover', position: 'centre' })
    .toBuffer();
  const rule = await sharp({ create: { width: 360, height: 2, channels: 4, background: '#b08f22' } })
    .png().toBuffer();
  const seam = await sharp({ create: { width: 3, height: H, channels: 4, background: '#b08f22' } })
    .png().toBuffer();
  const centre = Math.round((W - PANEL) / 2);

  await sharp({ create: { width: W, height: H, channels: 4, background: INK } })
    .composite([
      { input: product, left: W - PANEL, top: 0 },
      { input: seam, left: W - PANEL - 3, top: 0 },
      { input: mark, left: centre - Math.round(mw / 2), top: Math.round(H / 2 - mh / 2) - 26 },
      { input: rule, left: centre - 180, top: Math.round(H / 2 + mh / 2) + 18 },
    ])
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
    .toFile(join(OUT, 'share.jpg'));
  console.log('  og/share.jpg');
}

/* ---- one card per product: the piece large, the mark small ---- */
{
  const mark = await render(inkMark, 190);
  const { width: mw, height: mh } = await sharp(mark).metadata();
  let built = 0;

  for (const { slug, first } of products) {
    const dir = join(root, 'public/products', slug);

    // `contain`, not `cover`: a statue cropped by a share card looks broken.
    const SIZE = H - 90;
    const product = await sharp(join(dir, first))
      .resize(SIZE, SIZE, { fit: 'contain', background: PLATE })
      .toBuffer();

    /*
     * The supplier photographs are shot on white, which reads as a sticker
     * stuck on the papyrus. A hairline frame turns that into a deliberate
     * plate — the same treatment the product cards use on the site.
     */
    const frame = await sharp({
      create: { width: SIZE + 2, height: SIZE + 2, channels: 4, background: BORDER },
    }).png().toBuffer();
    const left = Math.round((W - SIZE) / 2);

    await sharp({ create: { width: W, height: H, channels: 4, background: PAPYRUS } })
      .composite([
        { input: frame, left: left - 1, top: 44 },
        { input: product, left, top: 45 },
        { input: mark, left: W - mw - 44, top: H - mh - 36 },
      ])
      .jpeg({ quality: 86, chromaSubsampling: '4:4:4' })
      .toFile(join(OUT, 'products', `${slug}.jpg`));
    built += 1;
  }
  console.log(`  og/products/*.jpg  (${built} cards)`);
}

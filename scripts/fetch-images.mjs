/**
 * Downloads every product photo listed in source-products.json, converts it to
 * WebP and writes it to public/products/<slug>/<n>.webp.
 *
 * Re-runnable: existing files are skipped, so a failed run can be resumed.
 * next/image generates the responsive srcset from these at request time, so one
 * well-sized master per photo is all we store.
 */
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const MAX_EDGE = 1600;
const QUALITY = 82;
const root = fileURLToPath(new URL('..', import.meta.url));
const products = JSON.parse(
  await readFile(join(root, 'scripts/source-products.json'), 'utf8'),
);

const exists = async (p) => access(p).then(() => true).catch(() => false);

let done = 0, skipped = 0, failed = [];

for (const product of products) {
  for (const [i, url] of product.images.entries()) {
    const out = join(root, 'public/products', product.slug, `${i + 1}.webp`);
    if (await exists(out)) { skipped++; continue; }
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(dirname(out), { recursive: true });
      await sharp(buf)
        .rotate()
        .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      done++;
      process.stdout.write('.');
    } catch (err) {
      failed.push({ slug: product.slug, i: i + 1, url, err: String(err.message ?? err) });
      process.stdout.write('x');
    }
  }
}

console.log(`\n\nconverted ${done}, skipped ${skipped}, failed ${failed.length}`);
if (failed.length) {
  await writeFile(join(root, 'scripts/failed-images.json'), JSON.stringify(failed, null, 1));
  for (const f of failed.slice(0, 10)) console.log(`  ${f.slug} #${f.i}: ${f.err}`);
  process.exitCode = 1;
}

import type { Product } from './types';

/**
 * Invariants that must hold for the catalogue to be safe to publish.
 *
 * Run at module load in products.ts, so `next build` evaluates it while
 * generating pages and fails loudly rather than shipping a broken price. It
 * also fires in `next dev`, so a mistake surfaces as you type it.
 */
export function assertCatalogueIsSane(products: Product[]): void {
  const problems: string[] = [];

  for (const product of products) {
    const { slug, priceUsd, compareAtUsd } = product;

    if (compareAtUsd === null) continue;

    if (compareAtUsd <= priceUsd) {
      problems.push(
        `  ${slug}: compareAtUsd (${compareAtUsd}) must be greater than priceUsd (${priceUsd}).\n` +
          `    compareAtUsd is the OLD, higher price shown struck through. ` +
          (compareAtUsd === priceUsd
            ? `Both are ${priceUsd}, which would show a "sale" at the same price — set compareAtUsd to null to end the sale.`
            : `As written the "old" price is cheaper than the new one.`),
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `\n\nInvalid pricing in src/data/products.ts — ${problems.length} product(s):\n\n` +
        `${problems.join('\n\n')}\n\n` +
        `Fix the entries above, or set compareAtUsd to null where there is no sale.\n`,
    );
  }
}

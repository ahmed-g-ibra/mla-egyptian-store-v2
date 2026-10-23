import type { MetadataRoute } from 'next';
import { store } from '@/config/store';
import { locales } from '@/i18n/config';
import { products } from '@/data/products';
import { collections } from '@/data/collections';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/shop', '/collections', '/story', '/faq', '/size-guide', '/contact'];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const alternates = (path: string) => ({
      languages: Object.fromEntries(locales.map((l) => [l, `${store.siteUrl}/${l}${path}`])),
    });

    for (const path of staticPaths) {
      entries.push({
        url: `${store.siteUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
        alternates: alternates(path),
      });
    }

    for (const collection of collections) {
      const path = `/collections/${collection.id}`;
      entries.push({
        url: `${store.siteUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: alternates(path),
      });
    }

    for (const product of products) {
      const path = `/products/${product.slug}`;
      entries.push({
        url: `${store.siteUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: alternates(path),
      });
    }
  }

  return entries;
}

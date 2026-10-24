import type { MetadataRoute } from 'next';
import { store } from '@/config/store';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: [
      '/admin',
      '/en/cart',
      '/ar/cart',
      '/en/checkout',
      '/ar/checkout',
      '/en/order',
      '/ar/order',
      '/en/orders',
      '/ar/orders',
    ] },
    sitemap: `${store.siteUrl}/sitemap.xml`,
  };
}

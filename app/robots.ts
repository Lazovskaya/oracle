import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account', '/auth/', '/symbol-analyzer'],
      },
    ],
    sitemap: 'https://finforesee.com/sitemap.xml',
  };
}

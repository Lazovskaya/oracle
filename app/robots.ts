import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account/', '/auth/', '/admin/', '/performance/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/account/', '/auth/', '/admin/', '/performance/'],
      },
    ],
    sitemap: 'https://finforesee.com/sitemap.xml',
    host: 'https://finforesee.com',
  };
}

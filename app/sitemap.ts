import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://finforesee.com';

  // Fetch recent oracle runs
  const runs = await db.execute({
    sql: `
      SELECT id, created_at 
      FROM oracle_runs 
      ORDER BY created_at DESC 
      LIMIT 50
    `,
  });

  const oracleUrls = runs.rows.map((run: any) => ({
    url: `${baseUrl}/oracle`,
    lastModified: new Date(run.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/oracle`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/promo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...oracleUrls.slice(0, 10), // Only include last 10 runs
  ];
}

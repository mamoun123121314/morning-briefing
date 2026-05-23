import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://papaya-capybara-2d13fb.netlify.app';

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/history`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/settings`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/auth/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/changelog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];
}

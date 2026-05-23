import type { Article } from '@/types';

const CURATED_FALLBACK: Article[] = [
  { source: 'BBC', title: 'Scientists discover new method to recycle plastic waste efficiently', url: 'https://www.bbc.com/news', publishedAt: new Date().toISOString(), urlToImage: null },
  { source: 'Reuters', title: 'Global renewable energy capacity hits record high in Q1', url: 'https://www.reuters.com', publishedAt: new Date().toISOString(), urlToImage: null },
  { source: 'Nature', title: 'Breakthrough study reveals link between gut health and cognitive function', url: 'https://www.nature.com', publishedAt: new Date().toISOString(), urlToImage: null },
  { source: 'TechCrunch', title: 'Open-source AI models match proprietary performance in new benchmark', url: 'https://techcrunch.com', publishedAt: new Date().toISOString(), urlToImage: null },
  { source: 'WHO', title: 'Global life expectancy rises by five years since 2000', url: 'https://www.who.int', publishedAt: new Date().toISOString(), urlToImage: null },
  { source: 'NASA', title: 'New telescope captures clearest image of distant exoplanet', url: 'https://www.nasa.gov', publishedAt: new Date().toISOString(), urlToImage: null },
  { source: 'Harvard Health', title: 'Five-minute morning routine proven to reduce stress levels', url: 'https://www.health.harvard.edu', publishedAt: new Date().toISOString(), urlToImage: null },
  { source: 'The Guardian', title: 'Urban green spaces improve mental health, large study confirms', url: 'https://www.theguardian.com', publishedAt: new Date().toISOString(), urlToImage: null },
];

export async function fetchNews(topics: string[], refresh: boolean = false): Promise<Article[]> {
  const apiKey = process.env.NEWS_API_KEY;

  if (apiKey) {
    try {
      const query = topics.length > 0 ? topics.join(' OR ') : 'top headlines';
      const params = new URLSearchParams({
        q: query,
        pageSize: '8',
        language: 'en',
        sortBy: 'publishedAt',
        apiKey,
      });

      const res = await fetch(`https://newsapi.org/v2/everything?${params}`, refresh
        ? { cache: 'no-store' }
        : { next: { revalidate: 1800 } }
      );

      if (res.ok) {
        const data = await res.json();
        return (data.articles ?? []).map((a: {
          source: { name: string };
          title: string;
          url: string;
          publishedAt: string;
          urlToImage: string | null;
        }) => ({
          source: a.source.name,
          title: a.title,
          url: a.url,
          publishedAt: a.publishedAt,
          urlToImage: a.urlToImage,
        }));
      }
    } catch {}
  }

  return getCuratedHeadlines();
}

function getCuratedHeadlines(): Article[] {
  const today = new Date().toISOString();
  return CURATED_FALLBACK.map((a) => ({ ...a, publishedAt: today }));
}

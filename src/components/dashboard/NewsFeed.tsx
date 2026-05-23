'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard } from '@/components/shared/LoadingCard';
import { EmptyState } from '@/components/shared/EmptyState';
import Image from 'next/image';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import type { Article } from '@/types';

function formatNewsDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/news')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && !json.error) {
          setArticles(json.data ?? []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/news?refresh=true');
      const json = await res.json();
      if (!json.error) {
        setArticles(json.data ?? []);
      }
    } catch {
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) return <LoadingCard height="h-64" />;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          In the News
        </CardTitle>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-xs text-text-secondary hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="w-8 h-8" />}
            title="No articles"
            description="News could not be loaded right now."
          />
        ) : (
          <div className="space-y-3">
            {articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-surface transition-colors -mx-3"
              >
                {article.urlToImage && (
                  <Image
                    src={article.urlToImage}
                    alt=""
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    unoptimized
                    onError={(e) => {
                      (e.currentTarget).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-secondary">{article.source}</span>
                    {article.publishedAt && (
                      <>
                        <span className="text-xs text-text-secondary">&middot;</span>
                        <span className="text-xs text-text-secondary">{formatNewsDate(article.publishedAt)}</span>
                      </>
                    )}
                    <ExternalLink className="w-3 h-3 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

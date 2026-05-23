'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getToday } from '@/lib/utils';
import type { AIInsight } from '@/types';

export function AIInsightCard() {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const today = getToday();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data, error: queryError } = await supabase
          .from('daily_entries')
          .select('ai_insight')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (!cancelled) {
          if (queryError) setError(queryError.message);
          else if (data?.ai_insight) setInsight({ insight: data.ai_insight, date: today });
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [supabase, today]);

  async function handleGenerate(force: boolean = false) {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: force ? JSON.stringify({ force: true }) : undefined,
      });
      const json = await res.json();
      if (json.data) {
        setInsight(json.data);
      } else if (json.error) {
        setError(json.error);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-shimmer rounded-lg h-6 w-full mb-2" />
          <div className="animate-shimmer rounded-lg h-6 w-5/6 mb-2" />
          <div className="animate-shimmer rounded-lg h-6 w-4/6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Insight
        </CardTitle>
        <button
          onClick={() => handleGenerate(true)}
          disabled={generating}
          className="flex items-center gap-1 text-xs text-text-secondary hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating...' : 'New Insight'}
        </button>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive mb-3 bg-destructive/10 rounded-lg p-2">{error}</p>
        )}
        {insight ? (
          <div>
            <p className="text-base leading-relaxed italic text-text-primary">
              &ldquo;{insight.insight}&rdquo;
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-text-secondary">
              <Sparkles className="w-3 h-3" />
              <span>AI-generated reflection</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-text-secondary mb-3">
              Your daily reflection hasn&apos;t been generated yet.
            </p>
            <button
              onClick={() => handleGenerate()}
              disabled={generating}
              className="text-sm text-primary hover:underline cursor-pointer disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate your insight'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

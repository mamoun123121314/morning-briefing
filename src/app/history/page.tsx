'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { LoadingCard } from '@/components/shared/LoadingCard';
import { ArrowLeft, BookOpen, Flame } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Profile, DailyEntry, Habit, HabitCompletion } from '@/types';
import { BreadcrumbJsonLd } from '@/components/shared/BreadcrumbJsonLd';

export default function HistoryPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(p as Profile);

      const yearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];

      const { data: e } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', yearAgo)
        .order('date', { ascending: false });

      setEntries((e ?? []) as DailyEntry[]);

      const { data: h } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      setHabits((h ?? []) as Habit[]);

      const habitIds = (h ?? []).map((hab) => hab.id);
      if (habitIds.length > 0) {
        const { data: c } = await supabase
          .from('habit_completions')
          .select('*')
          .in('habit_id', habitIds)
          .gte('date', yearAgo);

        setCompletions((c ?? []) as HabitCompletion[]);
      }

      setLoading(false);
    }

    loadData();
  }, [supabase, router]);

  const entryDates = new Set(entries.filter((e) => e.journal_text).map((e) => e.date));

  // Build heatmap data for the last 365 days
  const today = new Date();
  const heatmapDays = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    heatmapDays.push({
      date: dateStr,
      hasEntry: entryDates.has(dateStr),
      day: d.getDay(),
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col p-6">
        <LoadingCard height="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'History', url: '/history' },
      ]} />
      <Header profile={profile} />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" title="Back to dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="font-serif text-3xl font-bold">History</h1>
        </div>

        {!selectedEntry ? (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Journal Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {heatmapDays.map((day, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${
                        day.hasEntry
                          ? 'bg-primary hover:bg-primary/80'
                          : 'bg-surface hover:bg-border'
                      }`}
                      title={day.date}
                      onClick={() => {
                        const entry = entries.find((e) => e.date === day.date);
                        if (entry) setSelectedEntry(entry);
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-text-secondary">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-sm bg-surface" />
                  <div className="w-3 h-3 rounded-sm bg-primary/30" />
                  <div className="w-3 h-3 rounded-sm bg-primary/60" />
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                  <span>More</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  Habit Streaks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {habits.map((habit) => {
                    const habitComps = completions
                      .filter((c) => c.habit_id === habit.id && c.completed)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    let streak = 0;
                    for (let i = 0; i < habitComps.length; i++) {
                      const expected = new Date(today);
                      expected.setDate(expected.getDate() - i);
                      if (habitComps[i].date === expected.toISOString().split('T')[0]) {
                        streak++;
                      } else break;
                    }

                    const totalDays = habitComps.length;
                    const maxPossible = 365;
                    const rate = Math.round((totalDays / maxPossible) * 100);

                    return (
                      <div key={habit.id} className="flex items-center gap-3">
                        <span className="text-lg">{habit.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{habit.name}</span>
                            <span className="text-sm font-mono text-primary">{streak} day streak</span>
                          </div>
                          <div className="h-2 rounded-full bg-surface overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-secondary">{totalDays} total completions</span>
                        </div>
                      </div>
                    );
                  })}

                  {habits.length === 0 && (
                    <p className="text-sm text-text-secondary text-center py-4">
                      No habits tracked yet. Add some in settings.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedEntry.date}</CardTitle>
                <p className="text-sm text-text-secondary mt-1">Journal Entry</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
                Back
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEntry.journal_prompt && (
                <div className="p-3 rounded-xl bg-surface/50 italic text-sm text-text-secondary">
                  {selectedEntry.journal_prompt}
                </div>
              )}
              {selectedEntry.journal_text ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.journal_text}
                </p>
              ) : (
                <p className="text-sm text-text-secondary">No journal entry for this day.</p>
              )}
              {selectedEntry.ai_insight && (
                <div className="border-l-4 border-l-primary pl-4 py-2">
                  <p className="text-xs text-text-secondary mb-1">AI Insight</p>
                  <p className="text-sm italic">{selectedEntry.ai_insight}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

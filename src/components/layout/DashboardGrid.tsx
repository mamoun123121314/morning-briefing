'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Header } from './Header';
import { DailyTip } from '@/components/dashboard/DailyTip';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { FocusCard } from '@/components/dashboard/FocusCard';
import { CalendarCard } from '@/components/dashboard/CalendarCard';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { HabitTracker } from '@/components/dashboard/HabitTracker';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { JournalCard } from '@/components/dashboard/JournalCard';
import { CommunityCard } from '@/components/community/CommunityCard';
import { XPNotification } from '@/components/community/XPNotification';
import { useXP } from '@/hooks/useXP';
import type { Profile } from '@/types';

export function DashboardGrid() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { notification, clearNotification } = useXP();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Auto-create profile if missing (for users who signed up before the DB trigger was created)
      if (!data) {
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .upsert({ id: user.id, display_name: user.email?.split('@')[0] ?? null })
          .select()
          .single();

        if (!error && newProfile) {
          data = newProfile;
        }
      }

      setProfile(data as Profile);
      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-shimmer rounded-2xl h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold">
            Good morning{profile?.display_name ? `, ${profile.display_name}` : ''}
          </h1>
          <p className="text-text-secondary mt-1">Here&apos;s your briefing for today.</p>
        </div>

        <div className="mb-6">
          <DailyTip />
        </div>

        <div className="card-stagger grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <WeatherCard />
          </div>
          <div className="lg:col-span-1">
            <FocusCard />
          </div>
          <div className="lg:col-span-1">
            <CalendarCard />
          </div>
          <div className="lg:col-span-3">
            <AIInsightCard />
          </div>
          <div className="lg:col-span-1">
            <HabitTracker />
          </div>
          <div className="lg:col-span-2">
            <NewsFeed />
          </div>
          <div className="lg:col-span-1">
            <CommunityCard />
          </div>
          <div className="lg:col-span-3">
            <JournalCard />
          </div>
        </div>
      </main>
      <XPNotification notification={notification} onDismiss={clearNotification} />
    </div>
  );
}

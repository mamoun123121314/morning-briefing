'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { FriendsList } from '@/components/community/FriendsList';
import { LeaderboardCard } from '@/components/community/LeaderboardCard';
import { AchievementsCard } from '@/components/community/AchievementsCard';
import { ChallengesCard } from '@/components/community/ChallengesCard';
import { ActivityFeed } from '@/components/community/ActivityFeed';
import { LevelBadge } from '@/components/community/LevelBadge';
import { Swords, Users, Activity, Trophy } from 'lucide-react';
import { InviteFriends } from '@/components/shared/InviteFriends';
import type { Profile } from '@/types';
import { BreadcrumbJsonLd } from '@/components/shared/BreadcrumbJsonLd';

export default function CommunityPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<{
    global: { id: string; display_name: string | null; avatar_url: string | null; xp: number; xp_level: number; city: string | null }[];
    friends: { id: string; display_name: string | null; avatar_url: string | null; xp: number; xp_level: number; city: string | null }[];
    userRank: number;
  }>({ global: [], friends: [], userRank: 0 });
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const lbLoading = useState(true);
  const [tab, setTab] = useState<'leaderboard' | 'friends' | 'achievements'>('leaderboard');

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(data as Profile);
    }
    loadProfile();
  }, [supabase]);

  useEffect(() => {
    async function loadCommunity() {
      try {
        const [lbRes, chRes] = await Promise.all([
          fetch('/api/leaderboard'),
          fetch('/api/challenges/current'),
        ]);
        const lbJson = await lbRes.json();
        const chJson = await chRes.json();
        if (lbJson.data) setLeaderboard(lbJson.data);
        if (chJson.data) setChallenges(chJson.data);
      } catch {}
      setLoading(false);
    }
    loadCommunity();
  }, []);

  useEffect(() => {
    async function loadActivity() {
      const res = await fetch('/api/friends/list');
      const json = await res.json();
      if (json.data?.accepted) {
        const friendIds = json.data.accepted.map((p: any) => p.id);
        if (friendIds.length > 0) {
          const actRes = await fetch(`/api/activity?userIds=${friendIds.join(',')}`);
          const actJson = await actRes.json();
          if (actJson.data) setActivity(actJson.data);
        }
      }
    }
    loadActivity();
  }, []);

  const myEntry = leaderboard.global.find((e) => e.id === profile?.id);
  const friendEntries = leaderboard.friends;

  return (
    <div className="min-h-screen flex flex-col">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Community', url: '/community' },
      ]} />
      <Header profile={profile} />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="flex items-center gap-4 mb-8">
          <Swords className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-serif text-3xl font-bold">Community</h1>
            <p className="text-text-secondary mt-1">Compete with friends and climb the leaderboard.</p>
          </div>
        </div>

        {myEntry && (
          <div className="mb-8 p-4 rounded-xl bg-surface/50 border border-border">
            <div className="flex items-center gap-4">
              <LevelBadge level={myEntry.xp_level} xp={myEntry.xp} size="lg" />
              <div>
                <p className="text-lg font-semibold">{myEntry.display_name ?? 'You'}</p>
                <p className="text-sm text-text-secondary">
                  Rank #{leaderboard.userRank} globally &middot; {myEntry.xp.toLocaleString()} total XP
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['leaderboard', 'friends', 'achievements'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                tab === t ? 'bg-primary text-white' : 'bg-surface hover:bg-surface/70 text-text-secondary'
              }`}
            >
              {t === 'leaderboard' && <Trophy className="w-4 h-4" />}
              {t === 'friends' && <Users className="w-4 h-4" />}
              {t === 'achievements' && <Activity className="w-4 h-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'leaderboard' && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <LeaderboardCard
              entries={leaderboard.global}
              userRank={leaderboard.userRank}
              loading={loading}
              type="global"
            />
            <div className="space-y-6">
              <LeaderboardCard
                entries={friendEntries}
                userRank={leaderboard.userRank}
                loading={loading}
                type="friends"
              />
              <ChallengesCard challenges={challenges} loading={loading} />
            </div>
          </div>
        )}

        {tab === 'friends' && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <FriendsList />
            <ActivityFeed activities={activity} loading={loading} />
          </div>
        )}

        {tab === 'achievements' && (
          <AchievementsCard />
        )}

        <div className="mt-8">
          <InviteFriends />
        </div>
      </main>
    </div>
  );
}

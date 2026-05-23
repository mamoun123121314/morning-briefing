'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Challenge, ActivityItem, LeaderboardEntry } from '@/types';

export function useCommunity() {
  const [leaderboard, setLeaderboard] = useState<{
    global: LeaderboardEntry[];
    friends: LeaderboardEntry[];
    userRank: number;
  }>({ global: [], friends: [], userRank: 0 });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [lbRes, chRes, actRes] = await Promise.all([
        fetch('/api/leaderboard'),
        fetch('/api/challenges/current'),
        fetch('/api/friends/list'),
      ]);

      const lbJson = await lbRes.json();
      const chJson = await chRes.json();
      const actJson = await actRes.json();

      if (lbJson.data) setLeaderboard(lbJson.data);
      if (chJson.data) setChallenges(chJson.data);

      if (actJson.data?.accepted) {
        const friendIds = actJson.data.accepted.map((p: { id: string }) => p.id);
        if (friendIds.length > 0) {
          const actRes2 = await fetch(`/api/activity?userIds=${friendIds.join(',')}`);
          const actJson2 = await actRes2.json();
          if (actJson2.data) setActivity(actJson2.data);
        }
      }
    } catch {
      setError('Failed to load community data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return { leaderboard, challenges, activity, loading, error, refresh: loadAll };
}

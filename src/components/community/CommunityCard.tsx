'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Trophy, Users, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { LevelBadge } from './LevelBadge';

export function CommunityCard() {
  const [data, setData] = useState<{ xp: number; level: number; rank: number; friendCount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [lbRes, frRes] = await Promise.all([
          fetch('/api/leaderboard'),
          fetch('/api/friends/list'),
        ]);
        const lbJson = await lbRes.json();
        const frJson = await frRes.json();

        if (lbJson.data && lbJson.data.global.length > 0) {
          const me = lbJson.data.global[lbJson.data.userRank - 1];
          setData({
            xp: me?.xp ?? 0,
            level: me?.xp_level ?? 1,
            rank: lbJson.data.userRank ?? 0,
            friendCount: frJson.data?.accepted?.length ?? 0,
          });
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href="/community" className="block group">
      <Card className="h-full transition-all group-hover:border-primary/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Community
          </CardTitle>
          <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
        </CardHeader>
        <CardContent>
          {data ? (
            <div className="space-y-3">
              <LevelBadge level={data.level} xp={data.xp} size="sm" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">Rank</span>
                </div>
                <span className="font-medium">#{data.rank}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">Friends</span>
                </div>
                <span className="font-medium">{data.friendCount}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-secondary text-center py-4">
              Start earning XP to compete!
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

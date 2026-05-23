'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award, Crown, Loader2 } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';

interface Props {
  entries: LeaderboardEntry[];
  userRank: number;
  loading: boolean;
  type: 'global' | 'friends';
}

const RANK_ICONS = [Crown, Medal, Award];

export function LeaderboardCard({ entries, userRank, loading, type }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            {type === 'global' ? 'Global' : 'Friends'} Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            {type === 'global' ? 'Global' : 'Friends'} Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary text-center py-4">
            {type === 'global' ? 'No users yet.' : 'Add friends to see them here!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {type === 'global' ? 'Global' : 'Friends'} Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {type === 'global' && userRank > 0 && (
          <div className="text-xs text-text-secondary mb-3">
            Your rank: #{userRank} of {entries.length}
          </div>
        )}

        {top3.map((entry, i) => {
          const Icon = RANK_ICONS[i] ?? Award;
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border"
            >
              <Icon className={`w-5 h-5 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.display_name ?? 'Anonymous'}</p>
                <p className="text-xs text-text-secondary">
                  Level {entry.xp_level} &middot; {entry.xp.toLocaleString()} XP
                </p>
              </div>
              {entry.city && <span className="text-xs text-text-secondary">{entry.city}</span>}
            </div>
          );
        })}

        {rest.length > 0 && (
          <div className="space-y-1 pt-2">
            {rest.map((entry, i) => (
              <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface/30 transition-colors">
                <span className="w-5 text-xs font-mono text-text-secondary text-center">{i + 4}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate block">{entry.display_name ?? 'Anonymous'}</span>
                </div>
                <span className="text-xs text-text-secondary">Lv.{entry.xp_level}</span>
                <span className="text-xs font-mono text-primary">{entry.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

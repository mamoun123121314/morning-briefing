'use client';

import { useState } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Loader2, Lock, Share2, Check } from 'lucide-react';

const TIER_COLORS = {
  bronze: 'border-amber-600/30 bg-amber-500/5',
  silver: 'border-gray-400/30 bg-gray-300/5',
  gold: 'border-yellow-400/30 bg-yellow-400/5',
  platinum: 'border-cyan-400/30 bg-cyan-400/5',
};

const TIER_ICONS = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
};

export function AchievementsCard() {
  const { achievements, unlocked, loading } = useAchievements();
  const [filter, setFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  function shareAchievements() {
    const unlockedList = achievements.filter((a) => unlocked.includes(a.key));
    const text = `I've unlocked ${unlocked.length}/${achievements.length} achievements on Morning Briefing! 🏆\n\n${unlockedList.slice(0, 5).map((a) => `${a.icon} ${a.title}`).join('\n')}\n\nTry it: https://daily-briefing-lime.vercel.app`;

    if (navigator.share) {
      navigator.share({ title: 'My Morning Briefing Achievements', text, url: 'https://daily-briefing-lime.vercel.app' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const filtered = filter === 'all'
    ? achievements
    : filter === 'unlocked'
    ? achievements.filter((a) => unlocked.includes(a.key))
    : achievements.filter((a) => !unlocked.includes(a.key));

  const grouped = filtered.reduce((acc, a) => {
    if (!acc[a.tier]) acc[a.tier] = [];
    acc[a.tier].push(a);
    return acc;
  }, {} as Record<string, typeof achievements>);

  const sortedTiers = ['bronze', 'silver', 'gold', 'platinum'] as const;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Achievements
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Achievements
          <span className="text-xs font-normal text-text-secondary">
            ({unlocked.length}/{achievements.length})
          </span>
        </CardTitle>
        <div className="flex items-center gap-1">
          <button
            onClick={shareAchievements}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface transition-colors cursor-pointer"
            title="Share achievements"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
          {(['all', 'unlocked', 'locked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === f ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {sortedTiers.map((tier) => {
          const items = grouped[tier];
          if (!items?.length) return null;
          return (
            <div key={tier} className="mb-4 last:mb-0">
              <div className="flex items-center gap-1.5 mb-2">
                <span>{TIER_ICONS[tier]}</span>
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {tier}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {items.map((a) => {
                  const isUnlocked = unlocked.includes(a.key);
                  return (
                    <div
                      key={a.key}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isUnlocked
                          ? TIER_COLORS[a.tier]
                          : 'border-border bg-surface/20 opacity-40'
                      }`}
                    >
                      <div className="text-xl mb-0.5">
                        {isUnlocked ? a.icon : <Lock className="w-4 h-4 mx-auto text-text-secondary" />}
                      </div>
                      <p className="text-xs font-medium truncate">{a.title}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">{a.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

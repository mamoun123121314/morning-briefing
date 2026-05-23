'use client';

import { Sparkles } from 'lucide-react';
import { getLevelTitle } from '@/hooks/useAchievements';

const LEVEL_COLORS = [
  'text-gray-400',
  'text-green-400',
  'text-blue-400',
  'text-purple-400',
  'text-yellow-400',
  'text-orange-400',
  'text-red-400',
  'text-pink-400',
];

interface Props {
  level: number;
  xp: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, xp, size = 'md' }: Props) {
  const colorClass = LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];
  const xpForNext = Math.floor(100 * Math.pow(level, 1 / 0.6));
  const progress = Math.min((xp / xpForNext) * 100, 100);
  const title = getLevelTitle(level);

  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} rounded-full bg-surface border border-border flex items-center justify-center font-bold ${colorClass}`}>
        {level}
      </div>
      {size !== 'sm' && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Sparkles className={`w-3 h-3 ${colorClass}`} />
            <span className={`text-xs font-medium ${colorClass}`}>Level {level}</span>
            <span className="text-[10px] text-text-secondary ml-1">&middot; {title}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-text-secondary">{xp.toLocaleString()} XP</span>
          </div>
        </div>
      )}
    </div>
  );
}

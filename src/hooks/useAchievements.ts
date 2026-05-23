'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // Tasks
  { key: 'first_task', title: 'First Step', description: 'Complete your first task', icon: '🎯', tier: 'bronze' },
  { key: 'five_tasks', title: 'Task Learner', description: 'Complete 5 tasks', icon: '✅', tier: 'bronze' },
  { key: 'twenty_tasks', title: 'Task Doer', description: 'Complete 20 tasks', icon: '📋', tier: 'silver' },
  { key: 'fifty_tasks', title: 'Task Master', description: 'Complete 50 tasks', icon: '🏆', tier: 'silver' },
  { key: 'hundred_tasks', title: 'Task Legend', description: 'Complete 100 tasks', icon: '👑', tier: 'gold' },
  { key: 'five_hundred_tasks', title: 'Task Overlord', description: 'Complete 500 tasks', icon: '💎', tier: 'platinum' },

  // Journal
  { key: 'first_journal', title: 'First Entry', description: 'Write your first journal entry', icon: '📝', tier: 'bronze' },
  { key: 'seven_journal', title: 'Journal Keeper', description: 'Write 7 journal entries', icon: '📖', tier: 'silver' },
  { key: 'thirty_journal', title: 'Journal Devotee', description: 'Write 30 journal entries', icon: '📚', tier: 'gold' },
  { key: 'hundred_journal', title: 'Journal Sage', description: 'Write 100 journal entries', icon: '🧠', tier: 'platinum' },

  // Habits
  { key: 'first_habit', title: 'Habit Starter', description: 'Complete your first habit', icon: '🌱', tier: 'bronze' },
  { key: 'ten_habits', title: 'Habit Builder', description: 'Complete 10 habits', icon: '🌿', tier: 'bronze' },
  { key: 'fifty_habits', title: 'Habit Master', description: 'Complete 50 habits', icon: '🌳', tier: 'silver' },
  { key: 'two_hundred_habits', title: 'Habit Machine', description: 'Complete 200 habits', icon: '🏔️', tier: 'gold' },
  { key: 'create_three_habits', title: 'Habit Stacker', description: 'Create 3 habits', icon: '📋', tier: 'silver' },

  // Streaks
  { key: 'three_streak', title: 'Getting Started', description: '3-day streak', icon: '🔥', tier: 'bronze' },
  { key: 'seven_streak', title: 'Week Warrior', description: '7-day streak', icon: '🔥', tier: 'silver' },
  { key: 'fourteen_streak', title: 'Fortnight Fire', description: '14-day streak', icon: '🔥', tier: 'silver' },
  { key: 'thirty_streak', title: 'Monthly Legend', description: '30-day streak', icon: '💎', tier: 'gold' },
  { key: 'sixty_streak', title: 'Two Month Titan', description: '60-day streak', icon: '💎', tier: 'gold' },
  { key: 'hundred_streak', title: 'Century Club', description: '100-day streak', icon: '👑', tier: 'platinum' },

  // Levels
  { key: 'level_3', title: 'Growing', description: 'Reach level 3', icon: '⭐', tier: 'bronze' },
  { key: 'level_5', title: 'Rising Star', description: 'Reach level 5', icon: '⭐', tier: 'silver' },
  { key: 'level_10', title: 'Elite', description: 'Reach level 10', icon: '🌟', tier: 'silver' },
  { key: 'level_20', title: 'Master', description: 'Reach level 20', icon: '👑', tier: 'gold' },
  { key: 'level_50', title: 'Grandmaster', description: 'Reach level 50', icon: '💎', tier: 'platinum' },

  // Social
  { key: 'first_friend', title: 'Social Butterfly', description: 'Add your first friend', icon: '🤝', tier: 'bronze' },
  { key: 'five_friends', title: 'Friend Collector', description: 'Add 5 friends', icon: '👥', tier: 'silver' },
  { key: 'first_challenge', title: 'Challenger', description: 'Complete your first challenge', icon: '🏅', tier: 'bronze' },
  { key: 'five_challenges', title: 'Challenge Champ', description: 'Complete 5 challenges', icon: '🏅', tier: 'silver' },
  { key: 'ten_challenges', title: 'Challenge Legend', description: 'Complete 10 challenges', icon: '🏆', tier: 'gold' },
];

export const LEVEL_TITLES: { level: number; title: string }[] = [
  { level: 1, title: 'Newcomer' },
  { level: 2, title: 'Beginner' },
  { level: 5, title: 'Apprentice' },
  { level: 10, title: 'Regular' },
  { level: 15, title: 'Dedicated' },
  { level: 20, title: 'Master' },
  { level: 30, title: 'Expert' },
  { level: 40, title: 'Veteran' },
  { level: 50, title: 'Grandmaster' },
  { level: 75, title: 'Legend' },
  { level: 100, title: 'Mythic' },
];

export function getLevelTitle(level: number): string {
  let title = 'Newcomer';
  for (const lt of LEVEL_TITLES) {
    if (level >= lt.level) title = lt.title;
  }
  return title;
}

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('achievements')
        .select('achievement_key')
        .eq('user_id', user.id);

      if (!cancelled) {
        setUnlocked((data ?? []).map((a) => a.achievement_key));
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [supabase]);

  const checkAndUnlock = useCallback(async (key: string) => {
    if (unlocked.includes(key)) return;

    const def = ACHIEVEMENT_DEFS.find((a) => a.key === key);
    if (!def) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('achievements')
      .insert({ user_id: user.id, achievement_key: key })
      .maybeSingle();

    setUnlocked((prev) => [...prev, key]);
  }, [unlocked, supabase]);

  return {
    achievements: ACHIEVEMENT_DEFS,
    unlocked,
    loading,
    checkAndUnlock,
    isUnlocked: useCallback((key: string) => unlocked.includes(key), [unlocked]),
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getToday } from '@/lib/utils';
import type { Habit, HabitCompletion } from '@/types';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: habitsData } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at');

        setHabits((habitsData ?? []) as Habit[]);

        const habitIds = (habitsData ?? []).map((h) => h.id);
        if (habitIds.length > 0) {
          const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

          const { data: comps } = await supabase
            .from('habit_completions')
            .select('*')
            .in('habit_id', habitIds)
            .gte('date', weekAgo);

          setCompletions((comps ?? []) as HabitCompletion[]);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  const toggleCompletion = useCallback(
    async (habitId: string, completed: boolean) => {
      const today = getToday();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('habit_completions')
          .update({ completed })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('habit_completions')
          .insert({ user_id: user.id, habit_id: habitId, date: today, completed });
      }

      setCompletions((prev) => {
        const filtered = prev.filter(
          (c) => !(c.habit_id === habitId && c.date === today)
        );
        return [
          ...filtered,
          {
            id: existing?.id ?? crypto.randomUUID(),
            habit_id: habitId,
            user_id: user.id,
            date: today,
            completed,
          },
        ];
      });
    },
    [supabase]
  );

  const isCompletedToday = useCallback(
    (habitId: string) => {
      return completions.some(
        (c) => c.habit_id === habitId && c.date === getToday() && c.completed
      );
    },
    [completions]
  );

  const getStreak = useCallback(
    (habitId: string) => {
      const habitComps = completions
        .filter((c) => c.habit_id === habitId && c.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let streak = 0;
      const today = new Date();

      for (let i = 0; i < habitComps.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];

        if (habitComps[i].date === expectedStr) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    },
    [completions]
  );

  const getWeekCompletions = useCallback(
    (habitId: string) => {
      const today = new Date();
      const weekDays: { date: string; completed: boolean }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const comp = completions.find(
          (c) => c.habit_id === habitId && c.date === dateStr
        );

        weekDays.push({ date: dateStr, completed: comp?.completed ?? false });
      }

      return weekDays;
    },
    [completions]
  );

  return {
    habits,
    completions,
    loading,
    fetchHabits: () => {},
    toggleCompletion,
    isCompletedToday,
    getStreak,
    getWeekCompletions,
  };
}

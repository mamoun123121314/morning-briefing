'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getToday } from '@/lib/utils';
import type { DailyEntry, Task } from '@/types';

export function useDailyEntry() {
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const today = getToday();

  useEffect(() => {
    async function fetchEntry() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not authenticated');
          return;
        }

        const { data, error } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (error && error.code !== 'PGRST116') {
          setError(error.message);
          return;
        }

        setEntry(data as DailyEntry | null);
      } catch {
        setError('Failed to load daily entry');
      } finally {
        setLoading(false);
      }
    }

    fetchEntry();
  }, [supabase, today]);

  const updateJournal = useCallback(
    async (text: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('daily_entries')
        .upsert(
          { user_id: user.id, date: today, journal_text: text },
          { onConflict: 'user_id,date' }
        );

      if (error) {
        setError(error.message);
      }
    },
    [supabase, today]
  );

  const updateTasks = useCallback(
    async (tasks: Task[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('daily_entries')
        .upsert(
          { user_id: user.id, date: today, tasks },
          { onConflict: 'user_id,date' }
        );

      if (error) {
        setError(error.message);
      } else {
        setEntry((prev) => (prev ? { ...prev, tasks } : prev));
      }
    },
    [supabase, today]
  );

  return { entry, loading, error, fetchEntry: () => {}, updateJournal, updateTasks, today };
}

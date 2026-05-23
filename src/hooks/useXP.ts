'use client';

import { useState, useCallback } from 'react';
import type { XPNotification } from '@/types';

const XP_REASONS = ['task_completed', 'journal_written', 'habit_completed'] as const;

export function useXP() {
  const [notification, setNotification] = useState<XPNotification | null>(null);

  const earnXP = useCallback(async (reason: typeof XP_REASONS[number]) => {
    try {
      const res = await fetch('/api/xp/earn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (json.data) {
        setNotification({ id: crypto.randomUUID(), amount: json.data.xp_earned, reason });
        return json.data;
      }
    } catch {
    }
    return null;
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const getXPReasonForAction = useCallback((action: string): typeof XP_REASONS[number] => {
    if (action === 'task') return 'task_completed';
    if (action === 'journal') return 'journal_written';
    if (action === 'habit') return 'habit_completed';
    return 'task_completed';
  }, []);

  return {
    notification,
    earnXP,
    clearNotification,
    getXPReasonForAction,
  };
}

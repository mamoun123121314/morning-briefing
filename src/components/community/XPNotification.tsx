'use client';

import { useEffect } from 'react';
import { Zap, X } from 'lucide-react';
import type { XPNotification as XPNotif } from '@/types';

interface Props {
  notification: XPNotif | null;
  onDismiss: () => void;
}

const LABELS: Record<string, string> = {
  task_completed: 'Task completed!',
  journal_written: 'Journal written!',
  habit_completed: 'Habit done!',
};

export function XPNotification({ notification, onDismiss }: Props) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
        <Zap className="w-5 h-5" />
        <div>
          <p className="text-sm font-medium">+{notification.amount} XP</p>
          <p className="text-xs opacity-80">{LABELS[notification.reason] ?? notification.reason}</p>
        </div>
        <button onClick={onDismiss} title="Dismiss" className="p-0.5 hover:opacity-70 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Loader2, Zap, Target, BookOpen, CheckCircle2 } from 'lucide-react';
import type { ActivityItem } from '@/types';

const ACTIVITY_ICONS: Record<string, typeof Zap> = {
  task_completed: Target,
  journal_written: BookOpen,
  habit_completed: CheckCircle2,
};

interface Props {
  activities: ActivityItem[];
  loading: boolean;
}

export function ActivityFeed({ activities, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Friend Activity
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

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Friend Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary text-center py-4">
            Add friends to see their activity here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Friend Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {activities.slice(0, 20).map((item) => {
          const Icon = ACTIVITY_ICONS[item.activity_type] ?? Zap;
          const timeAgo = getTimeAgo(new Date(item.created_at));
          return (
            <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{item.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-secondary">{timeAgo}</span>
                  {item.xp_earned > 0 && (
                    <span className="text-xs text-primary flex items-center gap-0.5">
                      <Zap className="w-3 h-3" />+{item.xp_earned} XP
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

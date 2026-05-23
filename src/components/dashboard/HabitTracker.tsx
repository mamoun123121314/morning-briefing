'use client';

import { useHabits } from '@/hooks/useHabits';
import { useXP } from '@/hooks/useXP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingCard } from '@/components/shared/LoadingCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Flame, CheckCircle2 } from 'lucide-react';

export function HabitTracker() {
  const { habits, loading, toggleCompletion, isCompletedToday, getStreak, getWeekCompletions } = useHabits();
  const { earnXP } = useXP();

  if (loading) return <LoadingCard height="h-64" />;

  if (habits.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<CheckCircle2 className="w-8 h-8" />}
            title="No habits yet"
            description="Add habits in settings to start tracking your streaks."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Habits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {habits.map((habit) => {
            const done = isCompletedToday(habit.id);
            const streak = getStreak(habit.id);
            const weekDays = getWeekCompletions(habit.id);

            return (
              <div key={habit.id} className="flex items-center gap-3">
                <Checkbox
                  checked={done}
                  onCheckedChange={(checked) => {
                    if (checked && !done) earnXP('habit_completed');
                    toggleCompletion(habit.id, checked);
                  }}
                  className={done ? 'animate-scale-pulse' : ''}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{habit.emoji}</span>
                    <span className="text-sm font-medium truncate">{habit.name}</span>
                    {streak > 0 && (
                      <div className="flex items-center gap-0.5 text-xs text-primary">
                        <Flame className="w-3 h-3" />
                        <span className="font-mono">{streak}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {weekDays.map((day, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-sm transition-colors ${
                          day.completed ? 'bg-primary' : 'bg-surface border border-border'
                        }`}
                        title={day.date}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useCalendar } from '@/hooks/useCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard } from '@/components/shared/LoadingCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { CalendarDays, Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export function CalendarCard() {
  const { events, loading } = useCalendar();

  if (loading) return <LoadingCard height="h-48" />;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Today&apos;s Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="w-8 h-8" />}
            title="No events today"
            description="Connect Google Calendar in settings to see your events."
          />
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3"
              >
                <div
                  className="w-1 h-full min-h-[40px] rounded-full mt-1"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <div className="flex items-center gap-1 text-xs text-text-secondary mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatTime(event.start)} — {formatTime(event.end)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

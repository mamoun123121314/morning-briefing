import type { CalendarEvent } from '@/types';

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export function getAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function fetchCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch calendar events');
  }

  const data = await res.json();

  return (data.items ?? []).map((event: {
    id: string;
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    colorId?: string;
  }) => {
    const calendarColors: Record<string, string> = {
      '1': '#7986CB',
      '2': '#33B679',
      '3': '#8E24AA',
      '4': '#E67C73',
      '5': '#F6BF26',
      '6': '#F4511E',
      '7': '#039BE5',
      '8': '#616161',
      '9': '#3F51B5',
      '10': '#0B8043',
      '11': '#D50000',
    };

    return {
      id: event.id,
      title: event.summary,
      start: event.start.dateTime ?? event.start.date ?? now.toISOString(),
      end: event.end.dateTime ?? event.end.date ?? endOfDay.toISOString(),
      color: calendarColors[event.colorId ?? ''] ?? '#7986CB',
    };
  });
}

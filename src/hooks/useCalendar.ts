'use client';

import { useState, useEffect } from 'react';
import type { CalendarEvent } from '@/types';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/calendar/events');
        const json = await res.json();

        if (!json.error) {
          setEvents(json.data ?? []);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { events, loading };
}

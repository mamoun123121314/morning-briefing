'use client';

import { useState, useEffect } from 'react';
import type { WeatherData } from '@/types';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/weather');
        const json = await res.json();

        if (json.error) {
          if (json.status === 400) {
            setError(json.error);
          } else {
            setError('Could not load weather');
          }
          return;
        }

        setWeather(json.data);
      } catch {
        setError('Could not load weather');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { weather, loading, error };
}

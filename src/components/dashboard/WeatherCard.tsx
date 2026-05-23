'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWeather } from '@/hooks/useWeather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard } from '@/components/shared/LoadingCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Cloud, CloudRain, CloudSun, Sun, Snowflake, Wind, Droplets, Settings } from 'lucide-react';

function WeatherIcon({ condition }: { condition: string }) {
  const lower = condition.toLowerCase();
  if (lower.includes('clear') || lower.includes('sun')) return <Sun className="w-10 h-10 text-primary animate-float" />;
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower') || lower.includes('thunder')) return <CloudRain className="w-10 h-10 text-secondary" />;
  if (lower.includes('snow')) return <Snowflake className="w-10 h-10 text-secondary" />;
  if (lower.includes('cloud') || lower.includes('overcast')) return <Cloud className="w-10 h-10 text-text-secondary" />;
  if (lower.includes('fog')) return <Cloud className="w-10 h-10 text-text-secondary" />;
  return <CloudSun className="w-10 h-10 text-primary" />;
}

export function WeatherCard() {
  const { weather, loading, error } = useWeather();
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  function toF(c: number) {
    return Math.round(c * 9 / 5 + 32);
  }

  function formatTemp(c: number) {
    return unit === 'C' ? `${Math.round(c)}°C` : `${toF(c)}°F`;
  }

  if (loading) return <LoadingCard height="h-56" />;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Settings className="w-8 h-8" />}
            title="Location not set"
            description={error}
            action={
              <Link href="/settings">
                <button className="text-sm text-primary hover:underline">Update settings</button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-primary" />
          Weather
        </CardTitle>
        <button
          onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
          className="text-xs text-text-secondary hover:text-foreground transition-colors cursor-pointer"
        >
          Switch to °{unit === 'C' ? 'F' : 'C'}
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <WeatherIcon condition={weather.condition} />
          <div>
            <div className="text-3xl font-bold">{formatTemp(weather.temperature)}</div>
            <div className="text-sm text-text-secondary">{weather.condition}</div>
          </div>
        </div>

        <div className="flex gap-4 text-sm text-text-secondary mb-4">
          <div className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5" />
            {weather.humidity}%
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5" />
            {weather.windSpeed} km/h
          </div>
          <div>UV {weather.uvIndex}</div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-border">
          {weather.hourly.map((hour, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs text-text-secondary">
                {new Date(hour.time).getHours()}:00
              </span>
              <div className="w-8 h-8 flex items-center justify-center">
                <WeatherIcon condition={hour.condition} />
              </div>
              <span className="text-xs font-medium">{Math.round(hour.temperature)}°</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

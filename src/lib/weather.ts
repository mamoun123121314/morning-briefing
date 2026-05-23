import type { WeatherData } from '@/types';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

const conditionMap: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail',
};

export function getCondition(code: number): string {
  return conditionMap[code] ?? 'Unknown';
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index',
    hourly: 'temperature_2m,weather_code',
    forecast_days: '1',
  });

  const res = await fetch(`${OPEN_METEO_BASE}?${params}`);

  if (!res.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await res.json();

  const current = data.current;
  const hourly = data.hourly;

  const now = new Date();
  const currentHour = now.getHours();

  const hourlyForecast = hourly.time
    .map((t: string, i: number) => ({
      time: t,
      temperature: hourly.temperature_2m[i],
      condition: getCondition(hourly.weather_code[i]),
    }))
    .filter((_: { time: string }, i: number) => {
      const hour = new Date(hourly.time[i]).getHours();
      return hour >= currentHour && hour < currentHour + 5;
    });

  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    condition: getCondition(current.weather_code),
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    uvIndex: current.uv_index,
    hourly: hourlyForecast.slice(0, 5),
  };
}

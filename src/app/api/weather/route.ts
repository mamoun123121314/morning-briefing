import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { fetchWeather } from '@/lib/weather';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('latitude, longitude')
      .eq('id', user.id)
      .single();

    if (!profile?.latitude || !profile?.longitude) {
      return NextResponse.json(
        { data: null, error: 'Location not set. Please update your settings.', status: 400 },
        { status: 400 }
      );
    }

    const weather = await fetchWeather(profile.latitude, profile.longitude);
    return NextResponse.json({ data: weather, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed to fetch weather', status: 500 },
      { status: 500 }
    );
  }
}

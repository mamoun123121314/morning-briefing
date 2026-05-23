import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { fetchCalendarEvents } from '@/lib/google-calendar';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: token } = await supabase
      .from('calendar_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!token?.access_token) {
      return NextResponse.json(
        { data: [], error: null, status: 200 }
      );
    }

    const events = await fetchCalendarEvents(token.access_token);
    return NextResponse.json({ data: events, error: null, status: 200 });
  } catch {
    return NextResponse.json(
      { data: [], error: null, status: 200 }
    );
  }
}

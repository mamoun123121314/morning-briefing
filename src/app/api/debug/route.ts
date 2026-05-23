import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { getToday } from '@/lib/utils';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const userId = user.id;
  const today = getToday();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  const { data: entry, error: entryError } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId);

  return NextResponse.json({
    userId,
    today,
    profile: profile ?? null,
    entry: entry ?? null,
    entryError: entryError?.message ?? null,
    habits: habits ?? [],
  });
}

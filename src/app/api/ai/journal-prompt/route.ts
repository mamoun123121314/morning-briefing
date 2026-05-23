import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { generateJournalPrompt } from '@/lib/claude';
import { getToday } from '@/lib/utils';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const userId = user.id;
    const today = getToday();

    const { data: entry } = await supabase
      .from('daily_entries')
      .select('id, journal_prompt')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (entry?.journal_prompt) {
      return NextResponse.json({ data: { prompt: entry.journal_prompt, date: today }, error: null, status: 200 });
    }

    const prompt = await generateJournalPrompt();

    if (entry?.id) {
      await supabase
        .from('daily_entries')
        .update({ journal_prompt: prompt })
        .eq('id', entry.id);
    } else {
      await supabase
        .from('daily_entries')
        .insert({ user_id: userId, date: today, journal_prompt: prompt });
    }

    return NextResponse.json({ data: { prompt, date: today }, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Internal error', status: 500 },
      { status: 500 }
    );
  }
}

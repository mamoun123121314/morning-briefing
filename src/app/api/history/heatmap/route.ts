import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const yearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];

    const { data: entries } = await supabase
      .from('daily_entries')
      .select('date')
      .eq('user_id', user.id)
      .gte('date', yearAgo)
      .not('journal_text', 'is', null)
      .order('date', { ascending: false });

    const { data: completions } = await supabase
      .from('habit_completions')
      .select('date, completed')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('date', yearAgo);

    const entryDates = new Set((entries ?? []).map((e) => e.date));

    const completionCounts: Record<string, number> = {};
    for (const c of completions ?? []) {
      completionCounts[c.date] = (completionCounts[c.date] ?? 0) + 1;
    }

    return NextResponse.json({
      data: { entryDates: Array.from(entryDates), completionCounts },
      error: null,
      status: 200,
    });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Internal error', status: 500 },
      { status: 500 }
    );
  }
}

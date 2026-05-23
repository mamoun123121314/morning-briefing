import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { generateInsight } from '@/lib/claude';
import { getToday } from '@/lib/utils';
import { rateLimit } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const rl = rateLimit(`insight:${user.id}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ data: null, error: 'Too many requests. Wait a minute.', status: 429 }, { status: 429 });
    }

    const supabase = await createServerSupabaseClient();
    const userId = user.id;
    const today = getToday();

    let force = false;
    try {
      const body = await request.json();
      force = body?.force === true;
    } catch {}

    if (!force) {
      const { data: existing } = await supabase
        .from('daily_entries')
        .select('ai_insight')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (existing?.ai_insight) {
        return NextResponse.json({
          data: { insight: existing.ai_insight, date: today },
          error: null,
          status: 200,
        });
      }
    }

    const insight = await generateInsight();

    const { error: upsertError } = await supabase
      .from('daily_entries')
      .upsert(
        { user_id: userId, date: today, ai_insight: insight },
        { onConflict: 'user_id,date' }
      );

    if (upsertError) {
      return NextResponse.json({ data: null, error: upsertError.message, status: 500 }, { status: 500 });
    }

    return NextResponse.json({ data: { insight, date: today }, error: null, status: 200 });
  } catch {
    const fallback = "Take a moment to breathe. Every day is a fresh start.";
    return NextResponse.json({ data: { insight: fallback, date: getToday() }, error: null, status: 200 });
  }
}

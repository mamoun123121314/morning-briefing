import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { getToday } from '@/lib/utils';
import { rateLimit, validateUUID } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const rl = rateLimit(`habit:${user.id}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ data: null, error: 'Too many requests', status: 429 }, { status: 429 });
    }

    const body = await request.json();
    const { habit_id, completed } = body;

    if (!habit_id || !validateUUID(habit_id)) {
      return NextResponse.json(
        { data: null, error: 'Invalid habit_id', status: 400 },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const userId = user.id;
    const today = getToday();

    const { data: existing } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('habit_id', habit_id)
      .eq('date', today)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('habit_completions')
        .update({ completed })
        .eq('id', existing.id);

      if (error) {
        return NextResponse.json({ data: null, error: error.message, status: 500 }, { status: 500 });
      }
    } else {
      const { error } = await supabase
        .from('habit_completions')
        .insert({ habit_id, user_id: userId, date: today, completed });

      if (error) {
        return NextResponse.json({ data: null, error: error.message, status: 500 }, { status: 500 });
      }
    }

    return NextResponse.json({ data: { habit_id, date: today, completed }, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Internal error', status: 500 },
      { status: 500 }
    );
  }
}

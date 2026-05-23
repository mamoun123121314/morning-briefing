import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const { date } = await params;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ data: null, error: error.message, status: 500 }, { status: 500 });
    }

    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id);

    const habitIds = habits?.map((h) => h.id) ?? [];

    const { data: completions } = await supabase
      .from('habit_completions')
      .select('*')
      .in('habit_id', habitIds)
      .eq('date', date);

    return NextResponse.json({
      data: {
        entry: data ?? null,
        habits: habits ?? [],
        completions: completions ?? [],
      },
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const { date } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();
    const userId = user.id;

    const updateData: Record<string, unknown> = {};
    if (body.journal_text !== undefined) updateData.journal_text = body.journal_text;
    if (body.tasks !== undefined) updateData.tasks = body.tasks;
    if (body.journal_prompt !== undefined) updateData.journal_prompt = body.journal_prompt;

    const { data: existing } = await supabase
      .from('daily_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('daily_entries')
        .update(updateData)
        .eq('id', existing.id);

      if (error) {
        return NextResponse.json({ data: null, error: error.message, status: 500 }, { status: 500 });
      }
    } else {
      const { error } = await supabase
        .from('daily_entries')
        .insert({ user_id: userId, date, ...updateData });

      if (error) {
        return NextResponse.json({ data: null, error: error.message, status: 500 }, { status: 500 });
      }
    }

    return NextResponse.json({ data: { date, ...updateData }, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Internal error', status: 500 },
      { status: 500 }
    );
  }
}

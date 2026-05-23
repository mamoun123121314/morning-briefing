import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/security';

const XP_VALUES: Record<string, number> = {
  task_completed: 10,
  journal_written: 15,
  habit_completed: 5,
  daily_login: 20,
};

const VALID_REASONS = new Set(Object.keys(XP_VALUES));

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const rl = rateLimit(`xp:${user.id}`, 50, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ data: null, error: 'Too many requests', status: 429 }, { status: 429 });
    }

    const { reason } = await request.json();
    if (!reason || typeof reason !== 'string' || !VALID_REASONS.has(reason)) {
      return NextResponse.json({ data: null, error: 'Invalid reason', status: 400 }, { status: 400 });
    }

    const amount = XP_VALUES[reason];
    const supabase = await createServerSupabaseClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, xp_level')
      .eq('id', user.id)
      .single();

    const currentXp = profile?.xp ?? 0;
    const oldLevel = profile?.xp_level ?? 1;
    const newXp = currentXp + amount;

    const levelUpCheck = await supabase.rpc('calculate_level', { xp: newXp });
    const newLevel = levelUpCheck ?? oldLevel;

    await supabase
      .from('profiles')
      .update({ xp: newXp, xp_level: newLevel })
      .eq('id', user.id);

    await supabase
      .from('xp_transactions')
      .insert({ user_id: user.id, amount, reason });

    await supabase
      .from('activity_feed')
      .insert({
        user_id: user.id,
        activity_type: reason,
        description: reason === 'task_completed' ? 'Completed a task' :
                      reason === 'journal_written' ? 'Wrote a journal entry' :
                      reason === 'habit_completed' ? 'Completed a habit' : reason,
        xp_earned: amount,
      });

    return NextResponse.json({
      data: { xp_earned: amount, new_total: newXp, new_level: newLevel, leveled_up: newLevel > oldLevel },
      error: null,
      status: 200,
    });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed to earn XP', status: 500 },
      { status: 500 }
    );
  }
}

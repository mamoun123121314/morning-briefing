import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: challenges } = await supabase
      .from('challenges')
      .select('*')
      .lte('starts_at', today)
      .gte('ends_at', today)
      .order('ends_at');

    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ data: [], error: null, status: 200 });
    }

    const challengeIds = challenges.map((c) => c.id);

    const { data: userProgress } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', user.id)
      .in('challenge_id', challengeIds);

    const progressMap = new Map(
      (userProgress ?? []).map((up) => [up.challenge_id, up])
    );

    const result = challenges.map((c) => ({
      ...c,
      progress: progressMap.get(c.id)?.progress ?? 0,
      completed: progressMap.get(c.id)?.completed ?? false,
    }));

    return NextResponse.json({ data: result, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed to load challenges', status: 500 },
      { status: 500 }
    );
  }
}

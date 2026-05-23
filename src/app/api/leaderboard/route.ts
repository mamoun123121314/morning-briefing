import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: global } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, xp, xp_level, city')
      .order('xp', { ascending: false })
      .limit(50);

    const { data: friendships } = await supabase
      .from('friendships')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');

    const friendIds = new Set<string>();
    if (friendships) {
      for (const f of friendships) {
        friendIds.add(f.sender_id === user.id ? f.receiver_id : f.sender_id);
      }
    }
    friendIds.add(user.id);

    const friends = (global ?? []).filter((p) => friendIds.has(p.id));

    const userRank = (global ?? []).findIndex((p) => p.id === user.id) + 1;

    return NextResponse.json({
      data: { global: global ?? [], friends: friends ?? [], userRank },
      error: null,
      status: 200,
    });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed to load leaderboard', status: 500 },
      { status: 500 }
    );
  }
}

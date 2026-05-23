import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const q = request.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ data: [], error: null, status: 200 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, city')
      .neq('id', user.id)
      .ilike('display_name', `%${q}%`)
      .limit(10);

    const profileIds = profiles?.map((p) => p.id) ?? [];

    let existingFriends: string[] = [];
    if (profileIds.length > 0) {
      const { data: friends } = await supabase
        .from('friendships')
        .select('sender_id, receiver_id, status')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.in.(${profileIds.join(',')})),` +
          `and(receiver_id.eq.${user.id},sender_id.in.(${profileIds.join(',')}))`
        );

      existingFriends = (friends ?? []).map((f) =>
        f.sender_id === user.id ? f.receiver_id : f.sender_id
      );
    }

    const result = (profiles ?? []).map((p) => ({
      ...p,
      friendship_status: existingFriends.includes(p.id) ? 'pending' : null,
    }));

    return NextResponse.json({ data: result, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Search failed', status: 500 },
      { status: 500 }
    );
  }
}

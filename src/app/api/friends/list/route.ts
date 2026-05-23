import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import type { Profile } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    const accepted: Profile[] = [];
    const pending: { id: string; profile: Profile; direction: 'sent' | 'received' }[] = [];

    if (friendships) {
      const friendIds = new Set<string>();
      for (const f of friendships) {
        const otherId = f.sender_id === user.id ? f.receiver_id : f.sender_id;
        friendIds.add(otherId);
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(friendIds));

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));

      for (const f of friendships) {
        const otherId = f.sender_id === user.id ? f.receiver_id : f.sender_id;
        const profile = profileMap.get(otherId);
        if (!profile) continue;

        if (f.status === 'accepted') {
          accepted.push(profile);
        } else if (f.status === 'pending') {
          pending.push({
            id: f.id,
            profile,
            direction: f.receiver_id === user.id ? 'received' : 'sent',
          });
        }
      }
    }

    return NextResponse.json({
      data: { accepted, pending },
      error: null,
      status: 200,
    });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed to list friends', status: 500 },
      { status: 500 }
    );
  }
}

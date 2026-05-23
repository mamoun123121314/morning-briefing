import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { rateLimit, validateUUID } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const rl = rateLimit(`friend_resp:${user.id}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ data: null, error: 'Too many requests', status: 429 }, { status: 429 });
    }

    const { friendship_id, accept } = await request.json();
    if (!friendship_id || !validateUUID(friendship_id)) {
      return NextResponse.json({ data: null, error: 'Invalid friendship ID', status: 400 }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: friendship } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendship_id)
      .single();

    if (!friendship) {
      return NextResponse.json({ data: null, error: 'Request not found', status: 404 }, { status: 404 });
    }

    if (friendship.receiver_id !== user.id) {
      return NextResponse.json({ data: null, error: 'Not authorized', status: 403 }, { status: 403 });
    }

    const { error } = await supabase
      .from('friendships')
      .update({ status: accept ? 'accepted' : 'rejected', updated_at: new Date().toISOString() })
      .eq('id', friendship_id);

    if (error) {
      return NextResponse.json({ data: null, error: error.message, status: 500 }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true }, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed to respond', status: 500 },
      { status: 500 }
    );
  }
}

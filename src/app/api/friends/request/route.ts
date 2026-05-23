import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { rateLimit, validateUUID } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const rl = rateLimit(`friend_req:${user.id}`, 20, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ data: null, error: 'Too many requests', status: 429 }, { status: 429 });
    }

    const { receiver_id } = await request.json();
    if (!receiver_id || !validateUUID(receiver_id)) {
      return NextResponse.json({ data: null, error: 'Invalid receiver ID', status: 400 }, { status: 400 });
    }

    if (receiver_id === user.id) {
      return NextResponse.json({ data: null, error: 'Cannot friend yourself', status: 400 }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('friendships')
      .insert({ sender_id: user.id, receiver_id, status: 'pending' });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ data: null, error: 'Request already exists', status: 409 }, { status: 409 });
      }
      return NextResponse.json({ data: null, error: error.message, status: 500 }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true }, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed to send request', status: 500 },
      { status: 500 }
    );
  }
}

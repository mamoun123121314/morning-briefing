import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const userIdsParam = request.nextUrl.searchParams.get('userIds');
    if (!userIdsParam) {
      return NextResponse.json({ data: [], error: null, status: 200 });
    }

    const userIds = userIdsParam.split(',');
    if (userIds.length === 0) {
      return NextResponse.json({ data: [], error: null, status: 200 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: activity } = await supabase
      .from('activity_feed')
      .select('*')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(50);

    const uniqueProfileIds = [...new Set((activity ?? []).map((a) => a.user_id))];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', uniqueProfileIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const result = (activity ?? []).map((a) => ({
      ...a,
      profile: profileMap.get(a.user_id) ?? null,
    }));

    return NextResponse.json({ data: result, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed', status: 500 },
      { status: 500 }
    );
  }
}

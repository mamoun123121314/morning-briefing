import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import { fetchNews } from '@/lib/news';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const refresh = request.nextUrl.searchParams.get('refresh') === 'true';

    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('news_interests')
      .eq('id', user.id)
      .maybeSingle();

    const topics = profile?.news_interests ?? ['technology', 'health'];
    const articles = await fetchNews(topics, refresh);

    return NextResponse.json({ data: articles, error: null, status: 200 });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed to fetch news', status: 500 },
      { status: 500 }
    );
  }
}

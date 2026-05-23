import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const newsKey = process.env.NEWS_API_KEY;

    const checks = {
      supabase: !!supabaseUrl,
      newsApi: !!newsKey,
      appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    const allOk = Object.values(checks).every((v) => v === true || typeof v === 'number');

    return NextResponse.json(
      { status: allOk ? 'ok' : 'degraded', checks },
      { status: allOk ? 200 : 503 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

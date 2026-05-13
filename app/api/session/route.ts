import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey || supabaseUrl === 'your-supabase-url') {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { supabaseAdmin } = await import('@/lib/supabase/server');

    const ip = request.headers.get('x-forwarded-for') || '';
    const ipHint = ip.split('.').slice(0, 2).join('.');
    const userAgent = request.headers.get('user-agent') || '';

    const { error } = await supabaseAdmin.from('sessions').upsert(
      {
        id: sessionId,
        user_agent: userAgent,
        ip_hint: ipHint,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Session upsert error:', error);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Session route error:', err);
    return NextResponse.json({ ok: true });
  }
}

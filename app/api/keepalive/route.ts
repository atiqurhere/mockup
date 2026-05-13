import { NextRequest, NextResponse } from 'next/server';

// This endpoint is called by a cron job (Vercel Cron) every day
// to keep the Supabase project active and prevent it from being paused
// Configure in vercel.json:
// { "crons": [{ "path": "/api/keepalive", "schedule": "0 */12 * * *" }] }

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey || supabaseUrl === 'your-supabase-url') {
      return NextResponse.json({ ok: true, message: 'Supabase not configured' });
    }

    const { supabaseAdmin } = await import('@/lib/supabase/server');

    // Lightweight ping query
    const { error } = await supabaseAdmin
      .from('sessions')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Keep-alive ping failed:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Supabase keep-alive ping successful',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Keep-alive error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

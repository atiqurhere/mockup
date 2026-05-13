import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifyAdminCookie(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { supabaseAdmin } = await import('@/lib/supabase/server');

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*, exports(count)')
    .order('last_seen_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sessions = (data || []).map((s: any) => ({
    ...s,
    export_count: s.exports?.[0]?.count || 0,
  }));

  return NextResponse.json({ sessions });
}

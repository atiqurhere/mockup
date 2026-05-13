import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifyAdminCookie(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const { supabaseAdmin } = await import('@/lib/supabase/server');

  const { data, error, count } = await supabaseAdmin
    .from('exports')
    .select('*', { count: 'exact' })
    .order('exported_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ exports: data || [], total: count || 0, page, limit });
}

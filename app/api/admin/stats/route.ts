import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifyAdminCookie(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === 'your-supabase-url') {
    return NextResponse.json({
      totalExports: 0, exportsToday: 0, uniqueSessions: 0, topTemplate: 'N/A',
    });
  }

  const { supabaseAdmin } = await import('@/lib/supabase/server');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ count: totalExports }, { count: exportsToday }, { count: uniqueSessions }, { data: templates }] =
    await Promise.all([
      supabaseAdmin.from('exports').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('exports').select('*', { count: 'exact', head: true }).gte('exported_at', today.toISOString()),
      supabaseAdmin.from('sessions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('exports').select('template_name').limit(1000),
    ]);

  // Find top template
  const templateCounts: Record<string, number> = {};
  templates?.forEach((e: any) => {
    if (e.template_name) templateCounts[e.template_name] = (templateCounts[e.template_name] || 0) + 1;
  });
  const topTemplate = Object.entries(templateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return NextResponse.json({ totalExports, exportsToday, uniqueSessions, topTemplate });
}

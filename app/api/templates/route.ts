import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_TEMPLATES } from '@/lib/templates';

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from Supabase first, fallback to defaults
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey || supabaseUrl === 'your-supabase-url') {
      // No Supabase configured, return defaults
      return NextResponse.json({ templates: DEFAULT_TEMPLATES });
    }

    const { data, error } = await supabaseAdmin
      .from('mockup_templates')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ templates: DEFAULT_TEMPLATES });
    }

    const templates = data.map((t: any) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      category: t.category,
      previewUrl: t.preview_url,
      baseImageUrl: t.base_image_url,
      maskUrl: t.mask_url,
      width: t.width,
      height: t.height,
      printArea: t.print_area,
      blendMode: t.blend_mode || 'multiply',
      tags: t.tags || [],
    }));

    return NextResponse.json({ templates });
  } catch (err) {
    return NextResponse.json({ templates: DEFAULT_TEMPLATES });
  }
}

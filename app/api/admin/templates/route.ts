import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/auth';
import { DEFAULT_TEMPLATES } from '@/lib/templates';

export const runtime = 'nodejs';
export const maxDuration = 60;

type TemplateSeed = (typeof DEFAULT_TEMPLATES)[number];

type TemplateRow = {
  id: string;
  slug: string;
  name: string;
  category: TemplateSeed['category'];
  preview_url: string;
  base_image_url: string;
  mask_url: string | null;
  width: number;
  height: number;
  print_area: TemplateSeed['printArea'];
  blend_mode: string | null;
  tags: string[] | null;
  sort_order: number | null;
};

type TemplateSource = {
  id?: string;
  slug: string;
  name: string;
  category: TemplateSeed['category'];
  previewUrl?: string;
  preview_url?: string;
  baseImageUrl?: string;
  base_image_url?: string;
  maskUrl?: string | null;
  mask_url?: string | null;
  width: number;
  height: number;
  printArea?: TemplateSeed['printArea'];
  print_area?: TemplateSeed['printArea'];
  blendMode?: string | null;
  blend_mode?: string | null;
  tags?: string[] | null;
  sort_order?: number | null;
};

function findSeedTemplate(slug: string): TemplateSeed | undefined {
  return DEFAULT_TEMPLATES.find(template => template.slug === slug);
}

function serializeTemplateRow(row: TemplateRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    previewUrl: row.preview_url,
    baseImageUrl: row.base_image_url,
    maskUrl: row.mask_url,
    width: row.width,
    height: row.height,
    printArea: row.print_area,
    blendMode: row.blend_mode || 'multiply',
    tags: row.tags || [],
  };
}

function buildTemplateRow(existingTemplate: TemplateRow | null, templateSource: TemplateSource) {
  const printArea = templateSource.printArea || templateSource.print_area;
  const previewUrl = templateSource.previewUrl || templateSource.preview_url;
  const baseImageUrl = templateSource.baseImageUrl || templateSource.base_image_url;
  const blendMode = templateSource.blendMode || templateSource.blend_mode || 'multiply';

  return {
    id: existingTemplate?.id || templateSource.id || randomUUID(),
    slug: templateSource.slug,
    name: templateSource.name,
    category: templateSource.category,
    preview_url: existingTemplate?.preview_url || previewUrl || '',
    base_image_url: existingTemplate?.base_image_url || baseImageUrl || '',
    mask_url: existingTemplate?.mask_url || templateSource.maskUrl || templateSource.mask_url || null,
    width: templateSource.width,
    height: templateSource.height,
    print_area: printArea || { x: 0, y: 0, width: templateSource.width, height: templateSource.height, rotation: 0 },
    blend_mode: existingTemplate?.blend_mode || blendMode,
    tags: templateSource.tags || [],
    sort_order: existingTemplate?.sort_order ?? 0,
  };
}

async function uploadTemplateAsset(
  supabaseAdmin: any,
  slug: string,
  kind: 'preview' | 'base',
  file: File,
) {
  const path = `templates/${slug}/${kind}.png`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage.from('templates').upload(path, buffer, {
    contentType: file.type || 'image/png',
    upsert: true,
  });

  if (uploadError) {
    throw new Error(`Failed to upload ${kind} image: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage.from('templates').getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminCookie(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const slug = String(formData.get('slug') || '').trim();
    const previewFile = formData.get('previewImage');
    const baseFile = formData.get('baseImage');

    if (!slug) {
      return NextResponse.json({ error: 'Missing template slug' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabase/server');

    const { data: existingTemplate, error: fetchError } = await supabaseAdmin
      .from('mockup_templates')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const seedTemplate = findSeedTemplate(slug);
    const baseTemplate = existingTemplate || seedTemplate;

    if (!baseTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    let previewUrl = (baseTemplate as any).preview_url || baseTemplate.previewUrl;
    let baseImageUrl = (baseTemplate as any).base_image_url || baseTemplate.baseImageUrl;

    if (previewFile instanceof File) {
      previewUrl = await uploadTemplateAsset(supabaseAdmin, slug, 'preview', previewFile);
    }

    if (baseFile instanceof File) {
      baseImageUrl = await uploadTemplateAsset(supabaseAdmin, slug, 'base', baseFile);
    }

    const updatedTemplate = {
      ...buildTemplateRow(existingTemplate as TemplateRow | null, baseTemplate as TemplateSource),
      preview_url: previewUrl,
      base_image_url: baseImageUrl,
    };

    const { data, error: upsertError } = await supabaseAdmin
      .from('mockup_templates')
      .upsert(updatedTemplate, { onConflict: 'slug' })
      .select('*')
      .single();

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      template: serializeTemplateRow(data as TemplateRow),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Template update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdminCookie(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing template slug' }, { status: 400 });
    }

    const seedTemplate = findSeedTemplate(slug);

    if (!seedTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const { supabaseAdmin } = await import('@/lib/supabase/server');

    await supabaseAdmin.storage.from('templates').remove([
      `templates/${slug}/preview.png`,
      `templates/${slug}/base.png`,
    ]);

    const { data: existingTemplate, error: fetchError } = await supabaseAdmin
      .from('mockup_templates')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const resetTemplate = buildTemplateRow(existingTemplate as TemplateRow | null, seedTemplate as TemplateSource);

    const { data, error: upsertError } = await supabaseAdmin
      .from('mockup_templates')
      .upsert(resetTemplate, { onConflict: 'slug' })
      .select('*')
      .single();

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, template: serializeTemplateRow(data as TemplateRow) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Template reset failed' }, { status: 500 });
  }
}
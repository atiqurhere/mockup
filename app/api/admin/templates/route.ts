import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/auth';
import { DEFAULT_TEMPLATES } from '@/lib/templates';

export const runtime = 'nodejs';
export const maxDuration = 60;

type TemplateSeed = (typeof DEFAULT_TEMPLATES)[number];

function findSeedTemplate(slug: string): TemplateSeed | undefined {
  return DEFAULT_TEMPLATES.find(template => template.slug === slug);
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

    let previewUrl = baseTemplate.preview_url || baseTemplate.previewUrl;
    let baseImageUrl = baseTemplate.base_image_url || baseTemplate.baseImageUrl;

    if (previewFile instanceof File) {
      previewUrl = await uploadTemplateAsset(supabaseAdmin, slug, 'preview', previewFile);
    }

    if (baseFile instanceof File) {
      baseImageUrl = await uploadTemplateAsset(supabaseAdmin, slug, 'base', baseFile);
    }

    const updatedTemplate = {
      id: existingTemplate?.id || randomUUID(),
      slug: baseTemplate.slug,
      name: baseTemplate.name,
      category: baseTemplate.category,
      preview_url: previewUrl,
      base_image_url: baseImageUrl,
      mask_url: baseTemplate.mask_url || baseTemplate.maskUrl || null,
      width: baseTemplate.width,
      height: baseTemplate.height,
      print_area: baseTemplate.print_area || baseTemplate.printArea,
      blend_mode: baseTemplate.blend_mode || baseTemplate.blendMode || 'multiply',
      tags: baseTemplate.tags || [],
      sort_order: baseTemplate.sort_order ?? 0,
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
      template: {
        id: data.id,
        slug: data.slug,
        name: data.name,
        category: data.category,
        previewUrl: data.preview_url,
        baseImageUrl: data.base_image_url,
        maskUrl: data.mask_url,
        width: data.width,
        height: data.height,
        printArea: data.print_area,
        blendMode: data.blend_mode || 'multiply',
        tags: data.tags || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Template update failed' }, { status: 500 });
  }
}
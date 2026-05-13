import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectLocalId,
      projectName,
      templateSlug,
      artworkDataUrl,
      canvasStateJSON,
      thumbnailDataUrl,
      format = 'png',
      scale = 1,
      sessionId,
      printArea,
      templateWidth,
      templateHeight,
    } = body;

    if (!artworkDataUrl) {
      return NextResponse.json({ error: 'Missing artwork data' }, { status: 400 });
    }

    const supabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-url';

    // --- Process image with Sharp ---
    const sharp = (await import('sharp')).default;

    // Decode artwork base64
    const artworkBase64 = artworkDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const artworkBuffer = Buffer.from(artworkBase64, 'base64');

    // Target output dimensions
    const outWidth = (templateWidth || 1000) * scale;
    const outHeight = (templateHeight || 1200) * scale;

    let outputBuffer: Buffer;
    const exportId = uuidv4();

    // Create a simple composite: artwork placed on a white/transparent background
    // In production with real base images from Supabase Storage, we'd fetch & composite
    // For now, we resize artwork to fill the print area
    const scaledPrintArea = printArea ? {
      left: Math.round(printArea.x * scale),
      top: Math.round(printArea.y * scale),
      width: Math.round(printArea.width * scale),
      height: Math.round(printArea.height * scale),
    } : null;

    if (format === 'pdf') {
      // PDF generation with pdf-lib
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      
      // A4 portrait for posters, custom for others
      const pageW = outWidth * 0.75; // convert px to pt (96dpi → 72dpi)
      const pageH = outHeight * 0.75;
      const page = pdfDoc.addPage([pageW, pageH]);

      // Embed the artwork image
      const artworkSharp = await sharp(artworkBuffer)
        .resize(Math.round(pageW), Math.round(pageH), { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toBuffer();

      const pdfImage = await pdfDoc.embedPng(artworkSharp);
      page.drawImage(pdfImage, { x: 0, y: 0, width: pageW, height: pageH });

      const pdfBytes = await pdfDoc.save();
      outputBuffer = Buffer.from(pdfBytes);

      if (!supabaseConfigured) {
        return new NextResponse(outputBuffer as unknown as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${projectName || 'mockup'}.pdf"`,
          },
        });
      }
    } else {
      // Raster export
      let sharpInstance = sharp(artworkBuffer).resize(outWidth, outHeight, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: format === 'png' ? 0 : 1 },
      });

      if (format === 'jpg') {
        sharpInstance = sharpInstance.jpeg({ quality: 90 }) as any;
      } else if (format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality: 90 }) as any;
      } else {
        sharpInstance = sharpInstance.png({ compressionLevel: 8 }) as any;
      }

      outputBuffer = await (sharpInstance as any).toBuffer();

      if (!supabaseConfigured) {
        const mimeMap: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          webp: 'image/webp',
        };
        return new NextResponse(outputBuffer as unknown as BodyInit, {
          headers: {
            'Content-Type': mimeMap[format] || 'image/png',
            'Content-Disposition': `attachment; filename="${projectName || 'mockup'}.${format}"`,
          },
        });
      }
    }

    // --- Supabase Storage upload ---
    const { supabaseAdmin } = await import('@/lib/supabase/server');

    // Upsert session
    if (sessionId) {
      const ip = request.headers.get('x-forwarded-for') || '';
      const ipHint = ip.split('.').slice(0, 2).join('.');
      await supabaseAdmin.from('sessions').upsert(
        { id: sessionId, user_agent: request.headers.get('user-agent') || '', ip_hint: ipHint, last_seen_at: new Date().toISOString() },
        { onConflict: 'id' }
      );
    }

    const storageBase = `${sessionId || 'anon'}/${projectLocalId || exportId}`;

    // Upload artwork
    const artworkPath = `${storageBase}/artwork.png`;
    await supabaseAdmin.storage.from('artworks').upload(artworkPath, artworkBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

    // Upload export file
    const exportPath = `${storageBase}/${format}.${format}`;
    const mimeTypes: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', pdf: 'application/pdf',
    };
    await supabaseAdmin.storage.from('exports').upload(exportPath, outputBuffer!, {
      contentType: mimeTypes[format] || 'image/png',
      upsert: true,
    });

    // Upload thumbnail
    let thumbnailPath: string | null = null;
    if (thumbnailDataUrl) {
      const thumbBase64 = thumbnailDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const thumbBuffer = Buffer.from(thumbBase64, 'base64');
      thumbnailPath = `${storageBase}/thumb.png`;
      await supabaseAdmin.storage.from('thumbnails').upload(thumbnailPath, thumbBuffer, {
        contentType: 'image/png',
        upsert: true,
      });
    }

    // Insert export record
    const { data: exportRecord } = await supabaseAdmin.from('exports').insert({
      id: exportId,
      session_id: sessionId || null,
      project_local_id: projectLocalId,
      project_name: projectName,
      template_name: templateSlug,
      artwork_url: artworkPath,
      export_url: exportPath,
      thumbnail_url: thumbnailPath,
      format,
      width: outWidth,
      height: outHeight,
      file_size: outputBuffer!.length,
      canvas_state: canvasStateJSON,
    }).select().single();

    // Return the file as download + export ID
    const mimeMap: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', pdf: 'application/pdf',
    };

    return new NextResponse(outputBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': mimeMap[format] || 'image/png',
        'Content-Disposition': `attachment; filename="${projectName || 'mockup'}.${format}"`,
        'X-Export-Id': exportId,
        'X-Supabase-Record-Id': exportRecord?.id || exportId,
      },
    });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: err.message || 'Export failed' }, { status: 500 });
  }
}

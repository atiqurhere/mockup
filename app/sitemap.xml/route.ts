import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://mockupforge.vercel.app';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/editor</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
</urlset>`;
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

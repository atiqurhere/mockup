import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/auth';

const SCHEMA_SQL = `-- MockupForge Database Schema
-- Run this in your Supabase SQL Editor

-- Anonymous sessions
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY,
  user_agent text,
  ip_hint text,
  country text,
  created_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now()
);

-- Mockup templates
CREATE TABLE IF NOT EXISTS mockup_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  preview_url text NOT NULL,
  base_image_url text NOT NULL,
  mask_url text,
  width int NOT NULL,
  height int NOT NULL,
  print_area jsonb NOT NULL,
  blend_mode text DEFAULT 'multiply',
  tags text[],
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Export records
CREATE TABLE IF NOT EXISTS exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id),
  project_local_id text,
  project_name text,
  template_id uuid REFERENCES mockup_templates(id),
  template_name text,
  artwork_url text,
  export_url text,
  thumbnail_url text,
  format text NOT NULL,
  width int,
  height int,
  file_size int,
  canvas_state jsonb,
  exported_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exports_session_id ON exports(session_id);
CREATE INDEX IF NOT EXISTS idx_exports_exported_at ON exports(exported_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON sessions(last_seen_at DESC);

-- Storage Buckets (run in Supabase dashboard or via API):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('artworks', 'artworks', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('templates', 'templates', true);

-- RLS: Disable for service_role access (API routes use service_role key)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mockup_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (already default)
-- Public read for templates
CREATE POLICY "Public read templates" ON mockup_templates FOR SELECT USING (true);
`;

export async function GET(request: NextRequest) {
  const admin = await verifyAdminCookie(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return new NextResponse(SCHEMA_SQL, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mockupforge-schema.sql"',
    },
  });
}

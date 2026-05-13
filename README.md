# MockupForge

A full-stack mockup generator web app. No sign-in required — anyone visits and starts designing immediately.

**Stack:** Next.js 14 · Tailwind CSS · Fabric.js · Zustand · Supabase · Sharp · Vercel

---

## 🚀 Quick Deploy

### 1. Clone & Install

```bash
git clone <your-repo>
cd mockupforge
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema:
   - After deploying, log into `/admin` and click **"View schema SQL"** to download it
   - Or copy from `app/api/admin/schema/route.ts`
3. Create Storage Buckets (in Supabase Dashboard → Storage):
   - `artworks` — private
   - `exports` — private
   - `thumbnails` — private
   - `templates` — **public**

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_JWT_SECRET=generate-32-char-random-string-here

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

> **Generate JWT secret:** `openssl rand -base64 32`

### 4. Deploy to Vercel

```bash
# Push to GitHub, then:
# 1. Import repo in Vercel
# 2. Add all env vars in Vercel Dashboard → Settings → Environment Variables
# 3. Deploy
```

Vercel will automatically pick up `vercel.json` and run the keep-alive cron every 12 hours.

---

## 📁 Project Structure

```
/app
  /page.tsx                  ← Landing page
  /editor/page.tsx           ← Main editor (no auth)
  /admin/
    /login/page.tsx          ← Admin login
    /page.tsx                ← Stats dashboard
    /exports/page.tsx        ← All exports table
    /sessions/page.tsx       ← Anonymous sessions
    /templates/page.tsx      ← Template management
  /api/
    /export/route.ts         ← Sharp/pdf-lib export
    /templates/route.ts      ← GET templates
    /session/route.ts        ← Session upsert
    /keepalive/route.ts      ← Supabase keep-alive ping
    /admin/
      /login/route.ts        ← Admin auth
      /logout/route.ts
      /stats/route.ts
      /exports/route.ts
      /sessions/route.ts
      /schema/route.ts       ← Download SQL schema

/components
  /editor/
    EditorLayout.tsx         ← Main editor shell (mobile responsive)
    CanvasEditor.tsx         ← Fabric.js canvas
    TemplatePanel.tsx        ← Template gallery
    ControlsPanel.tsx        ← Blend mode, opacity, etc.
    HistorySidebar.tsx       ← localStorage project history
    ExportModal.tsx          ← Export format/scale picker
  /admin/
    AdminShell.tsx           ← Admin nav layout
  /ui/
    Toast.tsx

/lib
  /fabric/helpers.ts         ← Canvas utilities
  /store/editorStore.ts      ← Zustand state
  /supabase/client.ts        ← Anon client
  /supabase/server.ts        ← Service role client
  /localStorage.ts           ← Project persistence
  /templates.ts              ← Default template data
  /auth.ts                   ← JWT cookie verify
```

---

## 🔑 Auth Model

| Role | Access | Method |
|------|--------|--------|
| Public user | Full editor, no sign-in | Anonymous, localStorage only |
| Admin | `/admin` dashboard | Hardcoded env var login |

---

## 🎨 Adding Real Mockup Templates

1. Prepare base images (PNG with transparent areas for artwork, or solid)
2. Upload to Supabase Storage `templates/` bucket
3. Insert into `mockup_templates` table:

```sql
INSERT INTO mockup_templates (slug, name, category, preview_url, base_image_url, width, height, print_area, blend_mode, tags)
VALUES (
  'black-tshirt-front',
  'Black T-Shirt — Front',
  'tshirt',
  'https://your-project.supabase.co/storage/v1/object/public/templates/tshirt-black-preview.png',
  'https://your-project.supabase.co/storage/v1/object/public/templates/tshirt-black-base.png',
  1000, 1200,
  '{"x": 300, "y": 280, "width": 400, "height": 450, "rotation": 0}',
  'multiply',
  ARRAY['tshirt', 'apparel', 'black']
);
```

---

## 🔄 Keep-Alive Cron

The `vercel.json` configures a cron job to ping `/api/keepalive` every 12 hours. This performs a lightweight query on your Supabase DB to prevent it being paused on the free tier.

You can test it manually by visiting `/api/keepalive` or using the **"Test ping now"** button in the admin dashboard.

---

## 📤 Export Formats

| Format | Use case |
|--------|----------|
| PNG | Lossless, transparent background support |
| JPG | Smaller file size for sharing |
| WebP | Modern format, best compression |
| PDF | Print-ready documents |

Scale options: 1× (standard), 2× (retina), 3× (ultra HD)

---

## 🛡️ Security Notes

- All user storage buckets are **private** — only accessible via service_role API key
- Admin session uses signed JWT in httpOnly cookie
- No user data collected — only anonymous session UUIDs
- IP stored as first 2 octets only (`192.168.x.x` → `192.168`)

---

## 🔧 Local Development

```bash
npm run dev
# Open http://localhost:3000
# Admin: http://localhost:3000/admin/login
```

The app works **without Supabase** in development — exports are served directly as file downloads, and templates fall back to the built-in defaults.

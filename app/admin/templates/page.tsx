'use client';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { DEFAULT_TEMPLATES } from '@/lib/templates';
import type { Template } from '@/types';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(d => { if (d.templates?.length) setTemplates(d.templates); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell>
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl">Templates</h1>
            <p className="text-forge-subtle text-sm mt-1">{templates.length} mockup templates</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <p className="text-blue-400 text-sm font-semibold mb-1">📋 Template Management</p>
          <p className="text-blue-300/70 text-xs">
            To add real mockup templates, upload your base images to the Supabase Storage{' '}
            <code className="bg-blue-500/10 px-1 rounded">templates/</code> bucket and insert records
            into the <code className="bg-blue-500/10 px-1 rounded">mockup_templates</code> table.
            The app uses these defaults when no DB records exist.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-forge-surface border border-forge-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map(t => (
              <div key={t.id} className="bg-forge-surface border border-forge-border rounded-xl overflow-hidden">
                <div className={`aspect-[3/4] flex items-center justify-center text-4xl ${getCatBg(t.category)}`}>
                  {getCatIcon(t.category)}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-xs text-forge-text truncate">{t.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] bg-forge-muted text-forge-subtle px-1.5 py-0.5 rounded capitalize">{t.category}</span>
                    <span className="text-[10px] text-forge-subtle font-mono">{t.width}×{t.height}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(t.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] bg-forge-muted/50 text-forge-subtle px-1 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SQL seed script */}
        <div className="mt-8 bg-forge-surface border border-forge-border rounded-xl p-5">
          <h2 className="font-display font-bold text-sm mb-3 text-forge-text">Supabase DB Schema</h2>
          <p className="text-forge-subtle text-xs mb-3">Run this SQL in your Supabase SQL Editor to create all required tables:</p>
          <a
            href="/api/admin/schema"
            className="inline-flex items-center gap-1.5 text-xs bg-forge-muted hover:bg-forge-border text-forge-text px-3 py-2 rounded-lg transition-colors"
          >
            📄 View schema SQL
          </a>
        </div>
      </div>
    </AdminShell>
  );
}

function getCatIcon(cat: string) {
  const m: Record<string, string> = { tshirt: '👕', poster: '🖼️', mug: '☕', signboard: '🪧', hoodie: '🧥', tote: '👜' };
  return m[cat] || '📦';
}

function getCatBg(cat: string) {
  const m: Record<string, string> = {
    tshirt: 'bg-gradient-to-br from-forge-muted to-forge-surface',
    poster: 'bg-gradient-to-br from-blue-950/50 to-forge-surface',
    mug: 'bg-gradient-to-br from-amber-950/50 to-forge-surface',
    signboard: 'bg-gradient-to-br from-green-950/50 to-forge-surface',
    hoodie: 'bg-gradient-to-br from-purple-950/50 to-forge-surface',
    tote: 'bg-gradient-to-br from-stone-800/50 to-forge-surface',
  };
  return m[cat] || 'bg-forge-muted';
}

'use client';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { DEFAULT_TEMPLATES } from '@/lib/templates';
import type { Template } from '@/types';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, { previewImage?: File; baseImage?: File }>>({});
  const [savingSlug, setSavingSlug] = useState('');
  const [resettingSlug, setResettingSlug] = useState('');
  const [statusBySlug, setStatusBySlug] = useState<Record<string, { type: 'success' | 'error'; message: string }>>({});

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(d => { if (d.templates?.length) setTemplates(d.templates); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (template: Template) => {
    const files = selectedFiles[template.slug] || {};

    if (!files.previewImage && !files.baseImage) {
      setStatusBySlug(prev => ({
        ...prev,
        [template.slug]: { type: 'error', message: 'Choose a preview or base image first.' },
      }));
      return;
    }

    setSavingSlug(template.slug);
    setStatusBySlug(prev => ({ ...prev, [template.slug]: { type: 'success', message: 'Saving...' } }));

    try {
      const formData = new FormData();
      formData.append('slug', template.slug);
      if (files.previewImage) formData.append('previewImage', files.previewImage);
      if (files.baseImage) formData.append('baseImage', files.baseImage);

      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update template');
      }

      setTemplates(prev => prev.map(item => (item.slug === data.template.slug ? data.template : item)));
      setSelectedFiles(prev => ({ ...prev, [template.slug]: {} }));
      setStatusBySlug(prev => ({
        ...prev,
        [template.slug]: { type: 'success', message: 'Template images updated.' },
      }));
    } catch (err: any) {
      setStatusBySlug(prev => ({
        ...prev,
        [template.slug]: { type: 'error', message: err.message || 'Update failed' },
      }));
    } finally {
      setSavingSlug('');
    }
  };

  const handleReset = async (template: Template) => {
    setResettingSlug(template.slug);
    setStatusBySlug(prev => ({ ...prev, [template.slug]: { type: 'success', message: 'Resetting to defaults...' } }));

    try {
      const res = await fetch('/api/admin/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: template.slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset template');
      }

      setTemplates(prev => prev.map(item => (item.slug === data.template.slug ? data.template : item)));
      setSelectedFiles(prev => ({ ...prev, [template.slug]: {} }));
      setStatusBySlug(prev => ({
        ...prev,
        [template.slug]: { type: 'success', message: 'Template reset to defaults.' },
      }));
    } catch (err: any) {
      setStatusBySlug(prev => ({
        ...prev,
        [template.slug]: { type: 'error', message: err.message || 'Reset failed' },
      }));
    } finally {
      setResettingSlug('');
    }
  };

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
            Upload preview or base images here to save them into the Supabase Storage{' '}
            <code className="bg-blue-500/10 px-1 rounded">templates/</code> bucket and update the
            <code className="bg-blue-500/10 px-1 rounded ml-1">mockup_templates</code> record.
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
                <div className={`aspect-[3/4] relative overflow-hidden ${getCatBg(t.category)}`}>
                  <img
                    src={t.previewUrl}
                    alt={t.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-2 left-2 text-2xl drop-shadow">{getCatIcon(t.category)}</div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-semibold leading-tight drop-shadow">{t.name}</p>
                    <p className="text-white/70 text-[10px] font-mono">{t.slug}</p>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] bg-forge-muted text-forge-subtle px-1.5 py-0.5 rounded capitalize">{t.category}</span>
                    <span className="text-[10px] text-forge-subtle font-mono">{t.width}×{t.height}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-forge-subtle">
                    <div>
                      <p className="mb-1 font-semibold text-forge-text">Current preview</p>
                      <img src={t.previewUrl} alt={`${t.name} preview`} className="h-20 w-full rounded-lg object-cover border border-forge-border" />
                    </div>
                    <div>
                      <p className="mb-1 font-semibold text-forge-text">Current base</p>
                      <img src={t.baseImageUrl} alt={`${t.name} base`} className="h-20 w-full rounded-lg object-cover border border-forge-border" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-forge-subtle">
                      Preview image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setSelectedFiles(prev => ({
                          ...prev,
                          [t.slug]: { ...(prev[t.slug] || {}), previewImage: e.target.files?.[0] },
                        }))}
                        className="mt-1 block w-full text-[10px] text-forge-text file:mr-2 file:rounded-md file:border-0 file:bg-forge-muted file:px-2 file:py-1 file:text-[10px] file:font-semibold file:text-forge-text"
                      />
                    </label>
                    <label className="block text-[10px] font-semibold text-forge-subtle">
                      Base image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setSelectedFiles(prev => ({
                          ...prev,
                          [t.slug]: { ...(prev[t.slug] || {}), baseImage: e.target.files?.[0] },
                        }))}
                        className="mt-1 block w-full text-[10px] text-forge-text file:mr-2 file:rounded-md file:border-0 file:bg-forge-muted file:px-2 file:py-1 file:text-[10px] file:font-semibold file:text-forge-text"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(t.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] bg-forge-muted/50 text-forge-subtle px-1 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-[10px] text-forge-subtle">
                      {selectedFiles[t.slug]?.previewImage?.name || selectedFiles[t.slug]?.baseImage?.name ? 'File selected' : 'Choose an image to update'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReset(t)}
                        disabled={resettingSlug === t.slug}
                        className="rounded-lg border border-forge-border bg-forge-muted px-3 py-1.5 text-[10px] font-semibold text-forge-text disabled:opacity-60"
                      >
                        {resettingSlug === t.slug ? 'Resetting...' : 'Reset'}
                      </button>
                      <button
                        onClick={() => handleSave(t)}
                        disabled={savingSlug === t.slug}
                        className="rounded-lg bg-forge-accent px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-60"
                      >
                        {savingSlug === t.slug ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                  {statusBySlug[t.slug] && (
                    <p className={`text-[10px] ${statusBySlug[t.slug].type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {statusBySlug[t.slug].message}
                    </p>
                  )}
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

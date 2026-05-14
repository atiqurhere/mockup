'use client';
import { useEffect, useState } from 'react';
import { useEditorStore } from '@/lib/store/editorStore';
import type { Template } from '@/types';
import { DEFAULT_TEMPLATES } from '@/lib/templates';

const CATEGORIES = ['All', 'tshirt', 'poster', 'mug', 'signboard', 'hoodie', 'tote'];

export default function TemplatePanel({ onSelect }: { onSelect?: () => void }) {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const { newProject, selectedTemplate } = useEditorStore();

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(d => {
        if (d.templates?.length) setTemplates(d.templates);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? templates
    : templates.filter(t => t.category === activeCategory);

  const handleSelect = (t: Template) => {
    newProject(t);
    onSelect?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category filter */}
      <div className="p-3 border-b border-forge-border">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded text-xs font-semibold capitalize transition-colors ${
                activeCategory === cat
                  ? 'bg-forge-accent text-white'
                  : 'bg-forge-muted text-forge-subtle hover:text-forge-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded bg-forge-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  selectedTemplate?.id === t.id
                    ? 'border-forge-accent shadow-lg shadow-forge-accent/20'
                    : 'border-forge-border hover:border-forge-muted'
                }`}
              >
                {!brokenImages[t.id] ? (
                  <img
                    src={t.previewUrl}
                    alt={t.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={() => setBrokenImages(prev => ({ ...prev, [t.id]: true }))}
                  />
                ) : (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 ${getCategoryColor(t.category)}`}>
                    <span className="text-3xl">{getCategoryIcon(t.category)}</span>
                  </div>
                )}
                {/* Template name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
                  <p className="text-white text-[10px] font-semibold leading-tight">{t.name}</p>
                </div>
                {selectedTemplate?.id === t.id && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-forge-accent flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryIcon(cat: string) {
  const icons: Record<string, string> = {
    tshirt: '👕', poster: '🖼️', mug: '☕', signboard: '🪧', hoodie: '🧥', tote: '👜',
  };
  return icons[cat] || '📦';
}

function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    tshirt: 'bg-gradient-to-br from-forge-muted to-forge-surface',
    poster: 'bg-gradient-to-br from-blue-950/50 to-forge-surface',
    mug: 'bg-gradient-to-br from-amber-950/50 to-forge-surface',
    signboard: 'bg-gradient-to-br from-green-950/50 to-forge-surface',
    hoodie: 'bg-gradient-to-br from-purple-950/50 to-forge-surface',
    tote: 'bg-gradient-to-br from-stone-800/50 to-forge-surface',
  };
  return colors[cat] || 'bg-forge-muted';
}

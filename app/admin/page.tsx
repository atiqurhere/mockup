'use client';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface Stats {
  totalExports: number;
  exportsToday: number;
  uniqueSessions: number;
  topTemplate: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Exports', value: stats?.totalExports ?? '—', icon: '📤', color: 'text-forge-accent' },
    { label: 'Exports Today', value: stats?.exportsToday ?? '—', icon: '🕐', color: 'text-blue-400' },
    { label: 'Unique Sessions', value: stats?.uniqueSessions ?? '—', icon: '👤', color: 'text-green-400' },
    { label: 'Top Template', value: stats?.topTemplate ?? '—', icon: '🏆', color: 'text-forge-gold', small: true },
  ];

  return (
    <AdminShell>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="font-display font-black text-2xl">Overview</h1>
          <p className="text-forge-subtle text-sm mt-1">MockupForge admin dashboard</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(card => (
            <div key={card.label} className="bg-forge-surface border border-forge-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{card.icon}</span>
              </div>
              <p className={`font-display font-black text-2xl ${card.color} ${card.small ? 'text-sm truncate' : ''}`}>
                {loading ? <span className="animate-pulse">…</span> : card.value}
              </p>
              <p className="text-forge-subtle text-xs mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Keep-alive info */}
        <div className="bg-forge-surface border border-forge-border rounded-xl p-5 mb-6">
          <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2">
            <span>🔄</span> Supabase Keep-Alive
          </h2>
          <p className="text-forge-subtle text-sm mb-3">
            The keep-alive cron runs weekly to prevent Supabase from pausing your project.
            Configure in <code className="bg-forge-muted px-1 rounded text-xs">vercel.json</code>.
          </p>
          <div className="bg-forge-muted rounded-lg p-3">
            <code className="text-xs text-forge-accent font-mono">GET /api/keepalive</code>
          </div>
          <button
            onClick={async () => {
              const r = await fetch('/api/keepalive');
              const d = await r.json();
              alert(d.ok ? '✅ Keep-alive ping successful!' : '❌ ' + d.error);
            }}
            className="mt-3 text-xs bg-forge-muted hover:bg-forge-border px-3 py-1.5 rounded-lg text-forge-text transition-colors"
          >
            Test ping now
          </button>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/admin/exports', label: 'View all exports', icon: '📤', desc: 'Browse and download exported files' },
            { href: '/admin/sessions', label: 'User sessions', icon: '👤', desc: 'See anonymous visitor sessions' },
            { href: '/admin/templates', label: 'Manage templates', icon: '🎨', desc: 'Add or edit mockup templates' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="bg-forge-surface border border-forge-border hover:border-forge-accent/40 rounded-xl p-4 transition-colors group"
            >
              <span className="text-2xl block mb-2">{link.icon}</span>
              <p className="font-semibold text-sm text-forge-text group-hover:text-forge-accent transition-colors">{link.label}</p>
              <p className="text-forge-subtle text-xs mt-1">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

'use client';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface SessionRow {
  id: string;
  user_agent: string;
  ip_hint: string;
  country: string;
  created_at: string;
  last_seen_at: string;
  export_count: number;
}

export default function AdminSessions() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/sessions')
      .then(r => r.json())
      .then(d => setSessions(d.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="font-display font-black text-2xl">Sessions</h1>
          <p className="text-forge-subtle text-sm mt-1">{sessions.length} anonymous visitor sessions</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-forge-surface border border-forge-border animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-forge-surface border border-forge-border rounded-xl p-12 text-center">
            <p className="text-3xl mb-3">👤</p>
            <p className="font-semibold text-forge-text">No sessions yet</p>
            <p className="text-forge-subtle text-sm mt-1">Sessions appear after first export</p>
          </div>
        ) : (
          <div className="bg-forge-surface border border-forge-border rounded-xl overflow-hidden">
            {/* Desktop */}
            <table className="w-full text-sm hidden sm:table">
              <thead>
                <tr className="border-b border-forge-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Session ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">IP Hint</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Browser</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Exports</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">First seen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr key={s.id} className="border-b border-forge-border/50 hover:bg-forge-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-forge-subtle">{s.id?.slice(0, 12)}…</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-forge-subtle">{s.ip_hint || '—'}</td>
                    <td className="px-4 py-3 text-xs text-forge-subtle max-w-[160px] truncate">{getBrowser(s.user_agent)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.export_count > 0 ? 'bg-forge-accent/10 text-forge-accent' : 'bg-forge-muted text-forge-subtle'}`}>
                        {s.export_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-forge-subtle">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-forge-subtle">{formatDate(s.last_seen_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-forge-border/50">
              {sessions.map(s => (
                <div key={s.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-forge-subtle">{s.id?.slice(0, 16)}…</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.export_count > 0 ? 'bg-forge-accent/10 text-forge-accent' : 'bg-forge-muted text-forge-subtle'}`}>
                      {s.export_count || 0} exports
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-forge-subtle">
                    <span>{s.ip_hint || '—'}</span>
                    <span>{getBrowser(s.user_agent)}</span>
                  </div>
                  <p className="text-xs text-forge-subtle mt-1">Last seen: {formatDate(s.last_seen_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function getBrowser(ua: string) {
  if (!ua) return 'Unknown';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return ua.slice(0, 30);
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

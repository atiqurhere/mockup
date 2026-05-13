'use client';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface ExportRow {
  id: string;
  session_id: string;
  project_name: string;
  template_name: string;
  format: string;
  width: number;
  height: number;
  file_size: number;
  thumbnail_url: string;
  export_url: string;
  exported_at: string;
}

export default function AdminExports() {
  const [exports, setExports] = useState<ExportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchExports = async (p: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/exports?page=${p}`);
      const d = await r.json();
      setExports(d.exports || []);
      setTotal(d.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchExports(page); }, [page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminShell>
      <div className="max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl">Exports</h1>
            <p className="text-forge-subtle text-sm mt-1">{total} total exports</p>
          </div>
          <button onClick={() => fetchExports(page)} className="text-xs bg-forge-muted hover:bg-forge-border px-3 py-1.5 rounded-lg text-forge-text transition-colors">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-forge-surface border border-forge-border animate-pulse" />
            ))}
          </div>
        ) : exports.length === 0 ? (
          <div className="bg-forge-surface border border-forge-border rounded-xl p-12 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="font-semibold text-forge-text">No exports yet</p>
            <p className="text-forge-subtle text-sm mt-1">Exports will appear here after users download mockups</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-forge-surface border border-forge-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-forge-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Preview</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Project</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Template</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Format</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Size</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Session</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forge-subtle">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {exports.map((ex, i) => (
                    <tr key={ex.id} className={`border-b border-forge-border/50 hover:bg-forge-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-forge-muted/5'}`}>
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded bg-forge-muted flex items-center justify-center text-lg">
                          {getFormatIcon(ex.format)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-forge-text truncate max-w-[140px]">{ex.project_name || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-forge-subtle truncate max-w-[120px]">{ex.template_name || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${getFormatColor(ex.format)}`}>
                          {ex.format?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-forge-subtle text-xs font-mono">
                        {ex.width && ex.height ? `${ex.width}×${ex.height}` : '—'}
                        {ex.file_size ? <span className="block">{formatBytes(ex.file_size)}</span> : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-forge-subtle">{ex.session_id?.slice(0, 8) || '—'}…</span>
                      </td>
                      <td className="px-4 py-3 text-forge-subtle text-xs">
                        {formatDate(ex.exported_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {exports.map(ex => (
                <div key={ex.id} className="bg-forge-surface border border-forge-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-forge-muted flex items-center justify-center text-lg flex-shrink-0">
                      {getFormatIcon(ex.format)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-forge-text text-sm truncate">{ex.project_name || 'Untitled'}</p>
                      <p className="text-forge-subtle text-xs mt-0.5">{ex.template_name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${getFormatColor(ex.format)}`}>
                          {ex.format?.toUpperCase()}
                        </span>
                        <span className="text-forge-subtle text-xs">{formatDate(ex.exported_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-forge-surface border border-forge-border hover:border-forge-accent/40 disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-forge-subtle text-sm">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-forge-surface border border-forge-border hover:border-forge-accent/40 disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}

function getFormatIcon(fmt: string) {
  const icons: Record<string, string> = { png: '🖼️', jpg: '📷', webp: '🌐', pdf: '📄' };
  return icons[fmt?.toLowerCase()] || '📁';
}

function getFormatColor(fmt: string) {
  const colors: Record<string, string> = {
    png: 'bg-blue-500/10 text-blue-400',
    jpg: 'bg-amber-500/10 text-amber-400',
    webp: 'bg-green-500/10 text-green-400',
    pdf: 'bg-red-500/10 text-red-400',
  };
  return colors[fmt?.toLowerCase()] || 'bg-forge-muted text-forge-subtle';
}

function formatBytes(bytes: number) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

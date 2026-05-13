'use client';
import { useState } from 'react';
import { useEditorStore } from '@/lib/store/editorStore';
import { v4 as uuidv4 } from 'uuid';

type Format = 'png' | 'jpg' | 'webp' | 'pdf';
type Scale = 1 | 2 | 3;

export default function ExportModal({ onClose, showToast }: {
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const { activeProject, selectedTemplate, artworkDataUrl, sessionId, isExporting, setExporting } = useEditorStore();
  const [format, setFormat] = useState<Format>('png');
  const [scale, setScale] = useState<Scale>(2);

  const handleExport = async () => {
    if (!activeProject) return;

    const artworkDataUrlFromCanvas = (window as any).__getCanvasDataUrl?.();
    const canvasJSON = (window as any).__getCanvasJSON?.();
    const thumbnailDataUrl = (window as any).__getCanvasThumbnail?.();

    if (!artworkDataUrlFromCanvas) {
      showToast('Please add artwork to the canvas first', 'error');
      return;
    }

    setExporting(true, 10);

    try {
      setExporting(true, 30);

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectLocalId: activeProject.id,
          projectName: activeProject.name,
          templateSlug: selectedTemplate?.slug || 'custom',
          artworkDataUrl: artworkDataUrlFromCanvas,
          canvasStateJSON: canvasJSON,
          thumbnailDataUrl,
          format,
          scale,
          sessionId,
          printArea: selectedTemplate?.printArea,
          templateWidth: selectedTemplate?.width || 1000,
          templateHeight: selectedTemplate?.height || 1200,
        }),
      });

      setExporting(true, 80);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Export failed');
      }

      const exportId = response.headers.get('X-Export-Id') || uuidv4();
      const supabaseRecordId = response.headers.get('X-Supabase-Record-Id') || undefined;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      // Save export record to localStorage
      const { addExport, saveProject } = await import('@/lib/localStorage');
      addExport({ id: exportId, projectId: activeProject.id, format, exportedAt: new Date().toISOString(), supabaseRecordId });

      // Mark project as exported
      const updatedProject = { ...activeProject, exported: true, updatedAt: new Date().toISOString() };
      saveProject(updatedProject);

      setExporting(false, 100);
      showToast(`Exported as ${format.toUpperCase()} successfully!`, 'success');
      onClose();
    } catch (err: any) {
      setExporting(false);
      showToast(err.message || 'Export failed', 'error');
    }
  };

  const formats: { value: Format; label: string; desc: string }[] = [
    { value: 'png', label: 'PNG', desc: 'Lossless, transparent' },
    { value: 'jpg', label: 'JPG', desc: 'Smaller file size' },
    { value: 'webp', label: 'WebP', desc: 'Modern, efficient' },
    { value: 'pdf', label: 'PDF', desc: 'Print-ready' },
  ];

  const scales: { value: Scale; label: string; desc: string }[] = [
    { value: 1, label: '1×', desc: 'Standard' },
    { value: 2, label: '2×', desc: 'Retina' },
    { value: 3, label: '3×', desc: 'Ultra HD' },
  ];

  const estimatedW = (selectedTemplate?.width || 1000) * scale;
  const estimatedH = (selectedTemplate?.height || 1200) * scale;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-forge-surface border border-forge-border rounded-t-2xl sm:rounded-2xl shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-forge-border">
          <h2 className="font-display font-bold text-base">Export Mockup</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-forge-muted transition-colors text-forge-subtle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Format */}
          <div>
            <label className="text-xs font-semibold text-forge-subtle block mb-2.5">Format</label>
            <div className="grid grid-cols-4 gap-2">
              {formats.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`rounded-lg border py-3 flex flex-col items-center gap-1 transition-all ${
                    format === f.value
                      ? 'border-forge-accent bg-forge-accent/10 text-forge-accent'
                      : 'border-forge-border hover:border-forge-muted text-forge-subtle hover:text-forge-text'
                  }`}
                >
                  <span className="text-sm font-bold font-mono">{f.label}</span>
                  <span className="text-[9px]">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <label className="text-xs font-semibold text-forge-subtle block mb-2.5">Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {scales.map(s => (
                <button
                  key={s.value}
                  onClick={() => setScale(s.value)}
                  className={`rounded-lg border py-3 flex flex-col items-center gap-1 transition-all ${
                    scale === s.value
                      ? 'border-forge-accent bg-forge-accent/10 text-forge-accent'
                      : 'border-forge-border hover:border-forge-muted text-forge-subtle hover:text-forge-text'
                  }`}
                >
                  <span className="text-sm font-bold">{s.label}</span>
                  <span className="text-[9px]">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-forge-muted/50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-forge-subtle">Output size</p>
              <p className="text-sm font-mono font-semibold text-forge-text mt-0.5">{estimatedW} × {estimatedH}px</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-forge-subtle">Format</p>
              <p className="text-sm font-mono font-semibold text-forge-accent mt-0.5">{format.toUpperCase()}</p>
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3.5 rounded-xl bg-forge-accent hover:bg-forge-accent-dim disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-forge-accent/20"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeDasharray="30 10" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v9M5 8l3 4 3-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

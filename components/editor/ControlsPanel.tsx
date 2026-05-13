'use client';
import { useEditorStore } from '@/lib/store/editorStore';
import { BLEND_MODES } from '@/lib/fabric/helpers';

export default function ControlsPanel({ onExport, showToast }: { onExport: () => void; showToast: (m: string, t?: any) => void }) {
  const {
    selectedTemplate,
    blendMode,
    opacity,
    isDirty,
    activeProject,
    setBlendMode,
    setOpacity,
    saveActiveProject,
  } = useEditorStore();

  const handleSave = () => {
    const dataUrl = (window as any).__getCanvasDataUrl?.();
    const json = (window as any).__getCanvasJSON?.();
    const thumb = (window as any).__getCanvasThumbnail?.();
    saveActiveProject(json, thumb);
    showToast('Project saved', 'success');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-forge-border flex-shrink-0">
        <p className="text-xs font-display font-bold tracking-widest text-forge-subtle">CONTROLS</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Template Info */}
        {selectedTemplate && (
          <div className="px-4 py-3 border-b border-forge-border">
            <p className="text-xs text-forge-subtle mb-1">Template</p>
            <p className="text-sm font-semibold text-forge-text truncate">{selectedTemplate.name}</p>
            <p className="text-xs text-forge-subtle mt-0.5">{selectedTemplate.width} × {selectedTemplate.height}px</p>
          </div>
        )}

        {/* Blend Mode */}
        <div className="px-4 py-3 border-b border-forge-border">
          <label className="text-xs text-forge-subtle block mb-2 font-semibold">Blend Mode</label>
          <select
            value={blendMode}
            onChange={e => setBlendMode(e.target.value)}
            className="w-full bg-forge-muted border border-forge-border rounded text-forge-text text-sm px-3 py-2 focus:outline-none focus:border-forge-accent/50 cursor-pointer"
          >
            {BLEND_MODES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Opacity */}
        <div className="px-4 py-3 border-b border-forge-border">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-forge-subtle font-semibold">Opacity</label>
            <span className="text-xs font-mono text-forge-accent">{opacity}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Transform controls hint */}
        <div className="px-4 py-3 border-b border-forge-border">
          <label className="text-xs text-forge-subtle block mb-2 font-semibold">Transform</label>
          <div className="bg-forge-muted/50 rounded-lg p-3 text-center">
            <p className="text-forge-subtle text-xs leading-relaxed">
              Drag handles on canvas to resize & rotate. Drag image to reposition.
            </p>
          </div>
        </div>

        {/* Keyboard shortcuts */}
        <div className="px-4 py-3 border-b border-forge-border">
          <label className="text-xs text-forge-subtle block mb-2 font-semibold">Shortcuts</label>
          <div className="space-y-1.5">
            {[
              ['Del / Backspace', 'Delete selected'],
              ['Ctrl+Z', 'Undo'],
              ['Ctrl+A', 'Select all'],
            ].map(([key, desc]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-forge-subtle text-xs">{desc}</span>
                <span className="font-mono text-[10px] bg-forge-muted px-1.5 py-0.5 rounded text-forge-text">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project info */}
        {activeProject && (
          <div className="px-4 py-3 border-b border-forge-border">
            <label className="text-xs text-forge-subtle block mb-2 font-semibold">Project</label>
            <p className="text-xs text-forge-text font-medium truncate">{activeProject.name}</p>
            {isDirty && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span className="text-xs text-yellow-400">Unsaved changes</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-forge-border flex flex-col gap-2 flex-shrink-0">
        {activeProject && (
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="w-full py-2 rounded-lg border border-forge-border text-forge-text text-sm font-semibold hover:bg-forge-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V2z" stroke="currentColor" strokeWidth="1.2" />
              <rect x="4" y="8" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
              <rect x="4" y="2" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Save
          </button>
        )}
        <button
          onClick={onExport}
          disabled={!activeProject}
          className="w-full py-2.5 rounded-lg bg-forge-accent hover:bg-forge-accent-dim disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Export Mockup
        </button>
      </div>
    </div>
  );
}

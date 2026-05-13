'use client';
import { useEditorStore } from '@/lib/store/editorStore';
import type { Project } from '@/types';

export default function HistorySidebar({ onSelect }: { onSelect?: () => void }) {
  const { projects, activeProject, loadProject, deleteProject } = useEditorStore();

  if (!projects.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-forge-muted flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="4" y="4" width="12" height="12" rx="2" stroke="#6B6B7B" strokeWidth="1.5" />
            <path d="M7 10h6M10 7v6" stroke="#6B6B7B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-forge-text text-sm font-semibold">No projects yet</p>
          <p className="text-forge-subtle text-xs mt-1">Select a template to start</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 flex flex-col gap-2">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          isActive={activeProject?.id === project.id}
          onLoad={() => { loadProject(project); onSelect?.(); }}
          onDelete={() => deleteProject(project.id)}
        />
      ))}
    </div>
  );
}

function ProjectCard({
  project,
  isActive,
  onLoad,
  onDelete,
}: {
  project: Project;
  isActive: boolean;
  onLoad: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all hover:border-forge-accent/50 ${
        isActive ? 'border-forge-accent bg-forge-accent/5' : 'border-forge-border bg-forge-muted/30'
      }`}
      onClick={onLoad}
    >
      <div className="flex gap-2 p-2">
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded bg-forge-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">{getCatIcon(project.templateName)}</span>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-forge-text truncate">{project.name}</p>
          <p className="text-[10px] text-forge-subtle truncate mt-0.5">{project.templateName}</p>
          <p className="text-[10px] text-forge-subtle mt-0.5">{formatDate(project.updatedAt)}</p>
        </div>
        {/* Delete button */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-forge-subtle transition-all self-start"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {project.exported && (
        <div className="px-2 py-0.5 bg-green-500/10 border-t border-green-500/20">
          <span className="text-[9px] text-green-400 font-semibold">✓ EXPORTED</span>
        </div>
      )}
    </div>
  );
}

function getCatIcon(name: string) {
  if (name.toLowerCase().includes('shirt')) return '👕';
  if (name.toLowerCase().includes('hoodie')) return '🧥';
  if (name.toLowerCase().includes('poster')) return '🖼️';
  if (name.toLowerCase().includes('mug')) return '☕';
  if (name.toLowerCase().includes('sign')) return '🪧';
  if (name.toLowerCase().includes('tote')) return '👜';
  return '📦';
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

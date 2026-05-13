'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useEditorStore } from '@/lib/store/editorStore';
import TemplatePanel from './TemplatePanel';
import HistorySidebar from './HistorySidebar';
import CanvasEditor from './CanvasEditor';
import ControlsPanel from './ControlsPanel';
import ExportModal from './ExportModal';
import Toast from '../ui/Toast';

export default function EditorLayout() {
  const { initSession, loadProjects } = useEditorStore();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeLeftTab, setActiveLeftTab] = useState<'history' | 'templates'>('templates');

  useEffect(() => {
    initSession();
    loadProjects();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-forge-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-3 sm:px-4 h-12 border-b border-forge-border flex-shrink-0 bg-forge-surface z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => { setLeftOpen(!leftOpen); setRightOpen(false); }}
            className="md:hidden p-1.5 rounded hover:bg-forge-muted transition-colors text-forge-subtle"
            aria-label="Toggle panel"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="4" width="14" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-forge-accent flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 8L5 2L8 8H2Z" fill="white" />
              </svg>
            </div>
            <span className="font-display font-bold text-sm tracking-tight hidden sm:block">MockupForge</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setRightOpen(!rightOpen); setLeftOpen(false); }}
            className="md:hidden p-1.5 rounded hover:bg-forge-muted transition-colors text-forge-subtle"
            aria-label="Toggle controls"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 bg-forge-accent hover:bg-forge-accent-dim text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {(leftOpen || rightOpen) && (
          <div
            className="md:hidden absolute inset-0 bg-black/60 z-30"
            onClick={() => { setLeftOpen(false); setRightOpen(false); }}
          />
        )}

        {/* Left Panel */}
        <aside
          className={`
            w-64 flex-shrink-0 border-r border-forge-border bg-forge-surface flex flex-col overflow-hidden
            md:relative md:translate-x-0 md:flex
            absolute top-0 bottom-0 left-0 z-40 transition-transform duration-300
            ${leftOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Left tabs */}
          <div className="flex border-b border-forge-border flex-shrink-0">
            <button
              onClick={() => setActiveLeftTab('templates')}
              className={`flex-1 py-2.5 text-xs font-semibold font-display tracking-wide transition-colors ${activeLeftTab === 'templates' ? 'text-forge-accent border-b-2 border-forge-accent' : 'text-forge-subtle hover:text-forge-text'}`}
            >
              TEMPLATES
            </button>
            <button
              onClick={() => setActiveLeftTab('history')}
              className={`flex-1 py-2.5 text-xs font-semibold font-display tracking-wide transition-colors ${activeLeftTab === 'history' ? 'text-forge-accent border-b-2 border-forge-accent' : 'text-forge-subtle hover:text-forge-text'}`}
            >
              HISTORY
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeLeftTab === 'templates' ? (
              <TemplatePanel onSelect={() => { setLeftOpen(false); }} />
            ) : (
              <HistorySidebar onSelect={() => setLeftOpen(false)} />
            )}
          </div>
        </aside>

        {/* Canvas Center */}
        <main className="flex-1 overflow-hidden flex items-center justify-center bg-forge-bg relative">
          <CanvasEditor showToast={showToast} />
        </main>

        {/* Right Controls Panel */}
        <aside
          className={`
            w-64 flex-shrink-0 border-l border-forge-border bg-forge-surface flex flex-col overflow-y-auto
            md:relative md:translate-x-0
            absolute top-0 bottom-0 right-0 z-40 transition-transform duration-300
            ${rightOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}
        >
          <ControlsPanel onExport={() => { setShowExport(true); setRightOpen(false); }} showToast={showToast} />
        </aside>
      </div>

      {/* Export Modal */}
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} showToast={showToast} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

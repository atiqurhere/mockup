'use client';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Template, Project, Session } from '@/types';

interface EditorState {
  sessionId: string;
  activeProject: Project | null;
  projects: Project[];
  selectedTemplate: Template | null;
  blendMode: string;
  opacity: number;
  isDirty: boolean;
  isExporting: boolean;
  exportProgress: number;
  artworkDataUrl: string | null;

  initSession: () => void;
  loadProjects: () => void;
  newProject: (template: Template) => void;
  loadProject: (project: Project) => void;
  saveActiveProject: (canvasState?: object, thumbnail?: string) => void;
  deleteProject: (id: string) => void;
  setTemplate: (t: Template) => void;
  setBlendMode: (mode: string) => void;
  setOpacity: (opacity: number) => void;
  setArtwork: (dataUrl: string) => void;
  setIsDirty: (dirty: boolean) => void;
  setExporting: (exporting: boolean, progress?: number) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  sessionId: '',
  activeProject: null,
  projects: [],
  selectedTemplate: null,
  blendMode: 'multiply',
  opacity: 100,
  isDirty: false,
  isExporting: false,
  exportProgress: 0,
  artworkDataUrl: null,

  initSession: () => {
    if (typeof window === 'undefined') return;
    const { getSession } = require('@/lib/localStorage');
    const session: Session = getSession();
    set({ sessionId: session.sessionId });
  },

  loadProjects: () => {
    if (typeof window === 'undefined') return;
    const { getProjects } = require('@/lib/localStorage');
    set({ projects: getProjects() });
  },

  newProject: (template: Template) => {
    const project: Project = {
      id: uuidv4(),
      name: `${template.name} Design`,
      templateId: template.id,
      templateName: template.name,
      templatePreview: template.previewUrl,
      canvasState: undefined,
      thumbnail: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exported: false,
    };
    set({ activeProject: project, selectedTemplate: template, isDirty: false, artworkDataUrl: null });
  },

  loadProject: (project: Project) => {
    set({ activeProject: project, isDirty: false });
  },

  saveActiveProject: (canvasState?: object, thumbnail?: string) => {
    const { activeProject, selectedTemplate } = get();
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      canvasState: canvasState || activeProject.canvasState,
      thumbnail: thumbnail || activeProject.thumbnail,
      updatedAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      const { saveProject } = require('@/lib/localStorage');
      saveProject(updated);
    }
    const { loadProjects } = get();
    set({ activeProject: updated, isDirty: false });
    loadProjects();
  },

  deleteProject: (id: string) => {
    if (typeof window !== 'undefined') {
      const { deleteProject } = require('@/lib/localStorage');
      deleteProject(id);
    }
    get().loadProjects();
    if (get().activeProject?.id === id) {
      set({ activeProject: null });
    }
  },

  setTemplate: (t: Template) => set({ selectedTemplate: t }),
  setBlendMode: (mode: string) => set({ blendMode: mode, isDirty: true }),
  setOpacity: (opacity: number) => set({ opacity, isDirty: true }),
  setArtwork: (dataUrl: string) => set({ artworkDataUrl: dataUrl, isDirty: true }),
  setIsDirty: (dirty: boolean) => set({ isDirty: dirty }),
  setExporting: (exporting: boolean, progress = 0) => set({ isExporting: exporting, exportProgress: progress }),
}));

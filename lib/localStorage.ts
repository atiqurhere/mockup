import { v4 as uuidv4 } from 'uuid';
import type { Session, Project, ExportRecord } from '@/types';

const SESSION_KEY = 'mockupforge_session';
const PROJECTS_KEY = 'mockupforge_projects';
const EXPORTS_KEY = 'mockupforge_exports';

export const getSession = (): Session => {
  if (typeof window === 'undefined') return { sessionId: '', createdAt: '' };
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  const session: Session = { sessionId: uuidv4(), createdAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const getProjects = (): Project[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(PROJECTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};

export const saveProject = (project: Project): void => {
  if (typeof window === 'undefined') return;
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const deleteProject = (id: string): void => {
  if (typeof window === 'undefined') return;
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const getExports = (): ExportRecord[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(EXPORTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};

export const addExport = (record: ExportRecord): void => {
  if (typeof window === 'undefined') return;
  const exports = getExports();
  exports.unshift(record);
  localStorage.setItem(EXPORTS_KEY, JSON.stringify(exports));
};

export interface Session {
  sessionId: string;
  createdAt: string;
}

export interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  category: 'tshirt' | 'poster' | 'mug' | 'signboard' | 'hoodie' | 'tote';
  previewUrl: string;
  baseImageUrl: string;
  maskUrl?: string;
  width: number;
  height: number;
  printArea: PrintArea;
  blendMode: string;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  templatePreview: string;
  artworkDataUrl?: string;
  canvasState?: object;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  exported: boolean;
}

export interface ExportRecord {
  id: string;
  projectId: string;
  format: 'png' | 'jpg' | 'webp' | 'pdf';
  exportedAt: string;
  supabaseRecordId?: string;
}

export interface ExportRequest {
  projectLocalId: string;
  projectName: string;
  templateSlug: string;
  artworkDataUrl: string;
  canvasStateJSON: object;
  thumbnailDataUrl: string;
  format: 'png' | 'jpg' | 'webp' | 'pdf';
  scale: 1 | 2 | 3;
  sessionId: string;
}

export interface AdminExport {
  id: string;
  session_id: string;
  project_local_id: string;
  project_name: string;
  template_name: string;
  artwork_url: string;
  export_url: string;
  thumbnail_url: string;
  format: string;
  width: number;
  height: number;
  file_size: number;
  exported_at: string;
}

export interface AdminSession {
  id: string;
  user_agent: string;
  ip_hint: string;
  country: string;
  created_at: string;
  last_seen_at: string;
  export_count?: number;
}

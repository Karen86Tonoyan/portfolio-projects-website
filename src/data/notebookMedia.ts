/**
 * Materials attached to NotebookLM notebooks, keyed by notebook id.
 * Add URLs of uploaded PDF / audio / video files (e.g. Audio Overview, Video Overview exports).
 */
export interface NotebookMedia {
  pdfUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  summary?: string;
}

export const notebookMedia: Record<string, NotebookMedia> = {};

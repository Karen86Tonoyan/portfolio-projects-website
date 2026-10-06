// Local folder scanner — pure logic for the ALFA Brain knowledge-graph scanner.
// Security: works only on handles the user explicitly picks in the browser;
// no uploads, no network calls, no execution of scanned content.

export type ScanCategory =
  | 'image'
  | 'model'
  | 'document'
  | 'code'
  | 'audio'
  | 'video'
  | 'archive'
  | 'other';

export const SCAN_CATEGORY_LABELS: Record<ScanCategory, string> = {
  image: 'Zdjęcia',
  model: 'Modele AI',
  document: 'Dokumenty',
  code: 'Kod',
  audio: 'Audio',
  video: 'Wideo',
  archive: 'Archiwa',
  other: 'Inne',
};

export const SCAN_LIMITS = {
  maxEntries: 2000,
  maxDepth: 6,
} as const;

const EXT_MAP: Record<string, ScanCategory> = {
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
  svg: 'image', bmp: 'image', tiff: 'image', heic: 'image', raw: 'image',
  gguf: 'model', safetensors: 'model', onnx: 'model', pt: 'model', pth: 'model',
  h5: 'model', ckpt: 'model', tflite: 'model', mlx: 'model', weights: 'model',
  pdf: 'document', doc: 'document', docx: 'document', txt: 'document', md: 'document',
  odt: 'document', xls: 'document', xlsx: 'document', ppt: 'document', pptx: 'document',
  csv: 'document', epub: 'document', rtf: 'document',
  ts: 'code', tsx: 'code', js: 'code', jsx: 'code', py: 'code', json: 'code',
  html: 'code', css: 'code', java: 'code', c: 'code', cpp: 'code', h: 'code',
  go: 'code', rs: 'code', sh: 'code', ps1: 'code', yml: 'code', yaml: 'code',
  sql: 'code', toml: 'code', xml: 'code',
  mp3: 'audio', wav: 'audio', m4a: 'audio', flac: 'audio', ogg: 'audio',
  mp4: 'video', mkv: 'video', mov: 'video', avi: 'video', webm: 'video',
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
};

/** Lowercased extension without the dot; '' for dotfiles and names without an extension. */
export function fileExtension(name: string): string {
  const base = name.split('/').pop() ?? name;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return '';
  return base.slice(dot + 1).toLowerCase();
}

export function categorizeFile(name: string): ScanCategory {
  return EXT_MAP[fileExtension(name)] ?? 'other';
}

export interface ScanEntry {
  path: string;
  name: string;
  kind: 'file' | 'dir';
  size: number;
  category: ScanCategory | null;
  depth: number;
}

export interface ScanNode {
  id: string;
  label: string;
  kind: 'file' | 'dir' | 'root';
  category: ScanCategory | null;
  size: number;
  depth: number;
}

export interface ScanLink {
  source: string;
  target: string;
}

export interface ScanGraph {
  nodes: ScanNode[];
  links: ScanLink[];
}

const ROOT_ID = '__root__';

/** Build graph nodes/links from flat scan entries. Parent of "a/b/c" is "a/b". */
export function buildScanGraph(rootName: string, entries: ScanEntry[]): ScanGraph {
  const nodes: ScanNode[] = [
    { id: ROOT_ID, label: rootName, kind: 'root', category: null, size: 0, depth: -1 },
  ];
  const links: ScanLink[] = [];
  const seen = new Set<string>([ROOT_ID]);

  for (const entry of entries) {
    if (!entry.path || seen.has(entry.path)) continue;
    seen.add(entry.path);
    nodes.push({
      id: entry.path,
      label: entry.name,
      kind: entry.kind,
      category: entry.category,
      size: entry.size,
      depth: entry.depth,
    });
    const slash = entry.path.lastIndexOf('/');
    const parent = slash === -1 ? ROOT_ID : entry.path.slice(0, slash);
    links.push({ source: seen.has(parent) ? parent : ROOT_ID, target: entry.path });
  }
  return { nodes, links };
}

export interface ScanSummary {
  files: number;
  dirs: number;
  totalBytes: number;
  byCategory: Record<ScanCategory, number>;
}

export function summarizeScan(entries: ScanEntry[]): ScanSummary {
  const byCategory = Object.fromEntries(
    (Object.keys(SCAN_CATEGORY_LABELS) as ScanCategory[]).map(c => [c, 0]),
  ) as Record<ScanCategory, number>;
  let files = 0;
  let dirs = 0;
  let totalBytes = 0;
  for (const entry of entries) {
    if (entry.kind === 'dir') {
      dirs += 1;
    } else {
      files += 1;
      totalBytes += Number.isFinite(entry.size) && entry.size > 0 ? entry.size : 0;
      byCategory[entry.category ?? 'other'] += 1;
    }
  }
  return { files, dirs, totalBytes, byCategory };
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1).replace('.', ',')} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2).replace('.', ',')} GB`;
}

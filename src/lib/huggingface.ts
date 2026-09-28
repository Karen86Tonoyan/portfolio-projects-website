// Hugging Face public model catalog — read-only helpers.
// Security: only the public huggingface.co API, validated parameters, no keys,
// no execution of models — this is a browser-side catalog browser.

export const HF_MODELS_ENDPOINT = 'https://huggingface.co/api/models';

export const HF_SORT_OPTIONS = [
  { value: 'downloads', label: 'Pobrania' },
  { value: 'likes', label: 'Polubienia' },
  { value: 'trendingScore', label: 'Trendy' },
] as const;
export type HfSort = (typeof HF_SORT_OPTIONS)[number]['value'];

export const HF_TASK_OPTIONS = [
  { value: 'text-generation', label: 'Generowanie tekstu' },
  { value: 'text-classification', label: 'Klasyfikacja tekstu' },
  { value: 'token-classification', label: 'Rozpoznawanie encji' },
  { value: 'fill-mask', label: 'Uzupełnianie maski' },
  { value: 'question-answering', label: 'Pytania i odpowiedzi' },
  { value: 'summarization', label: 'Streszczenia' },
  { value: 'translation', label: 'Tłumaczenia' },
  { value: 'feature-extraction', label: 'Embeddingi' },
  { value: 'sentence-similarity', label: 'Podobieństwo zdań' },
  { value: 'automatic-speech-recognition', label: 'Rozpoznawanie mowy' },
  { value: 'text-to-speech', label: 'Synteza mowy' },
  { value: 'text-to-image', label: 'Generowanie obrazów' },
  { value: 'image-text-to-text', label: 'Obraz + tekst' },
] as const;
export type HfTask = (typeof HF_TASK_OPTIONS)[number]['value'];

/** Strip control characters, trim and cap search input length. */
export function sanitizeSearch(raw: string, maxLength = 80): string {
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function isHfSort(value: string): value is HfSort {
  return HF_SORT_OPTIONS.some(o => o.value === value);
}

export function isHfTask(value: string): value is HfTask {
  return HF_TASK_OPTIONS.some(o => o.value === value);
}

export interface HfQuery {
  search?: string;
  task?: string;
  sort?: string;
  limit?: number;
}

/** Build a validated URL for the public models API. Unknown values fall back to safe defaults. */
export function buildModelsUrl(query: HfQuery): string {
  const url = new URL(HF_MODELS_ENDPOINT);
  const search = sanitizeSearch(query.search ?? '');
  if (search) url.searchParams.set('search', search);
  if (query.task && isHfTask(query.task)) url.searchParams.set('pipeline_tag', query.task);
  url.searchParams.set('sort', query.sort && isHfSort(query.sort) ? query.sort : 'downloads');
  url.searchParams.set('direction', '-1');
  url.searchParams.set('limit', String(Math.min(Math.max(query.limit ?? 30, 1), 100)));
  return url.toString();
}

export interface HfModel {
  id: string;
  author: string;
  pipelineTag: string | null;
  library: string | null;
  downloads: number;
  likes: number;
  tags: string[];
  lastModified: string | null;
}

const HF_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)?$/;

/** Normalize one API entry; returns null for malformed rows instead of throwing. */
export function normalizeModel(raw: unknown): HfModel | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const id =
    typeof r.id === 'string' ? r.id : typeof r.modelId === 'string' ? r.modelId : '';
  if (!id || id.length > 250 || !HF_ID_RE.test(id)) return null;
  const num = (v: unknown) =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
  return {
    id,
    author: id.includes('/') ? id.split('/')[0] : '—',
    pipelineTag: typeof r.pipeline_tag === 'string' ? r.pipeline_tag : null,
    library: typeof r.library_name === 'string' ? r.library_name : null,
    downloads: num(r.downloads),
    likes: num(r.likes),
    tags: Array.isArray(r.tags)
      ? r.tags.filter((t): t is string => typeof t === 'string').slice(0, 6)
      : [],
    lastModified: typeof r.lastModified === 'string' && !Number.isNaN(Date.parse(r.lastModified))
      ? r.lastModified
      : null,
  };
}

/** Normalize a full API response, deduplicating by id and capping the list. */
export function normalizeModels(raw: unknown, cap = 60): HfModel[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: HfModel[] = [];
  for (const entry of raw) {
    const model = normalizeModel(entry);
    if (model && !seen.has(model.id)) {
      seen.add(model.id);
      out.push(model);
    }
    if (out.length >= cap) break;
  }
  return out;
}

/** Safe link to a model page; null when the id does not match the expected shape. */
export function modelPageUrl(id: string): string | null {
  return HF_ID_RE.test(id) ? `https://huggingface.co/${id}` : null;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} mln`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')} tys.`;
  return String(n);
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('pl-PL');
}

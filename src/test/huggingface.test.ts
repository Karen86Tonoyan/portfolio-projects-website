import { describe, it, expect } from 'vitest';
import {
  sanitizeSearch,
  buildModelsUrl,
  normalizeModel,
  normalizeModels,
  modelPageUrl,
  formatCount,
  isHfSort,
  isHfTask,
} from '@/lib/huggingface';

describe('sanitizeSearch', () => {
  it('removes control characters and trims', () => {
    expect(sanitizeSearch('  qwen\u0007\ninstruct ')).toBe('qweninstruct');
  });

  it('caps length', () => {
    expect(sanitizeSearch('a'.repeat(120)).length).toBe(80);
  });
});

describe('buildModelsUrl', () => {
  it('falls back to safe defaults for unknown values', () => {
    const url = new URL(buildModelsUrl({ search: 'bert', task: 'DROP TABLE', sort: 'hacks', limit: 9999 }));
    expect(url.origin + url.pathname).toBe('https://huggingface.co/api/models');
    expect(url.searchParams.get('search')).toBe('bert');
    expect(url.searchParams.has('pipeline_tag')).toBe(false);
    expect(url.searchParams.get('sort')).toBe('downloads');
    expect(Number(url.searchParams.get('limit'))).toBeLessThanOrEqual(100);
    expect(url.searchParams.get('direction')).toBe('-1');
  });

  it('accepts whitelisted task and sort', () => {
    const url = new URL(buildModelsUrl({ task: 'text-generation', sort: 'likes' }));
    expect(url.searchParams.get('pipeline_tag')).toBe('text-generation');
    expect(url.searchParams.get('sort')).toBe('likes');
  });

  it('omits empty search', () => {
    expect(new URL(buildModelsUrl({ search: '   ' })).searchParams.has('search')).toBe(false);
  });
});

describe('isHfSort / isHfTask', () => {
  it('whitelists correctly', () => {
    expect(isHfSort('likes')).toBe(true);
    expect(isHfSort('exec')).toBe(false);
    expect(isHfTask('fill-mask')).toBe(true);
    expect(isHfTask('javascript:alert(1)')).toBe(false);
  });
});

describe('normalizeModel', () => {
  it('maps a valid entry', () => {
    const m = normalizeModel({
      id: 'org/model',
      pipeline_tag: 'text-generation',
      library_name: 'transformers',
      downloads: 1234.9,
      likes: -5,
      tags: ['a', 42, 'b'],
      lastModified: '2026-01-02T00:00:00Z',
    });
    expect(m).not.toBeNull();
    expect(m!.author).toBe('org');
    expect(m!.downloads).toBe(1234);
    expect(m!.likes).toBe(0);
    expect(m!.tags).toEqual(['a', 'b']);
  });

  it('rejects malformed entries and unsafe ids', () => {
    expect(normalizeModel(null)).toBeNull();
    expect(normalizeModel({ id: 42 })).toBeNull();
    expect(normalizeModel({ id: 'bad id<script>' })).toBeNull();
    expect(normalizeModel({})).toBeNull();
  });
});

describe('normalizeModels', () => {
  it('deduplicates, filters bad rows and caps', () => {
    const out = normalizeModels(
      [{ id: 'a/b' }, { id: 'a/b' }, { id: 'bad x' }, 'junk', { id: 'c' }],
      1,
    );
    expect(out.map(m => m.id)).toEqual(['a/b']);
  });

  it('returns empty for non-array responses', () => {
    expect(normalizeModels({ error: 'x' })).toEqual([]);
  });
});

describe('modelPageUrl', () => {
  it('builds links for valid ids and rejects others', () => {
    expect(modelPageUrl('Qwen/Qwen3-0.6B')).toBe('https://huggingface.co/Qwen/Qwen3-0.6B');
    expect(modelPageUrl('evil?x=1')).toBeNull();
    expect(modelPageUrl('a//b')).toBeNull();
  });
});

describe('formatCount', () => {
  it('formats in Polish', () => {
    expect(formatCount(59333)).toBe('59,3 tys.');
    expect(formatCount(2_500_000)).toBe('2,5 mln');
    expect(formatCount(42)).toBe('42');
  });
});

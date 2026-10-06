import { describe, it, expect } from 'vitest';
import {
  categorizeFile,
  fileExtension,
  buildScanGraph,
  summarizeScan,
  formatBytes,
  type ScanEntry,
} from '@/lib/localScanner';

describe('fileExtension', () => {
  it('extracts lowercased extensions', () => {
    expect(fileExtension('Photo.JPG')).toBe('jpg');
    expect(fileExtension('model.GGUF')).toBe('gguf');
  });

  it('returns empty for dotfiles and extensionless names', () => {
    expect(fileExtension('.gitignore')).toBe('');
    expect(fileExtension('README')).toBe('');
  });
});

describe('categorizeFile', () => {
  it('maps known extensions', () => {
    expect(categorizeFile('a.png')).toBe('image');
    expect(categorizeFile('llama.gguf')).toBe('model');
    expect(categorizeFile('raport.pdf')).toBe('document');
    expect(categorizeFile('skrypt.ps1')).toBe('code');
    expect(categorizeFile('film.mp4')).toBe('video');
    expect(categorizeFile('paczka.zip')).toBe('archive');
    expect(categorizeFile('dziwny.xyz')).toBe('other');
  });
});

describe('buildScanGraph', () => {
  const entries: ScanEntry[] = [
    { path: 'docs', name: 'docs', kind: 'dir', size: 0, category: null, depth: 0 },
    { path: 'docs/a.pdf', name: 'a.pdf', kind: 'file', size: 10, category: 'document', depth: 1 },
    { path: 'model.gguf', name: 'model.gguf', kind: 'file', size: 20, category: 'model', depth: 0 },
  ];

  it('creates a root node and parent links', () => {
    const g = buildScanGraph('moj-folder', entries);
    expect(g.nodes[0]).toMatchObject({ label: 'moj-folder', kind: 'root' });
    expect(g.nodes).toHaveLength(4);
    expect(g.links).toContainEqual({ source: '__root__', target: 'docs' });
    expect(g.links).toContainEqual({ source: 'docs', target: 'docs/a.pdf' });
    expect(g.links).toContainEqual({ source: '__root__', target: 'model.gguf' });
  });

  it('deduplicates paths and links orphans to the root', () => {
    const g = buildScanGraph('r', [
      ...entries,
      { ...entries[0] },
      { path: 'brak/rodzica.txt', name: 'rodzica.txt', kind: 'file', size: 1, category: 'document', depth: 1 },
    ]);
    expect(g.nodes.filter(n => n.id === 'docs')).toHaveLength(1);
    expect(g.links).toContainEqual({ source: '__root__', target: 'brak/rodzica.txt' });
  });
});

describe('summarizeScan', () => {
  it('counts files, dirs, bytes and categories', () => {
    const s = summarizeScan([
      { path: 'd', name: 'd', kind: 'dir', size: 0, category: null, depth: 0 },
      { path: 'a.png', name: 'a.png', kind: 'file', size: 100, category: 'image', depth: 0 },
      { path: 'b.png', name: 'b.png', kind: 'file', size: 200, category: 'image', depth: 0 },
      { path: 'c.gguf', name: 'c.gguf', kind: 'file', size: -5, category: 'model', depth: 0 },
    ]);
    expect(s.files).toBe(3);
    expect(s.dirs).toBe(1);
    expect(s.totalBytes).toBe(300);
    expect(s.byCategory.image).toBe(2);
    expect(s.byCategory.model).toBe(1);
  });
});

describe('formatBytes', () => {
  it('formats Polish units', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2,0 KB');
    expect(formatBytes(5 * 1024 ** 2)).toBe('5,0 MB');
    expect(formatBytes(NaN)).toBe('0 B');
  });
});

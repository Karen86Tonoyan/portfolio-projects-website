import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FolderSearch, StopCircle, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LocalScanGraph from '@/components/LocalScanGraph';
import {
  buildScanGraph,
  categorizeFile,
  formatBytes,
  summarizeScan,
  SCAN_CATEGORY_LABELS,
  SCAN_LIMITS,
  type ScanCategory,
  type ScanEntry,
  type ScanNode,
} from '@/lib/localScanner';

// Minimal File System Access API typing (not in the default TS DOM lib).
interface FsFileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
}
interface FsDirHandle {
  kind: 'directory';
  name: string;
  values(): AsyncIterableIterator<FsFileHandle | FsDirHandle>;
}
declare global {
  interface Window {
    showDirectoryPicker?: (opts?: { mode?: 'read' | 'readwrite' }) => Promise<FsDirHandle>;
  }
}

const LocalFileScanner: React.FC = () => {
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [rootName, setRootName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [category, setCategory] = useState<'all' | ScanCategory>('all');
  const [selected, setSelected] = useState<ScanNode | null>(null);
  const abortRef = useRef(false);

  const summary = useMemo(() => summarizeScan(entries), [entries]);

  const graph = useMemo(() => {
    const filtered =
      category === 'all'
        ? entries
        : entries.filter(e => e.kind === 'dir' || e.category === category);
    return buildScanGraph(rootName, filtered);
  }, [entries, rootName, category]);

  const walk = useCallback(async (dir: FsDirHandle, prefix: string, depth: number, out: ScanEntry[]) => {
    if (abortRef.current || out.length >= SCAN_LIMITS.maxEntries) return;
    for await (const handle of dir.values()) {
      if (abortRef.current || out.length >= SCAN_LIMITS.maxEntries) return;
      if (handle.name.startsWith('.')) continue;
      const path = prefix ? `${prefix}/${handle.name}` : handle.name;
      if (handle.kind === 'directory') {
        out.push({ path, name: handle.name, kind: 'dir', size: 0, category: null, depth });
        if (depth + 1 <= SCAN_LIMITS.maxDepth) {
          await walk(handle, path, depth + 1, out);
        }
      } else {
        let size = 0;
        try {
          size = (await handle.getFile()).size;
        } catch {
          // Niektóre pliki mogą być nieczytelne — pomijamy rozmiar, zostaje nazwa.
        }
        out.push({ path, name: handle.name, kind: 'file', size, category: categorizeFile(handle.name), depth });
      }
      if (out.length % 100 === 0) setProgress(out.length);
    }
  }, []);

  const startScan = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      setUnsupported(true);
      return;
    }
    setScanning(true);
    setError(null);
    setUnsupported(false);
    setEntries([]);
    setSelected(null);
    setProgress(0);
    setTruncated(false);
    abortRef.current = false;
    try {
      const dir = await window.showDirectoryPicker({ mode: 'read' });
      setRootName(dir.name);
      const out: ScanEntry[] = [];
      await walk(dir, '', 0, out);
      if (out.length >= SCAN_LIMITS.maxEntries) setTruncated(true);
      setEntries(out);
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') {
        setError('Nie udało się odczytać folderu. Sprawdź uprawnienia i spróbuj ponownie.');
      }
    } finally {
      setScanning(false);
    }
  }, [walk]);

  const stopScan = useCallback(() => {
    abortRef.current = true;
  }, []);

  return (
    <section className="border-b border-border bg-card/40">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs uppercase text-primary">
          <FolderSearch className="h-4 w-4" />
          <span>Skaner lokalny</span>
          <span className="text-muted-foreground">/</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground normal-case">
            <Lock className="h-3 w-3" /> Pliki nie opuszczają tej przeglądarki
          </span>
        </div>
        <h2 className="text-2xl font-semibold">Skaner plików w grafie wiedzy</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Wybierz folder na swoim komputerze — skaner odczyta nazwy, typy i rozmiary plików
          (zdjęcia, modele AI, dokumenty, kod) i narysuje je jako graf. Nic nie jest wysyłane
          ani zapisywane poza tą kartą przeglądarki.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={startScan} disabled={scanning}>
            <FolderSearch className="h-4 w-4 mr-1" />
            {scanning ? `Skanowanie… ${progress}` : 'Wybierz folder i skanuj'}
          </Button>
          {scanning && (
            <Button variant="outline" onClick={stopScan}>
              <StopCircle className="h-4 w-4 mr-1" /> Zatrzymaj
            </Button>
          )}
          {entries.length > 0 && !scanning && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{summary.dirs} folderów</Badge>
              <Badge variant="secondary">{summary.files} plików</Badge>
              <Badge variant="secondary">{formatBytes(summary.totalBytes)}</Badge>
            </div>
          )}
        </div>

        {unsupported && (
          <div className="mt-4 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            Ta przeglądarka nie obsługuje wyboru folderu. Użyj Chrome, Edge lub innej przeglądarki
            opartej na Chromium.
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
          </div>
        )}
        {truncated && (
          <p className="mt-3 text-xs text-muted-foreground">
            Skan ograniczony do {SCAN_LIMITS.maxEntries} pozycji i głębokości {SCAN_LIMITS.maxDepth} —
            pokazano początkową część folderu.
          </p>
        )}

        {entries.length > 0 && (
          <>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Filtr kategorii plików">
              <Button size="sm" variant={category === 'all' ? 'default' : 'outline'} onClick={() => setCategory('all')}>
                Wszystkie
              </Button>
              {(Object.keys(SCAN_CATEGORY_LABELS) as ScanCategory[])
                .filter(c => summary.byCategory[c] > 0)
                .map(c => (
                  <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'} onClick={() => setCategory(c)}>
                    {SCAN_CATEGORY_LABELS[c]} <span className="ml-1 opacity-60">{summary.byCategory[c]}</span>
                  </Button>
                ))}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="overflow-hidden rounded-md border border-border bg-card alfa-grid-surface">
                <LocalScanGraph graph={graph} selectedId={selected?.id ?? null} onSelect={setSelected} />
              </div>
              <aside className="rounded-md border border-border bg-card p-4">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Wybrany element</p>
                {selected ? (
                  <>
                    <h3 className="mt-1 break-all text-lg font-semibold text-primary">{selected.label}</h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Typ</dt>
                        <dd>{selected.kind === 'dir' ? 'Folder' : selected.kind === 'root' ? 'Folder główny' : 'Plik'}</dd>
                      </div>
                      {selected.category && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Kategoria</dt>
                          <dd>{SCAN_CATEGORY_LABELS[selected.category]}</dd>
                        </div>
                      )}
                      {selected.kind === 'file' && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Rozmiar</dt>
                          <dd className="font-mono">{formatBytes(selected.size)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Ścieżka</dt>
                        <dd className="break-all text-right font-mono text-xs">{selected.id}</dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Kliknij węzeł grafu, aby zobaczyć szczegóły pliku lub folderu.
                  </p>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default LocalFileScanner;

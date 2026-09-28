import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ExternalLink, Search, RefreshCw, AlertTriangle, Download, Heart } from 'lucide-react';
import {
  buildModelsUrl,
  normalizeModels,
  modelPageUrl,
  formatCount,
  formatDate,
  HF_SORT_OPTIONS,
  HF_TASK_OPTIONS,
  type HfModel,
} from '@/lib/huggingface';

type Status = 'loading' | 'ready' | 'error';

const HuggingFaceModels: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [task, setTask] = useState('');
  const [sort, setSort] = useState<string>('downloads');
  const [models, setModels] = useState<HfModel[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 12000);

    setStatus('loading');
    setError(null);

    fetch(buildModelsUrl({ search: debounced, task, sort, limit: 30 }), {
      signal: controller.signal,
    })
      .then(async res => {
        if (!res.ok) throw new Error(`Hugging Face odpowiedziało kodem ${res.status}`);
        const data: unknown = await res.json();
        setModels(normalizeModels(data));
        setStatus('ready');
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted && !timedOut) return; // superseded by a newer query
        setError(
          timedOut
            ? 'Przekroczono czas połączenia z Hugging Face.'
            : e instanceof Error
              ? e.message
              : 'Nieznany błąd połączenia.',
        );
        setStatus('error');
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [debounced, task, sort, retryNonce]);

  const taskLabel = useMemo<Map<string, string>>(
    () => new Map<string, string>(HF_TASK_OPTIONS.map(o => [o.value, o.label])),
    [],
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Modele Hugging Face</h1>
        <p className="text-muted-foreground mb-2">
          Przegląd publicznego katalogu modeli AI — wyszukiwanie, filtrowanie po zadaniu i linki do stron modeli.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          Tylko podgląd katalogu publicznego API Hugging Face — strona nie uruchamia modeli ani nie pobiera plików.
        </p>

        <div className="mb-4 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj modelu, np. security, qwen, bert…"
            className="pl-9"
            maxLength={80}
            aria-label="Szukaj modelu"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm text-muted-foreground mr-1">Zadanie:</span>
          <select
            value={task}
            onChange={e => setTask(e.target.value)}
            aria-label="Filtr zadania modelu"
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="">Wszystkie</option>
            {HF_TASK_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground ml-3 mr-1">Sortuj:</span>
          {HF_SORT_OPTIONS.map(o => (
            <Button
              key={o.value}
              size="sm"
              variant={sort === o.value ? 'default' : 'outline'}
              onClick={() => setSort(o.value)}
            >
              {o.label}
            </Button>
          ))}
        </div>

        {status === 'error' && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
            <div className="flex items-start gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Nie udało się pobrać listy modeli.</p>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-sm mt-1 text-muted-foreground">
                  Sprawdź połączenie z internetem i spróbuj ponownie.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setRetryNonce(n => n + 1)}>
              <RefreshCw className="h-4 w-4 mr-1" /> Spróbuj ponownie
            </Button>
          </div>
        )}

        {status === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-live="polite" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-5 w-3/4 rounded bg-muted" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {status === 'ready' && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Znaleziono {models.length} {models.length === 1 ? 'model' : 'modeli'}.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map(m => {
                const link = modelPageUrl(m.id);
                return (
                  <Card key={m.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {m.pipelineTag && (
                          <Badge variant="secondary">{taskLabel.get(m.pipelineTag) ?? m.pipelineTag}</Badge>
                        )}
                        {m.library && <Badge variant="outline">{m.library}</Badge>}
                      </div>
                      <CardTitle className="text-base leading-snug break-all">
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {m.id}
                          </a>
                        ) : (
                          m.id
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">Autor: {m.author}</p>
                    </CardHeader>
                    <CardContent className="mt-auto space-y-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Download className="h-3.5 w-3.5" /> {formatCount(m.downloads)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" /> {formatCount(m.likes)}
                        </span>
                        {m.lastModified && <span>zm. {formatDate(m.lastModified)}</span>}
                      </div>
                      {m.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {m.tags.map(t => (
                            <span key={t} className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {link && (
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-1" /> Otwórz na Hugging Face
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {models.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                Brak wyników dla tej frazy — spróbuj innej nazwy modelu.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HuggingFaceModels;

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ExternalLink, Focus, GitBranch, Maximize2, Minus, Pause, Play, Plus, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import AlfaBrainGraph, { type AlfaBrainGraphHandle } from '@/components/AlfaBrainGraph';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  alfaBrainLinks,
  alfaBrainNodes,
  alfaNodeTypes,
  alfaRepositoryUrl,
  type AlfaBrainNode,
  type AlfaNodeType,
} from '@/data/alfaBrainGraph';

const stats = [
  { value: '754', label: 'umiejętności' },
  { value: '26', label: 'domen' },
  { value: '5', label: 'frameworków' },
  { value: 'Apache 2.0', label: 'licencja' },
];

const statusLabels: Record<AlfaBrainNode['status'], string> = {
  active: 'Aktywny',
  protected: 'Chroniony',
  observed: 'Monitorowany',
};

const AlfaBrain: React.FC = () => {
  const graphRef = useRef<AlfaBrainGraphHandle>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | AlfaNodeType>('all');
  const [showLabels, setShowLabels] = useState(true);
  const [paused, setPaused] = useState(false);
  const [selectedNode, setSelectedNode] = useState<AlfaBrainNode>(alfaBrainNodes[0]);

  const handleSelect = useCallback((node: AlfaBrainNode) => setSelectedNode(node), []);
  const relationCount = useMemo(() => alfaBrainLinks.filter((link) => link.source === selectedNode.id || link.target === selectedNode.id).length, [selectedNode.id]);
  const hasResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pl');
    return alfaBrainNodes.some((node) => (filter === 'all' || node.type === filter) && (!normalized || `${node.label} ${node.description}`.toLocaleLowerCase('pl').includes(normalized)));
  }, [filter, query]);

  const resetView = () => {
    setQuery('');
    setFilter('all');
    setPaused(false);
    setSelectedNode(alfaBrainNodes[0]);
    window.setTimeout(() => graphRef.current?.reset(), 50);
  };

  return (
    <div className="alfa-brain-theme min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <div className="border-b border-border bg-card/70">
        <div className="container mx-auto flex flex-col gap-5 px-4 py-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="animate-fade-in">
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs uppercase text-primary">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary pulse" /> System online</span>
              <span className="text-muted-foreground">/</span>
              <span>Knowledge topology v1.0</span>
            </div>
            <h1 className="text-3xl font-bold md:text-5xl">ALFA Brain</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Interaktywna mapa warstw bezpieczeństwa, pamięci i umiejętności agentów.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-28 bg-card px-4 py-3">
                <div className="font-mono text-lg font-semibold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="relative min-w-0 overflow-hidden rounded-md border border-border bg-card alfa-grid-surface" aria-label="Graf ALFA Brain">
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-md border border-border bg-card/90 p-1 backdrop-blur">
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Powiększ graf" onClick={() => graphRef.current?.zoomIn()}><Plus /></Button></TooltipTrigger><TooltipContent>Powiększ</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Pomniejsz graf" onClick={() => graphRef.current?.zoomOut()}><Minus /></Button></TooltipTrigger><TooltipContent>Pomniejsz</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Wycentruj graf" onClick={() => graphRef.current?.center()}><Focus /></Button></TooltipTrigger><TooltipContent>Wycentruj</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Zresetuj układ grafu" onClick={() => graphRef.current?.reset()}><RotateCcw /></Button></TooltipTrigger><TooltipContent>Resetuj układ</TooltipContent></Tooltip>
            </div>
            {!hasResults && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 p-6 text-center backdrop-blur-sm">
                <div><Search className="mx-auto mb-3 h-7 w-7 text-primary" /><p className="font-medium">Brak pasujących węzłów</p><p className="mt-1 text-sm text-muted-foreground">Zmień frazę albo wybierz inną kategorię.</p></div>
              </div>
            )}
            <AlfaBrainGraph
              ref={graphRef}
              nodes={alfaBrainNodes}
              links={alfaBrainLinks}
              query={query}
              filter={filter}
              showLabels={showLabels}
              paused={paused}
              selectedId={selectedNode.id}
              onSelect={handleSelect}
            />
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-border bg-card/90 px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground backdrop-blur">
              Przeciągnij węzeł · kółko myszy powiększa · przeciągnij tło
            </div>
          </section>

          <aside className="space-y-4" aria-label="Panel sterowania ALFA Brain">
            <section className="rounded-md border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <div><p className="font-mono text-xs uppercase text-primary">Control panel</p><h2 className="mt-1 text-xl font-semibold">Sterowanie</h2></div>
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj węzła…" aria-label="Szukaj węzła" className="pl-9 font-mono" />
              </div>
              <div className="mb-5 flex flex-wrap gap-2" aria-label="Filtr typu węzła">
                {alfaNodeTypes.map((type) => (
                  <Button key={type.value} variant={filter === type.value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(type.value)}>{type.label}</Button>
                ))}
              </div>
              <div className="space-y-3 border-t border-border pt-4">
                <label className="flex items-center justify-between gap-3 text-sm"><span>Pokaż etykiety</span><Switch checked={showLabels} onCheckedChange={setShowLabels} aria-label="Pokaż etykiety węzłów" /></label>
                <label className="flex items-center justify-between gap-3 text-sm"><span>Symulacja układu</span><Switch checked={!paused} onCheckedChange={(checked) => setPaused(!checked)} aria-label="Włącz symulację układu" /></label>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setPaused((value) => !value)}>{paused ? <Play /> : <Pause />}{paused ? 'Wznów' : 'Pauza'}</Button>
                <Button variant="outline" onClick={resetView}><RotateCcw />Reset</Button>
              </div>
            </section>

            <section className="rounded-md border border-primary/30 bg-card p-4 animate-fade-in" key={selectedNode.id}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-mono text-[10px] uppercase text-muted-foreground">Wybrany węzeł</p><h2 className="mt-1 text-xl font-semibold text-primary">{selectedNode.label}</h2></div>
                <Badge variant="outline" className="border-primary/40 text-primary">{statusLabels[selectedNode.status]}</Badge>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{selectedNode.description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
                <div><dt className="text-xs text-muted-foreground">Typ</dt><dd className="mt-1 capitalize">{selectedNode.type}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Relacje</dt><dd className="mt-1 font-mono text-primary">{relationCount}</dd></div>
                {selectedNode.skills && <div><dt className="text-xs text-muted-foreground">Umiejętności</dt><dd className="mt-1 font-mono text-primary">{selectedNode.skills}</dd></div>}
                <div className={selectedNode.skills ? '' : 'col-span-2'}><dt className="text-xs text-muted-foreground">Źródło</dt><dd className="mt-1 break-all font-mono text-xs">{selectedNode.source}</dd></div>
              </dl>
              <Button asChild variant="outline" className="mt-4 w-full">
                <a href={alfaRepositoryUrl} target="_blank" rel="noopener noreferrer"><GitBranch />Otwórz repozytorium<ExternalLink /></a>
              </Button>
            </section>

            <section className="rounded-md border border-border bg-card p-4">
              <h2 className="font-mono text-xs uppercase text-muted-foreground">Legenda</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-primary" /> Chroniony</span>
                <span className="flex items-center gap-2"><i className="alfa-legend-safe h-2.5 w-2.5 rounded-full" /> Aktywny</span>
                <span className="flex items-center gap-2"><i className="alfa-legend-watch h-2.5 w-2.5 rounded-full" /> Monitorowany</span>
                <span className="flex items-center gap-2"><Maximize2 className="h-3 w-3" /> D3 force graph</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AlfaBrain;
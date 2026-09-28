import { useEffect, useMemo, useRef, useState } from 'react';
import { Ban, CheckCircle2, CircleDot, Database, Eye, FileClock, Pencil, Play, Plus, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { simulationScenarios, type SimulationScenario, type SimulationStep } from '@/data/alfaSimulation';
import ScenarioEditorDialog from '@/components/ScenarioEditorDialog';
import { MAX_CUSTOM_SCENARIOS, createEmptyScenario, isCustomScenario, loadCustomScenarios, saveCustomScenarios } from '@/lib/customScenarios';

interface AuditEntry extends SimulationStep {
  id: string;
  runId: string;
  timestamp: string;
  sequence: number;
}

const STEP_DELAY_MS = 650;

const verdictLabels = { pass: 'PASS', hold: 'HOLD', blocked: 'BLOCK' } as const;

const GoldenOrbPanel = () => {
  const [scenarioId, setScenarioId] = useState(simulationScenarios[0].id);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string>();
  const [customScenarios, setCustomScenarios] = useState<SimulationScenario[]>(() => loadCustomScenarios());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<SimulationScenario | null>(null);
  const timerRef = useRef<number>();

  const allScenarios = useMemo(() => [...simulationScenarios, ...customScenarios], [customScenarios]);
  const scenario = useMemo(
    () => allScenarios.find((item) => item.id === scenarioId) ?? simulationScenarios[0],
    [scenarioId, allScenarios],
  );
  const selectedEntry = auditEntries.find((entry) => entry.id === selectedEntryId) ?? auditEntries[0];
  const isCustom = isCustomScenario(scenario.id);

  const persist = (next: SimulationScenario[]) => {
    if (!saveCustomScenarios(next)) {
      toast.error('Nie udało się zapisać w przeglądarce (brak miejsca lub blokada pamięci).');
      return false;
    }
    setCustomScenarios(next);
    return true;
  };

  const openNew = () => {
    if (customScenarios.length >= MAX_CUSTOM_SCENARIOS) {
      toast.error(`Limit ${MAX_CUSTOM_SCENARIOS} własnych scenariuszy. Usuń któryś, aby dodać nowy.`);
      return;
    }
    setEditing(createEmptyScenario());
    setEditorOpen(true);
  };

  const openEdit = () => {
    setEditing(structuredClone(scenario));
    setEditorOpen(true);
  };

  const handleSave = (saved: SimulationScenario) => {
    const exists = customScenarios.some((item) => item.id === saved.id);
    const next = exists ? customScenarios.map((item) => (item.id === saved.id ? saved : item)) : [...customScenarios, saved];
    if (!persist(next)) return;
    setEditorOpen(false);
    setScenarioId(saved.id);
    setActiveIndex(-1);
    toast.success('Scenariusz zapisany — możesz go uruchomić w dowolnym momencie.');
  };

  const handleDelete = () => {
    if (!isCustom || !window.confirm(`Usunąć scenariusz „${scenario.label}”?`)) return;
    if (!persist(customScenarios.filter((item) => item.id !== scenario.id))) return;
    setScenarioId(simulationScenarios[0].id);
    setActiveIndex(-1);
    toast.success('Scenariusz usunięty.');
  };


  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const runSimulation = () => {
    if (running) return;
    const runId = `SIM-${Date.now().toString(36).toUpperCase()}`;
    setRunning(true);
    setActiveIndex(0);
    setSelectedEntryId(undefined);

    const processStep = (index: number) => {
      const step = scenario.steps[index];
      if (!step) {
        setRunning(false);
        setActiveIndex(scenario.steps.length);
        toast.success('Symulacja zakończona bez wywołań zewnętrznych.');
        return;
      }
      const entry: AuditEntry = {
        ...step,
        id: `${runId}-${index}`,
        runId,
        sequence: index + 1,
        timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setAuditEntries((previous) => [entry, ...previous]);
      setSelectedEntryId(entry.id);
      setActiveIndex(index + 1);
      timerRef.current = window.setTimeout(() => processStep(index + 1), STEP_DELAY_MS);
    };

    timerRef.current = window.setTimeout(() => processStep(0), STEP_DELAY_MS);
  };

  const clearAudit = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setRunning(false);
    setActiveIndex(-1);
    setAuditEntries([]);
    setSelectedEntryId(undefined);
    toast.success('Lokalny dziennik symulacji został wyczyszczony.');
  };

  return (
    <section className="mb-5 border-y border-border bg-card/40" aria-labelledby="golden-orb-title">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-primary">Golden Orb Panel</p>
            <h2 id="golden-orb-title" className="mt-1 text-2xl font-semibold">Symulacja i audyt przepływu</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Przetwarzanie działa wyłącznie w przeglądarce na danych demonstracyjnych. Nie uruchamia agentów, n8n ani innych akcji zewnętrznych.</p>
          </div>
          <Badge variant="outline" className="w-fit gap-2 border-primary/40 text-primary"><ShieldAlert className="h-4 w-4" />Tryb izolowany</Badge>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={scenarioId} onValueChange={(value) => { setScenarioId(value); setActiveIndex(-1); }} disabled={running}>
                <SelectTrigger aria-label="Wybierz scenariusz symulacji" className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>{simulationScenarios.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={runSimulation} disabled={running}><Play />{running ? 'Symulacja trwa…' : 'Uruchom symulację'}</Button>
            </div>

            <div className="mt-5 border-l-2 border-primary/30 pl-4">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Przykładowe żądanie</p>
              <p className="mt-2 text-sm leading-relaxed">{scenario.request}</p>
            </div>

            <div className="mt-6 space-y-2" aria-live="polite" aria-label="Etapy symulacji">
              {scenario.steps.map((step, index) => {
                const complete = activeIndex > index;
                const active = running && activeIndex === index;
                return (
                  <button
                    key={step.node}
                    type="button"
                    disabled={!complete}
                    onClick={() => {
                      const entry = auditEntries.find((item) => item.runId === auditEntries[0]?.runId && item.sequence === index + 1);
                      if (entry) setSelectedEntryId(entry.id);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 border border-border bg-background p-3 text-left transition-colors disabled:cursor-default',
                      complete && 'hover:border-primary/50',
                      active && 'border-primary/60',
                    )}
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border', complete && 'border-primary bg-primary text-primary-foreground')}>
                      {complete ? <CheckCircle2 className="h-4 w-4" /> : <CircleDot className={cn('h-4 w-4', active && 'animate-pulse text-primary')} />}
                    </span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{step.label}</span><span className="block truncate text-xs text-muted-foreground">{complete ? step.action : active ? 'Analiza danych…' : 'Oczekuje'}</span></span>
                    {complete && <Badge variant="outline" className={cn(step.verdict === 'blocked' && 'border-destructive/40 text-destructive', step.verdict === 'hold' && 'border-primary/40 text-primary')}>{verdictLabels[step.verdict]}</Badge>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-border bg-card p-4 sm:p-5">
            <Tabs defaultValue="audit">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="grid w-full grid-cols-2 sm:w-72"><TabsTrigger value="audit"><FileClock className="mr-2 h-4 w-4" />Dziennik</TabsTrigger><TabsTrigger value="details"><Eye className="mr-2 h-4 w-4" />Wynik węzła</TabsTrigger></TabsList>
                <Button variant="ghost" size="sm" onClick={clearAudit} disabled={!auditEntries.length && !running}><RotateCcw />Wyczyść</Button>
              </div>

              <TabsContent value="audit" className="mt-4">
                <ScrollArea className="h-[420px] border border-border bg-background">
                  {auditEntries.length ? (
                    <ol className="divide-y divide-border">
                      {auditEntries.map((entry) => (
                        <li key={entry.id}>
                          <button type="button" onClick={() => setSelectedEntryId(entry.id)} className={cn('w-full p-4 text-left transition-colors hover:bg-muted/50', selectedEntry?.id === entry.id && 'bg-muted/60')}>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">{entry.timestamp}</span>
                              <Badge variant="outline">{entry.label}</Badge>
                              <Badge variant="outline" className={cn(entry.verdict === 'blocked' && 'border-destructive/40 text-destructive', entry.verdict === 'hold' && 'border-primary/40 text-primary')}>{verdictLabels[entry.verdict]}</Badge>
                            </div>
                            <p className="mt-2 text-sm font-medium">{entry.action}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">Dane: {entry.input}</p>
                            <p className="mt-2 font-mono text-[10px] text-muted-foreground">{entry.runId} · krok {entry.sequence}/5 · LOCAL_SIMULATION</p>
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="flex h-[420px] flex-col items-center justify-center p-8 text-center"><Database className="mb-3 h-7 w-7 text-primary" /><p className="font-medium">Brak wpisów audytowych</p><p className="mt-1 max-w-xs text-sm text-muted-foreground">Uruchom scenariusz, aby zobaczyć dane wejściowe, werdykty i symulowane akcje.</p></div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                {selectedEntry ? (
                  <div className="space-y-4 border border-border bg-background p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase text-muted-foreground">{selectedEntry.runId}</p><h3 className="mt-1 text-xl font-semibold text-primary">{selectedEntry.label}</h3></div><Badge variant="outline">{verdictLabels[selectedEntry.verdict]}</Badge></div>
                    <div className="border-t border-border pt-4"><p className="font-mono text-[10px] uppercase text-muted-foreground">Dane odebrane</p><p className="mt-2 text-sm leading-relaxed">{selectedEntry.input}</p></div>
                    <div className="border-t border-border pt-4"><p className="font-mono text-[10px] uppercase text-muted-foreground">Wynik węzła</p><p className="mt-2 text-sm leading-relaxed">{selectedEntry.output}</p></div>
                    <div className="border-t border-border pt-4"><p className="font-mono text-[10px] uppercase text-muted-foreground">Akcja agenta</p><p className="mt-2 flex items-start gap-2 text-sm leading-relaxed">{selectedEntry.verdict === 'blocked' ? <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> : <CheckCircle2 className="alfa-connection-ok mt-0.5 h-4 w-4 shrink-0" />}{selectedEntry.action}</p></div>
                    <p className="border-t border-border pt-4 text-xs text-muted-foreground">Źródło: dane demonstracyjne · Wykonanie: lokalna symulacja · Akcje zewnętrzne: 0</p>
                  </div>
                ) : (
                  <div className="flex h-[420px] items-center justify-center border border-border bg-background p-8 text-center text-sm text-muted-foreground">Wybierz wpis w dzienniku po uruchomieniu symulacji.</div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoldenOrbPanel;
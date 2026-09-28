import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Hand, Lock, Play, Repeat, ShieldCheck, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { pipelineSlots } from '@/data/alfaModularSystem';
import { appendEntry, verifyChain, type LedgerEntry } from '@/lib/decisionLedger';

interface HoldLock {
  id: string;
  cause: string;
  heldActions: string[];
  raisedBy: string;
  raisedAt: string;
  status: 'active' | 'resolved';
  evidence?: string;
}

const DRIFT_CAUSE = 'Rekomendacja Oracle odbiega od źródeł: twierdzenie bez pokrycia w dokumentach (demo).';
const HELD_ACTIONS = ['Wykonanie decyzji Cerbera', 'Publikacja wyniku', 'Przekazanie do runtime'];
const RESOLUTION_EVIDENCE = 'AI-A i AI-B niezależnie potwierdziły zgodność Oracle ze źródłami po ponownym ugruntowaniu (demo).';

const time = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const AlfaModularSystem = () => {
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries(pipelineSlots.map((s) => [s.id, s.options[0].id])));
  const [ledger, setLedger] = useState<readonly LedgerEntry[]>([]);
  const [holds, setHolds] = useState<HoldLock[]>([]);
  const [guardianStop, setGuardianStop] = useState(false);

  const activeHolds = holds.filter((h) => h.status === 'active');
  const drift = activeHolds.length > 0;
  const blocked = drift || guardianStop;
  const chainOk = useMemo(() => verifyChain(ledger), [ledger]);

  const log = (entry: Parameters<typeof appendEntry>[1]) => setLedger((prev) => appendEntry(prev, entry));

  const simulateDrift = () => {
    const id = `HOLD-${(holds.length + 1).toString().padStart(3, '0')}`;
    setHolds((prev) => [...prev, { id, cause: DRIFT_CAUSE, heldActions: HELD_ACTIONS, raisedBy: 'AI-A, AI-B', raisedAt: new Date().toISOString(), status: 'active' }]);
    log({ kind: 'ORACLE_DECISION', source: 'Oracle', detail: 'Rekomendacja wydana bez pełnego pokrycia w źródłach.', evidence: 'Porównanie ze źródłami: niezgodność (demo).' });
    log({ kind: 'HOLD_RAISED', source: 'AI-A, AI-B', detail: `${id}: dryf Oracle — wstrzymano ${HELD_ACTIONS.length} akcje.`, evidence: DRIFT_CAUSE });
  };

  const resolve = (id: string) => {
    setHolds((prev) => prev.map((h) => (h.id === id ? { ...h, status: 'resolved', evidence: RESOLUTION_EVIDENCE } : h)));
    log({ kind: 'HOLD_RESOLVED', source: 'AI-A, AI-B → Cerber', detail: `${id}: dryf rozstrzygnięty, blokada zdjęta.`, evidence: RESOLUTION_EVIDENCE });
  };

  const toggleGuardian = () => {
    const next = !guardianStop;
    setGuardianStop(next);
    log(next
      ? { kind: 'GUARDIAN_STOP', source: 'Guardian', detail: 'Guardian zatrzymał wykonanie.', evidence: 'Weto Guardiana (demo).' }
      : { kind: 'GUARDIAN_RELEASE', source: 'Guardian', detail: 'Guardian zwolnił zatrzymanie.', evidence: 'Ręczne zwolnienie (demo).' });
  };

  const runDecision = () => {
    if (blocked) {
      log({ kind: 'CERBER_VERDICT', source: 'Cerber', detail: 'HOLD — wykonanie zablokowane.', evidence: drift ? `Aktywne blokady: ${activeHolds.map((h) => h.id).join(', ')}` : 'Aktywne zatrzymanie Guardiana.' });
      return;
    }
    log({ kind: 'ORACLE_DECISION', source: 'Oracle', detail: 'Rekomendacja zgodna ze źródłami.', evidence: 'Pokrycie w źródłach: pełne (demo).' });
    log({ kind: 'CERBER_VERDICT', source: 'Cerber', detail: 'PASS — AI-A i AI-B zgodne, Cerber zatwierdza i odpowiada za wykonanie.', evidence: 'AI-A: PASS · AI-B: PASS (demo).' });
  };

  const overrides: Record<string, { label: string; description: string }> = {
    ...(drift && {
      oracle: { label: 'DRYF WYKRYTY', description: 'Oracle zachowuje odczyt wszystkich modułów, ale traci głos decyzyjny.' },
      analyst: { label: 'HOLD zgłoszony', description: 'AI pod Oracle zgłosiły HOLD — blokada trwa do rozstrzygnięcia.' },
    }),
    ...(blocked && { decision: { label: 'HOLD · zablokowane', description: guardianStop ? 'Guardian zatrzymał wykonanie.' : 'Żadna decyzja nie wychodzi do czasu rozstrzygnięcia dryfu.' } }),
  };

  return (
    <section className="mb-5 border-b border-border" aria-labelledby="alfa-modular-title">
      <div className="container mx-auto px-4 py-6">
        <p className="font-mono text-xs uppercase text-primary">Architektura systemu</p>
        <h2 id="alfa-modular-title" className="mt-1 text-2xl font-semibold">Od problemu do decyzji</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Wymienne moduły skanują i monitorują, Oracle ma wgląd we wszystko, dwa niezależne AI analizują, Cerber decyduje i odpowiada za wykonanie, a Guardian może je zatrzymać.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={runDecision}><Play />Uruchom decyzję</Button>
          <Button variant="outline" onClick={simulateDrift}><AlertTriangle />Symuluj dryf Oracle</Button>
          <Button variant="outline" onClick={toggleGuardian}>{guardianStop ? <Unlock /> : <Hand />}{guardianStop ? 'Guardian: zwolnij' : 'Guardian: zatrzymaj'}</Button>
          <p role="status" className={cn('text-sm', blocked ? 'text-destructive' : 'text-muted-foreground')}>
            {blocked ? 'Protokół HOLD aktywny — wyjście decyzji zablokowane.' : 'Brak blokad — Cerber może wydać decyzję.'}
          </p>
        </div>

        <ol className="mt-5 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          {pipelineSlots.map((slot, index) => {
            const base = slot.options.find((o) => o.id === picked[slot.id]) ?? slot.options[0];
            const held = Boolean(overrides[slot.id]);
            const current = { ...base, ...overrides[slot.id] };
            return (
              <li key={slot.id} className={cn('relative flex flex-col border border-border bg-card p-4', held && 'border-destructive/60')}>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs text-muted-foreground">{slot.stage}</span>
                  {slot.swappable && <Badge variant="outline" className="gap-1 border-primary/40 text-primary"><Repeat className="h-3 w-3" />Wymienny</Badge>}
                </div>
                <h3 className="mt-2 text-sm font-semibold">{slot.title}</h3>
                <p className={cn('mt-1 font-mono text-sm', held ? 'text-destructive' : 'text-primary')}>{current.label}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{current.description}</p>
                {slot.swappable && (
                  <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label={`Wybierz: ${slot.title}`}>
                    {slot.options.map((option) => (
                      <button key={option.id} type="button" aria-pressed={option.id === base.id}
                        onClick={() => setPicked((prev) => ({ ...prev, [slot.id]: option.id }))}
                        className={cn('border border-border px-2 py-1 text-[11px] transition-colors hover:border-primary/60', option.id === base.id && 'border-primary bg-primary text-primary-foreground')}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
                {index < pipelineSlots.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-primary xl:block" aria-hidden />}
              </li>
            );
          })}
        </ol>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Blokady HOLD</h3><Badge variant="outline" className={cn(drift && 'border-destructive/50 text-destructive')}>{activeHolds.length} aktywne</Badge></div>
            <ScrollArea className="mt-3 h-72 border border-border bg-background">
              {holds.length ? (
                <ul className="divide-y divide-border">
                  {[...holds].reverse().map((h) => (
                    <li key={h.id} className="space-y-2 p-4 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs">{h.id}</span>
                        <Badge variant="outline" className={cn(h.status === 'active' ? 'border-destructive/50 text-destructive' : 'border-primary/40 text-primary')}>{h.status === 'active' ? <><Lock className="mr-1 h-3 w-3" />Aktywna</> : <><CheckCircle2 className="mr-1 h-3 w-3" />Rozstrzygnięta</>}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{time(h.raisedAt)} · zgłosili: {h.raisedBy}</span>
                      </div>
                      <p><span className="text-muted-foreground">Przyczyna dryfu: </span>{h.cause}</p>
                      <p className="text-muted-foreground">Wstrzymane akcje: {h.heldActions.join(' · ')}</p>
                      {h.evidence && <p className="text-xs"><span className="text-muted-foreground">Dowód rozstrzygnięcia: </span>{h.evidence}</p>}
                      {h.status === 'active' && <Button size="sm" variant="outline" onClick={() => resolve(h.id)}><CheckCircle2 />Rozstrzygnij</Button>}
                    </li>
                  ))}
                </ul>
              ) : <p className="p-6 text-center text-sm text-muted-foreground">Brak blokad. Użyj „Symuluj dryf Oracle”.</p>}
            </ScrollArea>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Niezmienny dziennik decyzji</h3>
              <Badge variant="outline" className={cn(chainOk ? 'border-primary/40 text-primary' : 'border-destructive/50 text-destructive')}><ShieldCheck className="mr-1 h-3 w-3" />{chainOk ? 'Łańcuch spójny' : 'Łańcuch naruszony'}</Badge></div>
            <ScrollArea className="mt-3 h-72 border border-border bg-background">
              {ledger.length ? (
                <ol className="divide-y divide-border">
                  {[...ledger].reverse().map((e) => (
                    <li key={e.seq} className="space-y-1 p-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-muted-foreground">#{e.seq} · {time(e.time)}</span><Badge variant="outline" className={cn(e.kind.startsWith('HOLD_RAISED') || e.kind === 'GUARDIAN_STOP' ? 'border-destructive/50 text-destructive' : '')}>{e.kind}</Badge><span>źródło: {e.source}</span></div>
                      <p className="text-sm">{e.detail}</p>
                      <p className="text-muted-foreground">Dowód: {e.evidence}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">prev {e.prevHash} → hash {e.hash}</p>
                    </li>
                  ))}
                </ol>
              ) : <p className="p-6 text-center text-sm text-muted-foreground">Dziennik pusty. Wpisów nie można edytować ani usuwać.</p>}
            </ScrollArea>
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">Prezentacja architektury · lokalna symulacja · bez skanowania i bez akcji zewnętrznych</p>
      </div>
    </section>
  );
};

export default AlfaModularSystem;

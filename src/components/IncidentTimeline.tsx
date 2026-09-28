import { useEffect, useMemo, useRef, useState } from 'react';
import { BellRing, CheckCheck, FileJson, FileText, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { clearIncidents, publishIncident, subscribeIncidents, type IncidentEvent, type IncidentSource } from '@/lib/incidentBus';
import { signReport, verifyReport } from '@/lib/reportSigning';

interface Rule { id: string; label: string; match: (e: IncidentEvent) => boolean; threshold: number; windowSec: number }
interface Escalation { id: string; rule: string; at: string; count: number; ackBy?: string; ackAt?: string }

const sourceColors: Record<IncidentSource, string> = { Brama: '', Cerber: 'text-primary', Guardian: '', HOLD: 'text-destructive', Operator: '', Tokeny: '' };
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const IncidentTimeline = () => {
  const [events, setEvents] = useState<readonly IncidentEvent[]>([]);
  const [filter, setFilter] = useState<'all' | IncidentSource>('all');
  const [rules, setRules] = useState<Rule[]>([
    { id: 'deny', label: 'Powtarzające się odmowy', match: (e) => e.type === 'DENY', threshold: 3, windowSec: 60 },
    { id: 'hold', label: 'Blokady HOLD', match: (e) => e.source === 'HOLD' && e.type === 'HOLD_RAISED', threshold: 1, windowSec: 300 },
    { id: 'token', label: 'Podejrzane zmiany tokenów', match: (e) => ['ROTATED', 'REVOKED', 'TOKEN_THEFT'].includes(e.type), threshold: 2, windowSec: 120 },
  ]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [operator, setOperator] = useState('');
  const fired = useRef(new Map<string, number>());
  const verifyRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeIncidents(setEvents), []);

  useEffect(() => {
    const now = Date.now();
    rules.forEach((r) => {
      const hits = events.filter((e) => r.match(e) && now - Date.parse(e.at) <= r.windowSec * 1000);
      const lastId = hits[hits.length - 1]?.id ?? 0;
      if (hits.length >= r.threshold && (fired.current.get(r.id) ?? 0) < lastId) {
        fired.current.set(r.id, lastId);
        setEscalations((prev) => [{ id: `${r.id}-${lastId}`, rule: r.label, at: new Date().toISOString(), count: hits.length }, ...prev].slice(0, 100));
        toast.warning(`Eskalacja: ${r.label} (${hits.length})`);
      }
    });
  }, [events, rules]);

  const shown = useMemo(() => (filter === 'all' ? events : events.filter((e) => e.source === filter)), [events, filter]);

  const ack = (id: string) => {
    const who = operator.trim().slice(0, 60);
    if (!who) { toast.error('Podaj nazwę operatora, aby potwierdzić.'); return; }
    setEscalations((prev) => prev.map((x) => (x.id === id ? { ...x, ackBy: who, ackAt: new Date().toISOString() } : x)));
    publishIncident({ source: 'Operator', type: 'ACK', message: `${who} potwierdził eskalację ${id}.`, severity: 'info' });
  };

  const buildPayload = () => ({ report: 'ALFA incident timeline', generatedAt: new Date().toISOString(), mode: 'LOCAL_SIMULATION', events: [...events], escalations });

  const download = (content: string, name: string, type: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name; a.click(); URL.revokeObjectURL(a.href);
  };

  const exportJson = async () => {
    const signed = await signReport(buildPayload());
    download(JSON.stringify(signed, null, 2), `alfa-incident-${Date.now()}.json`, 'application/json');
    toast.success('Raport JSON podpisany (ECDSA P-256).');
  };

  const exportPdf = async () => {
    const signed = await signReport(buildPayload());
    const w = window.open('', '_blank', 'noopener=no');
    if (!w) { toast.error('Przeglądarka zablokowała okno raportu.'); return; }
    const rows = signed.payload.events.map((e) => `<tr><td>${escapeHtml(new Date(e.at).toLocaleString('pl-PL'))}</td><td>${escapeHtml(e.source)}</td><td>${escapeHtml(e.type)}</td><td>${escapeHtml(e.message)}</td></tr>`).join('');
    w.document.write(`<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Raport incydentu ALFA</title><style>body{font:12px sans-serif;margin:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:4px;text-align:left;vertical-align:top}code{word-break:break-all;font-size:10px}</style></head><body><h1>Raport incydentu ALFA</h1><p>Wygenerowano: ${escapeHtml(signed.payload.generatedAt)} · tryb: LOCAL_SIMULATION · zdarzeń: ${signed.payload.events.length}</p><table><thead><tr><th>Czas</th><th>Źródło</th><th>Typ</th><th>Opis</th></tr></thead><tbody>${rows}</tbody></table><h2>Podpis (ECDSA P-256)</h2><p><code>${escapeHtml(signed.signature)}</code></p><p>Pełną weryfikację wykonuje się na pliku JSON z tym samym podpisem.</p><script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
    download(JSON.stringify(signed, null, 2), `alfa-incident-${Date.now()}-do-pdf.json`, 'application/json');
  };

  const verifyFile = async (f?: File) => {
    if (!f) return;
    if (f.size > 5_000_000) { toast.error('Plik za duży.'); return; }
    (await verifyReport(await f.text())) ? toast.success('Podpis poprawny — raport nienaruszony.') : toast.error('Podpis niepoprawny — raport zmieniony lub uszkodzony.');
    if (verifyRef.current) verifyRef.current.value = '';
  };

  return (
    <section className="mb-5 border-b border-border" aria-labelledby="timeline-title">
      <div className="container mx-auto px-4 py-6">
        <p className="font-mono text-xs uppercase text-primary">Incydent</p>
        <h2 id="timeline-title" className="mt-1 text-2xl font-semibold">Oś czasu: brama, Cerber, Guardian, HOLD, operatorzy</h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(['all', 'Brama', 'Cerber', 'Guardian', 'HOLD', 'Tokeny', 'Operator'] as const).map((s) => (
            <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'} onClick={() => setFilter(s)}>{s === 'all' ? 'Wszystko' : s}</Button>
          ))}
          <span className="flex-1" />
          <Button size="sm" variant="outline" onClick={exportJson} disabled={!events.length}><FileJson />JSON</Button>
          <Button size="sm" variant="outline" onClick={exportPdf} disabled={!events.length}><FileText />PDF</Button>
          <Button size="sm" variant="outline" onClick={() => verifyRef.current?.click()}><ShieldCheck />Weryfikuj raport</Button>
          <input ref={verifyRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => verifyFile(e.target.files?.[0])} />
          <Button size="sm" variant="ghost" onClick={clearIncidents} disabled={!events.length}><Trash2 />Wyczyść</Button>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <ScrollArea className="h-96 border border-border bg-card">
            {shown.length ? (
              <ol className="relative ml-4 border-l border-border py-2">
                {[...shown].reverse().map((e) => (
                  <li key={e.id} className="relative py-2 pl-5 pr-3 text-xs">
                    <span className={cn('absolute -left-1.5 top-3 h-3 w-3 rounded-full border border-border bg-background', e.severity === 'critical' && 'border-destructive bg-destructive', e.severity === 'warning' && 'border-primary bg-primary')} />
                    <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-muted-foreground">{new Date(e.at).toLocaleTimeString('pl-PL')}</span><Badge variant="outline" className={sourceColors[e.source]}>{e.source}</Badge><span className="font-mono">{e.type}</span></div>
                    <p className="mt-1 text-sm">{e.message}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="p-6 text-center text-sm text-muted-foreground">Brak zdarzeń. Użyj bramy, dzielonego tokenu lub scenariuszy Cerbera.</p>}
          </ScrollArea>

          <div className="border border-border bg-card p-4">
            <h3 className="flex items-center gap-2 font-semibold"><BellRing className="h-4 w-4 text-primary" />Alerty eskalacyjne</h3>
            <div className="mt-3 space-y-2 text-xs">
              {rules.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-2">
                  <span className="flex-1">{r.label}</span>
                  <label className="flex items-center gap-1">próg<Input type="number" min={1} max={50} className="h-7 w-14" value={r.threshold} onChange={(e) => setRules((p) => p.map((x) => (x.id === r.id ? { ...x, threshold: Math.min(50, Math.max(1, Number(e.target.value) || 1)) } : x)))} /></label>
                  <label className="flex items-center gap-1">okno s<Input type="number" min={10} max={3600} className="h-7 w-16" value={r.windowSec} onChange={(e) => setRules((p) => p.map((x) => (x.id === r.id ? { ...x, windowSec: Math.min(3600, Math.max(10, Number(e.target.value) || 10)) } : x)))} /></label>
                </div>
              ))}
            </div>
            <Input className="mt-3" placeholder="Operator (do potwierdzeń)" maxLength={60} value={operator} onChange={(e) => setOperator(e.target.value)} aria-label="Nazwa operatora" />
            <ScrollArea className="mt-3 h-44 border border-border bg-background">
              {escalations.length ? (
                <ul className="divide-y divide-border">
                  {escalations.map((x) => (
                    <li key={x.id} className="flex items-start justify-between gap-2 p-2 text-xs">
                      <div><p className="font-medium">{x.rule} · {x.count}</p><p className="text-muted-foreground">{new Date(x.at).toLocaleTimeString('pl-PL')}{x.ackBy && ` · potwierdził ${x.ackBy} o ${new Date(x.ackAt!).toLocaleTimeString('pl-PL')}`}</p></div>
                      {!x.ackBy && <Button size="sm" variant="outline" onClick={() => ack(x.id)}><CheckCheck />Potwierdź</Button>}
                    </li>
                  ))}
                </ul>
              ) : <p className="p-4 text-center text-xs text-muted-foreground">Brak eskalacji.</p>}
            </ScrollArea>
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">Klucz podpisu istnieje tylko w tej sesji przeglądarki · raport zawiera klucz publiczny do weryfikacji</p>
      </div>
    </section>
  );
};

export default IncidentTimeline;

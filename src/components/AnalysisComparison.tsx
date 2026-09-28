import { AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CerberScenario } from '@/data/alfaCerberScenarios';

const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);

const AnalysisComparison = ({ scenario }: { scenario: CerberScenario }) => {
  const [a, b] = scenario.analyses;
  const verdictDiff = a.verdict !== b.verdict;
  const confGap = a.confidence !== null && b.confidence !== null ? Math.abs(a.confidence - b.confidence) : null;
  const sharedEvidence = a.evidence.filter((e) => b.evidence.includes(e));
  const diffs = [
    verdictDiff && `Werdykty: ${a.verdict ?? 'brak'} vs ${b.verdict ?? 'brak'}`,
    confGap !== null && confGap >= 0.05 && `Różnica pewności: ${Math.round(confGap * 100)} pkt`,
    a.status !== b.status && 'Jeden model niedostępny',
    sharedEvidence.length === 0 && a.evidence.length + b.evidence.length > 0 && 'Brak wspólnych dowodów',
  ].filter(Boolean) as string[];

  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Porównanie analiz dla Cerbera</h3><Badge variant="outline" className={cn(diffs.length && 'border-destructive/50 text-destructive')}>{diffs.length ? `${diffs.length} różnice` : 'Zgodne'}</Badge></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {scenario.analyses.map((x) => (
          <div key={x.model} className={cn('border border-border bg-background p-3 text-sm', x.status === 'failed' && 'border-destructive/50')}>
            <div className="flex items-center justify-between"><span className="font-mono text-primary">{x.model}</span>
              {x.status === 'failed' ? <Badge variant="outline" className="border-destructive/50 text-destructive"><XCircle className="mr-1 h-3 w-3" />Awaria</Badge> : <Badge variant="outline">{x.verdict}</Badge>}
            </div>
            <p className="mt-2">{x.finding}</p>
            <p className="mt-2 text-xs text-muted-foreground">Dowody: {x.evidence.length ? x.evidence.map((e) => (sharedEvidence.includes(e) ? `${e} (wspólny)` : e)).join(' · ') : 'brak'}</p>
            <div className="mt-2 flex items-center gap-2 text-xs"><span className="text-muted-foreground">Pewność</span>
              <div className="h-1.5 flex-1 bg-muted"><div className="h-full bg-primary" style={{ width: pct(x.confidence) === '—' ? '0%' : pct(x.confidence) }} /></div>
              <span className="font-mono">{pct(x.confidence)}</span></div>
          </div>
        ))}
      </div>
      {diffs.length > 0 && <ul className="mt-3 space-y-1 text-xs text-destructive">{diffs.map((d) => <li key={d} className="flex items-center gap-2"><AlertTriangle className="h-3 w-3" />{d}</li>)}</ul>}
      <p className="mt-3 text-xs"><span className="text-muted-foreground">Cerber: </span>{scenario.cerberReaction}</p>
      <p className="mt-1 text-xs"><span className="text-muted-foreground">Guardian: </span>{scenario.guardianReaction}</p>
    </div>
  );
};

export default AnalysisComparison;

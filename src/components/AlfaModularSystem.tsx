import { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { pipelineSlots } from '@/data/alfaModularSystem';

const AlfaModularSystem = () => {
  const [picked, setPicked] = useState<Record<string, string>>(
    () => Object.fromEntries(pipelineSlots.map((slot) => [slot.id, slot.options[0].id])),
  );

  const [drift, setDrift] = useState(false);
  const override: Record<string, { label: string; description: string }> = drift
    ? {
        oracle: { label: 'DRYF WYKRYTY', description: 'Rekomendacje Oracle odbiegają od źródeł. Oracle zachowuje odczyt, ale traci głos decyzyjny.' },
        analyst: { label: 'HOLD zgłoszony', description: 'AI pod Oracle mają prawo i obowiązek zgłosić HOLD, gdy Oracle dryfuje.' },
        decision: { label: 'HOLD · zablokowane', description: 'Żadna decyzja nie wychodzi, dopóki dryf nie zostanie rozstrzygnięty.' },
      }
    : {};

  return (
    <section className="mb-5 border-b border-border" aria-labelledby="alfa-modular-title">
      <div className="container mx-auto px-4 py-6">
        <p className="font-mono text-xs uppercase text-primary">Architektura systemu</p>
        <h2 id="alfa-modular-title" className="mt-1 text-2xl font-semibold">Od problemu do decyzji</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          System skanuje i monitoruje bezpieczeństwo przez wymienne moduły, algorytmy i silniki. Oddzielne AI analizuje wyniki, a Oracle ma wgląd w każdy moduł. Kliknij opcję, aby zobaczyć wymianę modułu.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {drift ? (
            <Button variant="outline" onClick={() => setDrift(false)}><CheckCircle2 />Rozstrzygnij dryf</Button>
          ) : (
            <Button variant="outline" onClick={() => setDrift(true)}><AlertTriangle />Symuluj dryf Oracle</Button>
          )}
          <p role="status" className={cn('text-sm', drift ? 'text-destructive' : 'text-muted-foreground')}>
            {drift ? 'Protokół HOLD aktywny: wyjście decyzji zablokowane.' : 'Protokół HOLD: AI analityczne pilnują Oracle.'}
          </p>
        </div>
        <ol className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {pipelineSlots.map((slot, index) => {
            const base = slot.options.find((o) => o.id === picked[slot.id]) ?? slot.options[0];
            const current = { ...base, ...override[slot.id] };
            const held = Boolean(override[slot.id]);
            return (
              <li key={slot.id} className={cn('relative flex flex-col border border-border bg-card p-4', held && 'border-destructive/60')}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{slot.stage}</span>
                  {slot.swappable && <Badge variant="outline" className="gap-1 border-primary/40 text-primary"><Repeat className="h-3 w-3" />Wymienny</Badge>}
                </div>
                <h3 className="mt-2 text-sm font-semibold">{slot.title}</h3>
                <p className={cn('mt-1 font-mono text-sm', held ? 'text-destructive' : 'text-primary')}>{current.label}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{current.description}</p>
                {slot.swappable && (
                  <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label={`Wybierz: ${slot.title}`}>
                    {slot.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={option.id === base.id}
                        onClick={() => setPicked((prev) => ({ ...prev, [slot.id]: option.id }))}
                        className={cn('border border-border px-2 py-1 text-[11px] transition-colors hover:border-primary/60', option.id === base.id && 'border-primary bg-primary text-primary-foreground')}
                      >
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
        <p className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">Prezentacja architektury · bez skanowania i bez akcji zewnętrznych</p>
      </div>
    </section>
  );
};

export default AlfaModularSystem;

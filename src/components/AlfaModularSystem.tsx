import { useState } from 'react';
import { ArrowRight, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { pipelineSlots } from '@/data/alfaModularSystem';

const AlfaModularSystem = () => {
  const [picked, setPicked] = useState<Record<string, string>>(
    () => Object.fromEntries(pipelineSlots.map((slot) => [slot.id, slot.options[0].id])),
  );

  return (
    <section className="mb-5 border-b border-border" aria-labelledby="alfa-modular-title">
      <div className="container mx-auto px-4 py-6">
        <p className="font-mono text-xs uppercase text-primary">Architektura systemu</p>
        <h2 id="alfa-modular-title" className="mt-1 text-2xl font-semibold">Od problemu do decyzji</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          System skanuje i monitoruje bezpieczeństwo przez wymienne moduły, algorytmy i silniki. Oddzielne AI analizuje wyniki, a Oracle ma wgląd w każdy moduł. Kliknij opcję, aby zobaczyć wymianę modułu.
        </p>
        <ol className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {pipelineSlots.map((slot, index) => {
            const current = slot.options.find((o) => o.id === picked[slot.id]) ?? slot.options[0];
            return (
              <li key={slot.id} className="relative flex flex-col border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{slot.stage}</span>
                  {slot.swappable && <Badge variant="outline" className="gap-1 border-primary/40 text-primary"><Repeat className="h-3 w-3" />Wymienny</Badge>}
                </div>
                <h3 className="mt-2 text-sm font-semibold">{slot.title}</h3>
                <p className="mt-1 font-mono text-sm text-primary">{current.label}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{current.description}</p>
                {slot.swappable && (
                  <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label={`Wybierz: ${slot.title}`}>
                    {slot.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={option.id === current.id}
                        onClick={() => setPicked((prev) => ({ ...prev, [slot.id]: option.id }))}
                        className={cn('border border-border px-2 py-1 text-[11px] transition-colors hover:border-primary/60', option.id === current.id && 'border-primary bg-primary text-primary-foreground')}
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

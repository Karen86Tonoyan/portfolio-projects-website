import { useState } from 'react';
import { ArrowRight, KeyRound, Moon, RotateCcw, Server, ShieldOff, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Presentation of the sandboxed entry + ALFA Bridge mutual-token model. Nothing connects anywhere. */
const hops = [
  { icon: Users, title: 'Klient', text: 'Każde połączenie klienta zaczyna się poza systemem.' },
  { icon: Moon, title: 'Uśpiony bot w sandboxie', text: 'Jedno wejście = jeden uśpiony bot w izolowanym sandboxie. Budzi się tylko na to żądanie.' },
  { icon: Server, title: 'ALFA Bridge (hosting)', text: 'System widzi tylko most. Tu łączą się klienci — nigdy bezpośrednio z rdzeniem.' },
  { icon: KeyRound, title: 'Rdzeń ALFA', text: 'Most i rdzeń trzymają nawzajem swoje tokeny. Oba muszą się zgadzać.' },
];

const AlfaBridgeFlow = () => {
  const [stolen, setStolen] = useState(false);
  return (
    <section className="mb-5 border-b border-border" aria-labelledby="alfa-bridge-title">
      <div className="container mx-auto px-4 py-6">
        <p className="font-mono text-xs uppercase text-primary">Wejście do systemu</p>
        <h2 id="alfa-bridge-title" className="mt-1 text-2xl font-semibold">Sandbox → ALFA Bridge → rdzeń</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Każdy element ma token drugiego. Kradzież jednego tokenu nie daje dostępu — zrywa połączenie.</p>
        <ol className="mt-5 grid gap-3 md:grid-cols-4">
          {hops.map((h, i) => (
            <li key={h.title} className={cn('relative border border-border bg-card p-4', stolen && i >= 2 && 'border-destructive/60 opacity-70')}>
              <h.icon className="h-5 w-5 text-primary" /><h3 className="mt-2 text-sm font-semibold">{h.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{h.text}</p>
              {i < hops.length - 1 && <ArrowRight className={cn('absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 md:block', stolen && i >= 1 ? 'text-destructive' : 'text-primary')} aria-hidden />}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {stolen
            ? <Button variant="outline" onClick={() => setStolen(false)}><RotateCcw />Wydaj nowe tokeny</Button>
            : <Button variant="outline" onClick={() => setStolen(true)}><ShieldOff />Symuluj kradzież tokenu</Button>}
          <Badge variant="outline" role="status" className={cn(stolen ? 'border-destructive/50 text-destructive' : 'border-primary/40 text-primary')}>
            {stolen ? 'Niezgodność tokenów — połączenie zerwane, sandbox usunięty' : 'Tokeny wzajemne zgodne — połączenie aktywne'}
          </Badge>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">Prezentacja architektury · brak prawdziwych połączeń i tokenów</p>
      </div>
    </section>
  );
};

export default AlfaBridgeFlow;

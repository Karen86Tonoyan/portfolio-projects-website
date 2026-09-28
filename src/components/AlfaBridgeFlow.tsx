import { useRef, useState } from 'react';
import { ArrowRight, Bell, KeyRound, LogIn, Moon, RotateCcw, Server, ShieldOff, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { takeToken, mutualTokensValid, type Bucket } from '@/lib/gatewayGuard';

/** Presentation of Łasuch capture → sandbox → ALFA Bridge mutual-token model. Nothing connects anywhere. */
const hops = [
  { icon: Users, title: 'Klient', text: 'Każdy, kto wchodzi — bez wyjątku.' },
  { icon: LogIn, title: 'Łasuch połyka', text: 'Łasuch przechwytuje każde wejście i zanosi je do sandboxu. Właściciel dostaje powiadomienie.' },
  { icon: Moon, title: 'Uśpiony bot w sandboxie', text: 'Jedno wejście = jeden uśpiony bot w izolacji. Budzi się tylko na to żądanie.' },
  { icon: Server, title: 'ALFA Bridge (hosting)', text: 'System widzi tylko most. Tu łączą się klienci — nigdy bezpośrednio z rdzeniem.' },
  { icon: KeyRound, title: 'Rdzeń ALFA', text: 'Most i rdzeń trzymają nawzajem swoje tokeny. Oba muszą się zgadzać.' },
];

const CORE = 'core-demo-token';
const BRIDGE = 'bridge-demo-token';
const MAX_ALERTS = 50;

interface OwnerAlert { id: number; time: string; text: string; tone: 'info' | 'danger' }

const AlfaBridgeFlow = () => {
  const [bridgeHoldsCore, setBridgeHoldsCore] = useState(CORE);
  const [alerts, setAlerts] = useState<OwnerAlert[]>([]);
  const [sandboxes, setSandboxes] = useState(0);
  const bucket = useRef<Bucket>();
  const seq = useRef(0);
  const connected = mutualTokensValid(bridgeHoldsCore, CORE, BRIDGE, BRIDGE);

  const alert = (text: string, tone: OwnerAlert['tone'] = 'info') =>
    setAlerts((prev) => [{ id: ++seq.current, time: new Date().toLocaleTimeString('pl-PL'), text, tone }, ...prev].slice(0, MAX_ALERTS));

  const enter = () => {
    const res = takeToken(bucket.current, Date.now());
    bucket.current = res.bucket;
    if (!res.allowed) { alert('Brama: limit żądań przekroczony — wejście odrzucone przed sandboxem.', 'danger'); return false; }
    setSandboxes((n) => n + 1);
    alert(connected ? 'Łasuch przechwycił wejście → sandbox → ALFA Bridge.' : 'Łasuch przechwycił wejście → sandbox. Most zerwany — brak dostępu do rdzenia.', connected ? 'info' : 'danger');
    return true;
  };

  const flood = () => { for (let i = 0; i < 12; i += 1) enter(); };

  return (
    <section className="mb-5 border-b border-border" aria-labelledby="alfa-bridge-title">
      <div className="container mx-auto px-4 py-6">
        <p className="font-mono text-xs uppercase text-primary">Wejście do systemu</p>
        <h2 id="alfa-bridge-title" className="mt-1 text-2xl font-semibold">Łasuch → sandbox → ALFA Bridge → rdzeń</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Każde wejście trafia najpierw do sandboxu. Każdy element ma token drugiego — kradzież jednego tokenu nie daje dostępu, tylko zrywa połączenie.</p>
        <ol className="mt-5 grid gap-3 md:grid-cols-5">
          {hops.map((h, i) => (
            <li key={h.title} className={cn('relative border border-border bg-card p-4', !connected && i >= 3 && 'border-destructive/60 opacity-70')}>
              <h.icon className="h-5 w-5 text-primary" /><h3 className="mt-2 text-sm font-semibold">{h.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{h.text}</p>
              {i < hops.length - 1 && <ArrowRight className={cn('absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 md:block', !connected && i >= 2 ? 'text-destructive' : 'text-primary')} aria-hidden />}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={enter}><LogIn />Symuluj wejście</Button>
          <Button variant="outline" onClick={flood}><Zap />Symuluj zalew żądań</Button>
          {connected
            ? <Button variant="outline" onClick={() => { setBridgeHoldsCore('stolen-token'); alert('Token przechwycony — niezgodność, połączenie zerwane.', 'danger'); }}><ShieldOff />Symuluj kradzież tokenu</Button>
            : <Button variant="outline" onClick={() => { setBridgeHoldsCore(CORE); alert('Wydano nowe tokeny wzajemne — most przywrócony.'); }}><RotateCcw />Wydaj nowe tokeny</Button>}
          <Badge variant="outline" role="status" className={cn(connected ? 'border-primary/40 text-primary' : 'border-destructive/50 text-destructive')}>
            {connected ? 'Tokeny wzajemne zgodne — most aktywny' : 'Niezgodność tokenów — most zerwany'}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">sandboxy: {sandboxes}</span>
        </div>
        <div className="mt-4 border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4 text-primary" />Powiadomienia właściciela</h3>
          <ScrollArea className="mt-2 h-36 border border-border bg-background">
            {alerts.length ? <ul className="divide-y divide-border">{alerts.map((a) => <li key={a.id} className={cn('p-2 text-xs', a.tone === 'danger' && 'text-destructive')}><span className="font-mono text-muted-foreground">{a.time}</span> · {a.text}</li>)}</ul>
              : <p className="p-4 text-center text-xs text-muted-foreground">Brak zdarzeń.</p>}
          </ScrollArea>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">Prezentacja architektury · brak prawdziwych połączeń i tokenów</p>
      </div>
    </section>
  );
};

export default AlfaBridgeFlow;

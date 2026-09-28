import { useEffect, useState } from 'react';
import { Activity, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Simulated module health (deterministic drift around a baseline). Oracle details require an authorized role. */
interface Health { id: string; label: string; baseLatency: number; baseErrors: number; restricted?: boolean }

const modules: Health[] = [
  { id: 'filters', label: 'Filtry ALFA', baseLatency: 42, baseErrors: 0 },
  { id: 'guardian', label: 'Guardian', baseLatency: 18, baseErrors: 0 },
  { id: 'cerber', label: 'Cerber', baseLatency: 64, baseErrors: 1 },
  { id: 'ai-a', label: 'AI-A', baseLatency: 310, baseErrors: 1 },
  { id: 'ai-b', label: 'AI-B', baseLatency: 360, baseErrors: 2 },
  { id: 'bridge', label: 'ALFA Bridge', baseLatency: 88, baseErrors: 0 },
  { id: 'oracle', label: 'Oracle', baseLatency: 220, baseErrors: 0, restricted: true },
];

const TICK_MS = 3000;

const ServiceHealthPanel = ({ canViewOracle = false }: { canViewOracle?: boolean }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = window.setInterval(() => setTick((n) => n + 1), TICK_MS); return () => window.clearInterval(t); }, []);

  return (
    <section className="mb-5 border-b border-border" aria-labelledby="alfa-health-title">
      <div className="container mx-auto px-4 py-6">
        <p className="font-mono text-xs uppercase text-primary">Kondycja usług</p>
        <h2 id="alfa-health-title" className="mt-1 flex items-center gap-2 text-2xl font-semibold"><Activity className="h-5 w-5 text-primary" />Dostępność, opóźnienia, błędy</h2>
        <div className="mt-4 overflow-x-auto border border-border bg-card">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground"><th className="p-3 font-normal">Moduł</th><th className="p-3 font-normal">Dostępność</th><th className="p-3 font-normal">Opóźnienie</th><th className="p-3 font-normal">Błędy / 5 min</th></tr></thead>
            <tbody>
              {modules.map((m, i) => {
                const hidden = m.restricted && !canViewOracle;
                const wobble = ((tick * 7 + i * 13) % 11) - 5;
                const latency = Math.max(1, m.baseLatency + wobble * Math.ceil(m.baseLatency / 40));
                const errors = m.baseErrors + (((tick + i) % 9) === 0 ? 1 : 0);
                const up = errors < 3;
                return (
                  <tr key={m.id} className="border-t border-border">
                    <td className="p-3 font-medium">{m.label}</td>
                    <td className="p-3">{hidden ? <Hidden /> : <Badge variant="outline" className={cn(up ? 'border-primary/40 text-primary' : 'border-destructive/50 text-destructive')}>{up ? 'Dostępny' : 'Ograniczony'}</Badge>}</td>
                    <td className="p-3 font-mono">{hidden ? <Hidden /> : `${latency} ms`}</td>
                    <td className={cn('p-3 font-mono', !hidden && errors > 0 && 'text-destructive')}>{hidden ? <Hidden /> : errors}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">Wartości symulowane · dane Oracle widoczne tylko dla uprawnionej roli</p>
      </div>
    </section>
  );
};

const Hidden = () => <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" />Wymaga uprawnień</span>;

export default ServiceHealthPanel;

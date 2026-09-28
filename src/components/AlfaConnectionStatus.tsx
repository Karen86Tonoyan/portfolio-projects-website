import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, RefreshCw, RotateCcw, Unplug } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  alfaConnections,
  type AlfaConnectionId,
  type AlfaConnectionState,
} from '@/data/alfaConnections';

const MAX_RETRY_ATTEMPTS = 3;
const CHECK_DELAY_MS = 900;

interface ConnectionRuntimeState {
  state: AlfaConnectionState;
  attempts: number;
  message?: string;
  checkedAt?: string;
}

type RuntimeMap = Record<AlfaConnectionId, ConnectionRuntimeState>;

const makeInitialState = (): RuntimeMap => Object.fromEntries(
  alfaConnections.map((connection) => [connection.id, {
    state: connection.initialState,
    attempts: 0,
  }]),
) as RuntimeMap;

const stateLabels: Record<AlfaConnectionState, string> = {
  connected: 'Połączono',
  degraded: 'Ograniczone',
  disconnected: 'Rozłączono',
  checking: 'Sprawdzanie',
};

const StateIcon = ({ state }: { state: AlfaConnectionState }) => {
  if (state === 'connected') return <CheckCircle2 className="alfa-connection-ok h-4 w-4" />;
  if (state === 'checking') return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
  if (state === 'disconnected') return <Unplug className="h-4 w-4 text-destructive" />;
  return <AlertCircle className="alfa-connection-warning h-4 w-4" />;
};

const AlfaConnectionStatus = () => {
  const [runtime, setRuntime] = useState<RuntimeMap>(makeInitialState);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const problemCount = useMemo(
    () => Object.values(runtime).filter(({ state }) => state === 'degraded' || state === 'disconnected').length,
    [runtime],
  );

  const checkConnection = (id: AlfaConnectionId) => {
    const definition = alfaConnections.find((connection) => connection.id === id);
    if (!definition || !definition.retryable) return;

    const current = runtime[id];
    if (current.state === 'checking') return;
    if (current.attempts >= MAX_RETRY_ATTEMPTS) {
      toast.error(`${definition.label}: limit prób został osiągnięty.`);
      return;
    }

    const nextAttempt = current.attempts + 1;
    setRuntime((previous) => ({
      ...previous,
      [id]: { ...previous[id], state: 'checking', message: `Trwa próba ${nextAttempt} z ${MAX_RETRY_ATTEMPTS}…` },
    }));

    const timer = window.setTimeout(() => {
      const message = definition.retryFailure ?? 'Połączenie nadal nie jest dostępne.';
      setRuntime((previous) => ({
        ...previous,
        [id]: {
          state: definition.initialState,
          attempts: nextAttempt,
          message,
          checkedAt: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      }));
      toast.error(`${definition.label}: ${message}`);
    }, CHECK_DELAY_MS);
    timers.current.push(timer);
  };

  const resetAttempts = () => {
    setRuntime(makeInitialState());
    toast.success('Licznik prób został wyzerowany.');
  };

  return (
    <section className="mb-5 border-y border-border bg-card/40" aria-labelledby="connection-status-title">
      <div className="container mx-auto px-4 py-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-primary">Live connection matrix</p>
            <h2 id="connection-status-title" className="mt-1 text-2xl font-semibold">Status połączeń</h2>
            <p className="mt-1 text-sm text-muted-foreground">Stan faktycznej konfiguracji — obecność w grafie nie oznacza aktywnego połączenia.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={problemCount ? 'border-destructive/40 text-destructive' : 'border-primary/40 text-primary'}>
              {problemCount ? `${problemCount} wymagają uwagi` : 'Wszystkie aktywne'}
            </Badge>
            <Button variant="ghost" size="icon" onClick={resetAttempts} aria-label="Wyzeruj próby połączeń">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
          {alfaConnections.map((connection) => {
            const current = runtime[connection.id];
            const Icon = connection.icon;
            const exhausted = current.attempts >= MAX_RETRY_ATTEMPTS;
            return (
              <article key={connection.id} className="flex min-h-56 flex-col bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background"><Icon className="h-4 w-4 text-primary" /></span>
                  <Badge variant="outline" className="gap-1.5"><StateIcon state={current.state} />{stateLabels[current.state]}</Badge>
                </div>
                <h3 className="mt-4 font-semibold">{connection.label}</h3>
                <p className="mt-1 font-mono text-xs text-primary">{connection.statusLabel}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{connection.detail}</p>
                {current.message && (
                  <Alert variant={current.state === 'disconnected' ? 'destructive' : 'default'} className="mt-3 p-3 [&>svg]:left-3 [&>svg]:top-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-xs">{current.state === 'checking' ? 'Ponawianie' : 'Nie udało się połączyć'}</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">{current.message}</AlertDescription>
                  </Alert>
                )}
                <div className="mt-4 border-t border-border pt-3">
                  {connection.retryable ? (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={current.state === 'checking' || exhausted}
                        onClick={() => checkConnection(connection.id)}
                      >
                        <RefreshCw className={current.state === 'checking' ? 'animate-spin' : ''} />
                        {exhausted ? 'Limit prób osiągnięty' : `Sprawdź ponownie (${current.attempts}/${MAX_RETRY_ATTEMPTS})`}
                      </Button>
                      {current.checkedAt && <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock3 className="h-3 w-3" />Ostatnia próba: {current.checkedAt}</p>}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="alfa-connection-ok h-4 w-4" />Nie wymaga ponawiania</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AlfaConnectionStatus;
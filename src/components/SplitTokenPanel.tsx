import { useMemo, useRef, useState } from 'react';
import { Ban, KeyRound, RefreshCw, ShieldCheck, ShieldX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TokenVault, type Decision, type DenyReason, type LockoutConfig } from '@/lib/splitToken';
import { publishIncident } from '@/lib/incidentBus';

const TTL_MS = 5 * 60_000;
const reasonLabels: Record<DenyReason, string> = { UNKNOWN: 'nieznany klient', REVOKED: 'token unieważniony', EXPIRED: 'token wygasł', LOCKED: 'czasowa blokada po nieudanych próbach', BAD_PASSWORD: 'złe hasło', BAD_HALF: 'połówka tokenu nie pasuje' };

const SplitTokenPanel = () => {
  const [lockout, setLockout] = useState<LockoutConfig>({ threshold: 3, baseDelayMs: 2000, maxDelayMs: 60_000 });
  const vault = useMemo(() => new TokenVault(TTL_MS, undefined, Date.now, (e) =>
    publishIncident({ source: e.type === 'PASS' || e.type === 'DENY' ? 'Cerber' : e.type === 'LOCKOUT' ? 'Brama' : 'Tokeny', type: e.type, message: `${e.clientId}: ${e.detail}`, severity: e.type === 'PASS' || e.type === 'ISSUED' ? 'info' : e.type === 'DENY' ? 'warning' : 'critical' })), []);
  vault.lockout = lockout;

  const [reg, setReg] = useState({ p1: '', p2: '' });
  const [client, setClient] = useState<{ id: string; half: string } | null>(null);
  const [login, setLogin] = useState({ p1: '', p2: '', half: '' });
  const [result, setResult] = useState<{ decision: Decision; text: string } | null>(null);
  const [error, setError] = useState<string>();
  const busy = useRef(false);

  const run = async (fn: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true; setError(undefined);
    try { await fn(); } catch (e) { setError((e as Error).message); } finally { busy.current = false; }
  };

  const issue = () => run(async () => {
    const { clientId, clientHalf } = await vault.issue(reg.p1, reg.p2);
    setClient({ id: clientId, half: clientHalf });
    setReg({ p1: '', p2: '' });
    setLogin({ p1: '', p2: '', half: clientHalf });
  });

  const verify = () => run(async () => {
    if (!client) return;
    const r = await vault.verify(client.id, login.p1, login.p2, login.half);
    setResult({ decision: r.decision, text: r.decision === 'PASS' ? 'Cerber: PASS — dostęp przyznany.' : `Cerber: DENY — ${reasonLabels[r.reason!]}${r.retryInMs ? ` (spróbuj za ${Math.ceil(r.retryInMs / 1000)} s)` : ''}.` });
  });

  const rotate = () => run(async () => {
    if (!client) return;
    const half = await vault.rotate(client.id);
    setClient({ ...client, half });
    setLogin((l) => ({ ...l, half }));
    publishIncident({ source: 'Operator', type: 'ROTATE', message: `${client.id}: operator zlecił rotację.`, severity: 'warning' });
  });

  const revoke = () => {
    if (!client) return;
    vault.revoke(client.id);
    publishIncident({ source: 'Operator', type: 'REVOKE', message: `${client.id}: operator unieważnił token.`, severity: 'critical' });
    setResult(null);
  };

  const st = client ? vault.status(client.id) : null;
  const num = (v: string, min: number) => Math.max(min, Number.parseInt(v, 10) || min);

  return (
    <section className="mb-5 border-b border-border" aria-labelledby="split-token-title">
      <div className="container mx-auto px-4 py-6">
        <p className="font-mono text-xs uppercase text-primary">Dzielony token</p>
        <h2 id="split-token-title" className="mt-1 text-2xl font-semibold">Dwa hasła + połowa tokenu → Cerber PASS / DENY</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Oracle trzyma drugą połowę tokenu każdego wpuszczonego klienta pod anonimowym identyfikatorem i nigdy jej nie ujawnia. Cerber sprawdza, czy obie połowy łączą się w całość — nikt nie widzi połowy drugiej strony.</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="border border-border bg-card p-4">
            <h3 className="font-semibold">1. Wpuść klienta</h3>
            <div className="mt-3 space-y-2">
              <Input type="password" autoComplete="new-password" placeholder="Hasło 1 (min. 8)" value={reg.p1} maxLength={128} onChange={(e) => setReg({ ...reg, p1: e.target.value })} aria-label="Hasło 1 nowego klienta" />
              <Input type="password" autoComplete="new-password" placeholder="Hasło 2 (inne niż 1)" value={reg.p2} maxLength={128} onChange={(e) => setReg({ ...reg, p2: e.target.value })} aria-label="Hasło 2 nowego klienta" />
              <Button onClick={issue} className="w-full"><KeyRound />Wydaj parę połówek</Button>
            </div>
            {client && (
              <div className="mt-3 space-y-1 text-xs">
                <p><span className="text-muted-foreground">Identyfikator: </span><span className="font-mono">{client.id}</span></p>
                <p className="break-all"><span className="text-muted-foreground">Połówka klienta: </span><span className="font-mono">{client.half}</span></p>
                <p className="text-muted-foreground">Połówka Oracle: ukryta · Cerber zna tylko skrót całości</p>
              </div>
            )}
          </div>

          <div className="border border-border bg-card p-4">
            <h3 className="font-semibold">2. Próba wejścia</h3>
            <div className="mt-3 space-y-2">
              <Input type="password" autoComplete="off" placeholder="Hasło 1" value={login.p1} maxLength={128} onChange={(e) => setLogin({ ...login, p1: e.target.value })} aria-label="Hasło 1 przy wejściu" disabled={!client} />
              <Input type="password" autoComplete="off" placeholder="Hasło 2" value={login.p2} maxLength={128} onChange={(e) => setLogin({ ...login, p2: e.target.value })} aria-label="Hasło 2 przy wejściu" disabled={!client} />
              <Input placeholder="Połówka tokenu klienta" value={login.half} maxLength={64} onChange={(e) => setLogin({ ...login, half: e.target.value })} aria-label="Połówka tokenu klienta" className="font-mono text-xs" disabled={!client} />
              <Button onClick={verify} className="w-full" disabled={!client}><ShieldCheck />Sprawdź w Cerberze</Button>
            </div>
            {result && <p role="status" className={cn('mt-3 flex items-center gap-2 text-sm', result.decision === 'PASS' ? 'text-primary' : 'text-destructive')}>{result.decision === 'PASS' ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}{result.text}</p>}
          </div>

          <div className="border border-border bg-card p-4">
            <h3 className="font-semibold">3. Cykl życia i limity</h3>
            {st && <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className={cn(st.revoked || st.expired ? 'border-destructive/50 text-destructive' : 'border-primary/40 text-primary')}>{st.revoked ? 'Unieważniony' : st.expired ? 'Wygasł' : 'Aktywny'}</Badge>
              <Badge variant="outline">wygasa {new Date(st.expiresAt).toLocaleTimeString('pl-PL')}</Badge>
              <Badge variant="outline">nieudane: {st.failures}</Badge>
            </div>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={rotate} disabled={!client || st?.revoked}><RefreshCw />Rotuj</Button>
              <Button variant="outline" onClick={revoke} disabled={!client || st?.revoked}><Ban />Unieważnij</Button>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <label className="flex items-center justify-between gap-2">Próg blokady (próby)<Input type="number" min={1} max={20} className="h-8 w-20" value={lockout.threshold} onChange={(e) => setLockout({ ...lockout, threshold: Math.min(20, num(e.target.value, 1)) })} /></label>
              <label className="flex items-center justify-between gap-2">Opóźnienie bazowe (s)<Input type="number" min={1} max={60} className="h-8 w-20" value={lockout.baseDelayMs / 1000} onChange={(e) => setLockout({ ...lockout, baseDelayMs: Math.min(60, num(e.target.value, 1)) * 1000 })} /></label>
              <label className="flex items-center justify-between gap-2">Maks. opóźnienie (s)<Input type="number" min={1} max={3600} className="h-8 w-20" value={lockout.maxDelayMs / 1000} onChange={(e) => setLockout({ ...lockout, maxDelayMs: Math.min(3600, num(e.target.value, 1)) * 1000 })} /></label>
              <p className="text-muted-foreground">Opóźnienie podwaja się z każdą kolejną nieudaną próbą ponad próg.</p>
            </div>
          </div>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <p className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">Lokalna symulacja w przeglądarce · kryptografia Web Crypto · wszystkie zmiany trafiają na oś czasu</p>
      </div>
    </section>
  );
};

export default SplitTokenPanel;

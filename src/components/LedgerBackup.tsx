import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LedgerEntry } from '@/lib/decisionLedger';
import { MIN_PASSPHRASE, decryptLedger, encryptLedger } from '@/lib/ledgerBackup';

const MAX_FILE_BYTES = 2_000_000;

const LedgerBackup = ({ ledger, onRestore }: { ledger: readonly LedgerEntry[]; onRestore: (l: readonly LedgerEntry[]) => void }) => {
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const backup = async () => {
    setBusy(true);
    try {
      const blob = new Blob([await encryptLedger(ledger, pass)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `alfa-ledger-${new Date().toISOString().slice(0, 19).replace(/:/g, '')}.alfa.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Zaszyfrowano kopię (${ledger.length} wpisów).`);
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const restore = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { toast.error('Plik jest za duży.'); return; }
    setBusy(true);
    try {
      const restored = await decryptLedger(await file.text(), pass);
      onRestore(restored);
      toast.success(`Odtworzono ${restored.length} wpisów — integralność łańcucha potwierdzona.`);
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  return (
    <div className="mt-5 border border-border bg-card p-4">
      <h3 className="font-semibold">Szyfrowana kopia dziennika</h3>
      <p className="mt-1 text-xs text-muted-foreground">AES-256-GCM z hasłem. Przy odtwarzaniu każdy wpis jest sprawdzany w łańcuchu — zmieniona kopia zostaje odrzucona. Hasła nie da się odzyskać.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder={`Hasło (min. ${MIN_PASSPHRASE} znaków)`} aria-label="Hasło kopii" className="sm:max-w-xs" />
        <Button variant="outline" onClick={backup} disabled={busy || !ledger.length || pass.length < MIN_PASSPHRASE}><Download />Utwórz kopię</Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy || pass.length < MIN_PASSPHRASE}><Upload />Odtwórz z kopii</Button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => restore(e.target.files?.[0])} />
      </div>
    </div>
  );
};

export default LedgerBackup;

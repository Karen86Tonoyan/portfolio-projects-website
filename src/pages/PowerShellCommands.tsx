import React, { useMemo, useState } from 'react';
import { Search, Copy, Check, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PS_CATEGORIES, powershellCommands } from '@/data/powershellCommands';

const PowerShellCommands: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return powershellCommands.filter(cmd => {
      const catMatch = category === 'all' || cmd.category === category;
      const qMatch = !q || `${cmd.command} ${cmd.description}`.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [query, category]);

  const copy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(command);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // Schowek może być niedostępny — nic nie robimy.
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8 animate-fade-in">
        <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase text-primary">
          <Terminal className="h-4 w-4" /> Narzędzia
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Komendy PowerShell</h1>
        <p className="mt-2 text-muted-foreground">
          Zbiór przydatnych komend do administracji, diagnostyki i bezpieczeństwa Windows.
          Kliknij komendę, aby ją skopiować.
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Szukaj komendy…"
          aria-label="Szukaj komendy PowerShell"
          className="pl-9 font-mono"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2" aria-label="Filtr kategorii">
        <Button size="sm" variant={category === 'all' ? 'default' : 'outline'} onClick={() => setCategory('all')}>
          Wszystkie
        </Button>
        {PS_CATEGORIES.map(c => (
          <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'} onClick={() => setCategory(c)}>
            {c}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Brak pasujących komend — zmień frazę lub kategorię.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(cmd => (
            <button
              key={cmd.command}
              onClick={() => copy(cmd.command)}
              className="group flex w-full items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
              aria-label={`Kopiuj komendę ${cmd.command}`}
            >
              <div className="min-w-0">
                <code className="break-all font-mono text-sm text-primary">{cmd.command}</code>
                <p className="mt-1 text-sm text-muted-foreground">{cmd.description}</p>
              </div>
              <span className="mt-1 shrink-0 text-muted-foreground group-hover:text-primary">
                {copied === cmd.command ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {filtered.length} z {powershellCommands.length} komend · Uruchamiaj świadomie — część wymaga uprawnień administratora.
      </p>
    </div>
  );
};

export default PowerShellCommands;

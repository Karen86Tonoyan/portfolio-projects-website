import { Bot, Network, Radar, ScanSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/** Public architecture overview of ALFA teams. States are honest: nothing here runs scans. */
const teams = [
  { icon: ScanSearch, name: 'Zespół 1 · Wejście', text: 'Łasuch przechwytuje każde wejście i przenosi je do sandboxu.', state: 'Pokaz powyżej' },
  { icon: Radar, name: 'Zespół 2 · Alerty', text: 'Zbiera alerty i dostarcza je do właściciela lub wskazanej stacji.', state: 'Wymaga agenta lokalnego' },
  { icon: Network, name: 'Zespół 3 · Sieć', text: 'Na Twoim komputerze: porty, wejścia, uruchomione usługi, kto i dokąd się łączył — na tablicę.', state: 'Wymaga agenta lokalnego' },
  { icon: Bot, name: 'Zespół 4 · Agenci', text: 'Analizuje pracę agentów: co zrobili, czy w zakresie, czy wynik da się potwierdzić.', state: 'Planowany' },
];

const AlfaTeams = () => (
  <section className="mb-5 border-b border-border" aria-labelledby="alfa-teams-title">
    <div className="container mx-auto px-4 py-6">
      <p className="font-mono text-xs uppercase text-primary">Zespoły</p>
      <h2 id="alfa-teams-title" className="mt-1 text-2xl font-semibold">Kto pilnuje czego</h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {teams.map((t) => (
          <li key={t.name} className="border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2"><t.icon className="h-5 w-5 text-primary" /><Badge variant="outline">{t.state}</Badge></div>
            <h3 className="mt-2 text-sm font-semibold">{t.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">Strona internetowa nie skanuje Twojego komputera · zespoły 2–3 działają dopiero z programem na Twoim sprzęcie</p>
    </div>
  </section>
);

export default AlfaTeams;

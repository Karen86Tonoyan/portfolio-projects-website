/** Public showcase of the modular ALFA security pipeline. Presentation only — nothing is scanned or executed. */
export interface ModuleOption {
  id: string;
  label: string;
  description: string;
}

export interface PipelineSlot {
  id: string;
  stage: string;
  title: string;
  swappable: boolean;
  options: ModuleOption[];
}

export const pipelineSlots: PipelineSlot[] = [
  {
    id: 'input', stage: '01', title: 'Wejście problemu', swappable: false,
    options: [{ id: 'input', label: 'Problem / zdarzenie', description: 'Alert, log, pytanie lub żądanie agenta trafia do systemu.' }],
  },
  {
    id: 'scan', stage: '02', title: 'Moduł skanujący', swappable: true,
    options: [
      { id: 'guardian', label: 'Guardian', description: 'Ciągłe monitorowanie stanu i anomalii.' },
      { id: 'forensics', label: 'Forensics', description: 'Analiza śladów, logów i zdarzeń.' },
      { id: 'filters', label: 'Filtry ALFA', description: 'Siedem warstw filtrów wejścia i kontekstu.' },
    ],
  },
  {
    id: 'engine', stage: '03', title: 'Silnik / algorytm', swappable: true,
    options: [
      { id: 'risk', label: 'Risk Engine', description: 'Klasyfikacja poziomu ryzyka.' },
      { id: 't9', label: 'T9 Drift', description: 'Wykrywanie wykolejeń modelu i dryfu narracji.' },
      { id: 'policy', label: 'Policy Engine', description: 'Porównanie z politykami i zakresem.' },
    ],
  },
  {
    id: 'oracle', stage: '04', title: 'Oracle', swappable: false,
    options: [{ id: 'oracle', label: 'Oracle', description: 'Odczyt wszystkich modułów, pamięci i audytu. Rekomenduje, niczego nie wykonuje.' }],
  },
  {
    id: 'analyst', stage: '05', title: 'Oddzielne AI analityczne', swappable: true,
    options: [
      { id: 'local', label: 'Model lokalny', description: 'Analiza offline-first, dane nie opuszczają sprzętu.' },
      { id: 'cloud', label: 'Model zewnętrzny', description: 'Wymienny dostawca, odizolowany od wykonania.' },
    ],
  },
  {
    id: 'decision', stage: '06', title: 'Wyjście decyzji', swappable: false,
    options: [{ id: 'decision', label: 'PASS · HOLD · BLOCK', description: 'Cerber wydaje werdykt, całość trafia do śladu audytowego.' }],
  },
];

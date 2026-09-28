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
    id: 'analyst', stage: '05', title: '2 niezależne AI analityczne', swappable: false,
    options: [{ id: 'dual', label: 'AI-A + AI-B', description: 'Dwa odizolowane modele analizują ten sam przypadek osobno. Mogą zgłosić HOLD, gdy Oracle dryfuje.' }],
  },
  {
    id: 'cerber', stage: '06', title: 'Cerber decyduje', swappable: false,
    options: [{ id: 'cerber', label: 'CERBER', description: 'Porównuje obie analizy, decyduje o wykonaniu i odpowiada za decyzję.' }],
  },
  {
    id: 'decision', stage: '07', title: 'Wyjście decyzji', swappable: false,
    options: [{ id: 'decision', label: 'PASS · HOLD · BLOCK', description: 'Guardian może zatrzymać wykonanie w każdej chwili. Całość trafia do śladu audytowego.' }],
  },
];

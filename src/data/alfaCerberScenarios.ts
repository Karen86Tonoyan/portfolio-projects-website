/** Deterministic demo scenarios for Cerber/Guardian reactions. No real models are called. */
export type AnalysisVerdict = 'PASS' | 'HOLD' | 'BLOCK';

export interface AiAnalysis {
  model: 'AI-A' | 'AI-B';
  status: 'ok' | 'failed';
  finding: string;
  evidence: string[];
  confidence: number | null;
  verdict: AnalysisVerdict | null;
}

export interface CerberScenario {
  id: 'normal' | 'drift' | 'divergent' | 'failure';
  label: string;
  description: string;
  oracleDrift: boolean;
  analyses: [AiAnalysis, AiAnalysis];
  cerberReaction: string;
  guardianReaction: string;
  holdCause: string | null;
}

export const cerberScenarios: CerberScenario[] = [
  {
    id: 'normal', label: 'Zgodne analizy', description: 'Oba modele zgodne, Oracle ugruntowany.', oracleDrift: false,
    analyses: [
      { model: 'AI-A', status: 'ok', finding: 'Brak oznak zagrożenia w alercie DEMO-104.', evidence: ['Log DEMO-104', 'Polityka tylko-odczyt'], confidence: 0.91, verdict: 'PASS' },
      { model: 'AI-B', status: 'ok', finding: 'Zdarzenie niskiego ryzyka, zgodne z polityką.', evidence: ['Log DEMO-104', 'Historia konta (demo)'], confidence: 0.88, verdict: 'PASS' },
    ],
    cerberReaction: 'PASS — konsensus obu modeli, Cerber zatwierdza i odpowiada za wykonanie.',
    guardianReaction: 'Obserwuje, bez interwencji.', holdCause: null,
  },
  {
    id: 'drift', label: 'Dryf Oracle', description: 'Oracle podaje twierdzenie bez pokrycia w źródłach.', oracleDrift: true,
    analyses: [
      { model: 'AI-A', status: 'ok', finding: 'Rekomendacja Oracle nie ma pokrycia w dokumentach.', evidence: ['Porównanie ze źródłem: 0/3 zdań'], confidence: 0.86, verdict: 'HOLD' },
      { model: 'AI-B', status: 'ok', finding: 'Wykryto dryf narracji w odpowiedzi Oracle.', evidence: ['Detektor T9: odchylenie 0,41'], confidence: 0.81, verdict: 'HOLD' },
    ],
    cerberReaction: 'HOLD — obie AI zgłosiły dryf Oracle, decyzja wstrzymana.',
    guardianReaction: 'Zatrzymuje przekazanie wyniku do runtime.', holdCause: 'Dryf Oracle: rekomendacja bez pokrycia w źródłach (demo).',
  },
  {
    id: 'divergent', label: 'Rozbieżne analizy', description: 'AI-A dopuszcza, AI-B blokuje.', oracleDrift: false,
    analyses: [
      { model: 'AI-A', status: 'ok', finding: 'Operacja mieści się w zakresie uprawnień.', evidence: ['Polityka zakresu v2 (demo)'], confidence: 0.72, verdict: 'PASS' },
      { model: 'AI-B', status: 'ok', finding: 'Brak planu wycofania — ryzyko nieodwracalnej zmiany.', evidence: ['Checklista zmian (demo)', 'Brak snapshotu'], confidence: 0.79, verdict: 'BLOCK' },
    ],
    cerberReaction: 'HOLD — brak konsensusu, Cerber nie wydaje decyzji na podstawie jednej analizy.',
    guardianReaction: 'Zatrzymuje wykonanie do rozstrzygnięcia różnic.', holdCause: 'Rozbieżne analizy: AI-A PASS vs AI-B BLOCK (demo).',
  },
  {
    id: 'failure', label: 'Awaria modelu', description: 'AI-B nie odpowiada (timeout).', oracleDrift: false,
    analyses: [
      { model: 'AI-A', status: 'ok', finding: 'Zdarzenie niskiego ryzyka.', evidence: ['Log DEMO-104'], confidence: 0.84, verdict: 'PASS' },
      { model: 'AI-B', status: 'failed', finding: 'Brak odpowiedzi — przekroczono limit czasu (demo).', evidence: [], confidence: null, verdict: null },
    ],
    cerberReaction: 'HOLD — tylko jedna analiza; Cerber wymaga dwóch niezależnych opinii.',
    guardianReaction: 'Oznacza AI-B jako niedostępne i zatrzymuje wykonanie.', holdCause: 'Awaria modelu AI-B: brak drugiej niezależnej analizy (demo).',
  },
];

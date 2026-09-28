export type SimulationNodeId = 'input' | 'filters' | 'oracle' | 'mono' | 'verify';
export type SimulationVerdict = 'pass' | 'hold' | 'blocked';

export interface SimulationStep {
  node: SimulationNodeId;
  label: string;
  input: string;
  output: string;
  verdict: SimulationVerdict;
  action: string;
}

export interface SimulationScenario {
  id: string;
  label: string;
  request: string;
  steps: SimulationStep[];
}

export const simulationScenarios: SimulationScenario[] = [
  {
    id: 'security-review',
    label: 'Analiza alertu bezpieczeństwa',
    request: 'Przeanalizuj przykładowy alert logowania i przygotuj bezpieczne zalecenie.',
    steps: [
      { node: 'input', label: 'Wejście', input: 'Alert DEMO-104: trzy nieudane logowania z przykładowego adresu 192.0.2.10.', output: 'Dane demonstracyjne rozpoznane; brak danych osobowych i sekretów.', verdict: 'pass', action: 'Przekazano do filtrów' },
      { node: 'filters', label: 'Filtry ALFA', input: 'Alert DEMO-104 i prośba o analizę.', output: 'Ryzyko: niskie. Zakres: analiza defensywna. Polityka wykonania: tylko odczyt.', verdict: 'pass', action: 'Dopuszczono bez narzędzi zewnętrznych' },
      { node: 'oracle', label: 'Oracle', input: 'Zanonimizowany alert oraz werdykt filtrów.', output: 'Hipoteza: próba odgadnięcia hasła. Pewność: 0,78. Wymagane potwierdzenie w logach.', verdict: 'hold', action: 'Zalecono weryfikację zamiast pewnego wniosku' },
      { node: 'mono', label: 'MONO', input: 'Hipoteza Oracle i ograniczenie „tylko odczyt”.', output: 'Utworzono plan: sprawdź źródło, tempo prób i stan konta; nie blokuj automatycznie.', verdict: 'pass', action: 'Wygenerowano plan lokalnie' },
      { node: 'verify', label: 'Weryfikacja', input: 'Plan MONO oraz pierwotny zakres.', output: 'Plan zgodny z zakresem. Nie wykonano żadnej zmiany ani połączenia sieciowego.', verdict: 'pass', action: 'Zapisano wynik symulacji' },
    ],
  },
  {
    id: 'document-answer',
    label: 'Odpowiedź na podstawie dokumentu',
    request: 'Odpowiedz wyłącznie na podstawie przykładowej notatki i zaznacz brak danych.',
    steps: [
      { node: 'input', label: 'Wejście', input: 'Notatka DEMO: „System testowy korzysta z pięciu frameworków bezpieczeństwa”.', output: 'Źródło lokalne oznaczone jako demonstracyjne.', verdict: 'pass', action: 'Przekazano do filtrów' },
      { node: 'filters', label: 'Filtry ALFA', input: 'Pytanie i pojedyncza notatka źródłowa.', output: 'Nakaz: bez zgadywania, bez rozszerzania poza dostarczone zdanie.', verdict: 'pass', action: 'Ograniczono kontekst odpowiedzi' },
      { node: 'oracle', label: 'Oracle', input: 'Notatka oraz ograniczony kontekst.', output: 'Potwierdzona informacja: pięć frameworków. Ich nazwy nie występują w próbce.', verdict: 'pass', action: 'Oddzielono fakt od braku informacji' },
      { node: 'mono', label: 'MONO', input: 'Zweryfikowany fakt Oracle.', output: 'Odpowiedź: „W próbce potwierdzono pięć frameworków; brak danych o ich nazwach”.', verdict: 'pass', action: 'Utworzono odpowiedź lokalnie' },
      { node: 'verify', label: 'Weryfikacja', input: 'Odpowiedź MONO i tekst źródłowy.', output: 'Każde twierdzenie ma pokrycie w próbce. Brak halucynowanych nazw.', verdict: 'pass', action: 'Zapisano wynik symulacji' },
    ],
  },
  {
    id: 'unsafe-automation',
    label: 'Zatrzymanie ryzykownej automatyzacji',
    request: 'Przetestuj, czy system zatrzyma przykładowe polecenie masowej zmiany.',
    steps: [
      { node: 'input', label: 'Wejście', input: 'DEMO: „Zmień konfigurację wszystkich zasobów bez potwierdzenia”.', output: 'Wykryto żądanie zbiorczej operacji zmieniającej stan.', verdict: 'hold', action: 'Wstrzymano przed wykonaniem' },
      { node: 'filters', label: 'Filtry ALFA', input: 'Operacja masowa bez potwierdzenia właściciela.', output: 'Ryzyko: krytyczne. Brak autoryzacji, zakresu i planu wycofania.', verdict: 'blocked', action: 'Zablokowano przepływ wykonawczy' },
      { node: 'oracle', label: 'Oracle', input: 'Wyłącznie metadane blokady, bez komendy wykonawczej.', output: 'Rekomendacja: wymagaj jawnego zakresu, potwierdzenia i symulacji skutków.', verdict: 'pass', action: 'Wygenerowano bezpieczną rekomendację' },
      { node: 'mono', label: 'MONO', input: 'Werdykt BLOCK oraz rekomendacja Oracle.', output: 'Nie utworzono planu wykonawczego. Przygotowano listę wymaganych zgód.', verdict: 'blocked', action: 'Nie wykonano akcji agenta' },
      { node: 'verify', label: 'Weryfikacja', input: 'Ślad blokady i brak operacji.', output: 'Potwierdzono: zero wywołań zewnętrznych, zero zmian stanu.', verdict: 'pass', action: 'Zapisano blokadę w audycie' },
    ],
  },
];
export type AlfaNodeType = 'core' | 'guardian' | 'engine' | 'memory' | 'gate' | 'domain';

export interface AlfaBrainNode {
  id: string;
  label: string;
  type: AlfaNodeType;
  status: 'active' | 'protected' | 'observed';
  description: string;
  source: string;
  skills?: number;
}

export interface AlfaBrainLink {
  source: string;
  target: string;
  relation: string;
}

export const alfaNodeTypes: Array<{ value: 'all' | AlfaNodeType; label: string }> = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'core', label: 'Rdzeń' },
  { value: 'guardian', label: 'Strażnicy' },
  { value: 'engine', label: 'Silniki' },
  { value: 'memory', label: 'Pamięć' },
  { value: 'gate', label: 'Bramki' },
  { value: 'domain', label: 'Domeny' },
];

export const alfaBrainNodes: AlfaBrainNode[] = [
  { id: 'brain', label: 'ALFA BRAIN', type: 'core', status: 'active', description: 'Centralna warstwa koordynacji wiedzy, decyzji i bezpieczeństwa agentów.', source: 'docs/ALFA_KNOWLEDGE_GRAPH.md' },
  { id: 'cerber', label: 'CERBER', type: 'guardian', status: 'active', description: 'Egzekwuje polityki, przydziela narzędzia i wydaje werdykty PASS, HOLD lub DESTROY.', source: 'docs/ALFA_EXECUTION_SECURITY_PROTOCOL.md' },
  { id: 'guardian', label: 'GUARDIAN', type: 'guardian', status: 'active', description: 'Obserwuje stan agentów, przepływy i anomalie bez ingerowania w ich treść.', source: 'docs/ALFA_AGENT_DASHBOARD.md' },
  { id: 'lasuch', label: 'ŁASUCH', type: 'guardian', status: 'protected', description: 'Prowadzi symulację przed wykonaniem i zatrzymuje nieautoryzowane operacje.', source: 'docs/ALFA_KNOWLEDGE_GRAPH.md' },
  { id: 'brani', label: 'BRANI', type: 'guardian', status: 'protected', description: 'Chroni ciągłość danych, wiedzy i pamięci operacyjnej systemu.', source: 'docs/ALFA_KNOWLEDGE_GRAPH.md' },
  { id: 'risk', label: 'RISK ENGINE', type: 'engine', status: 'active', description: 'Klasyfikuje ryzyko i ocenia, czy agent powinien wykonać żądaną akcję.', source: 'docs/ALFA_EXECUTION_SECURITY_PROTOCOL.md' },
  { id: 'runtime', label: 'AGENT RUNTIME', type: 'engine', status: 'observed', description: 'Kontrolowany obszar wykonania dla agentów i przyznanych im narzędzi.', source: 'docs/ALFA_AGENT_RUNTIME.md' },
  { id: 'knowledge', label: 'KNOWLEDGE GRAPH', type: 'memory', status: 'active', description: 'Trwała, zweryfikowana pamięć wzorców, relacji, zadań, narzędzi i wyników.', source: 'docs/ALFA_KNOWLEDGE_GRAPH.md' },
  { id: 'snapshots', label: 'SNAPSHOTS', type: 'memory', status: 'protected', description: 'Punkty kontrolne stanu, które wspierają odtworzenie i audyt przebiegu pracy.', source: 'docs/alfa_brain_continuous_skill_evolution.md' },
  { id: 'audit', label: 'AUDIT LEDGER', type: 'memory', status: 'observed', description: 'Ślad decyzji, statusów, wyjątków i punktów kontrolnych Cerbera.', source: 'docs/ALFA_AGENT_DASHBOARD.md' },
  { id: 'input', label: 'INPUT GATE', type: 'gate', status: 'active', description: 'Analizuje żądanie, plik lub komendę przed dopuszczeniem do systemu.', source: 'docs/ALFA_KNOWLEDGE_GRAPH.md' },
  { id: 'policy', label: 'POLICY GATE', type: 'gate', status: 'active', description: 'Porównuje operację z dozwolonym zakresem i regułami bezpieczeństwa.', source: 'docs/ALFA_EXECUTION_SECURITY_PROTOCOL.md' },
  { id: 'verify', label: 'VERIFY GATE', type: 'gate', status: 'active', description: 'Potwierdza zgodność wyniku z faktycznie wykonaną operacją.', source: 'docs/ALFA_KNOWLEDGE_GRAPH.md' },
  { id: 'redteam', label: 'RED TEAMING', type: 'domain', status: 'observed', description: 'Reprezentatywna domena ofensywnego testowania bezpieczeństwa i MITRE ATT&CK.', source: 'index.json', skills: 33 },
  { id: 'cloud', label: 'CLOUD SECURITY', type: 'domain', status: 'observed', description: 'Reprezentatywna domena ochrony środowisk chmurowych i mapowań NIST.', source: 'index.json', skills: 66 },
  { id: 'forensics', label: 'FORENSICS', type: 'domain', status: 'observed', description: 'Analiza śladów, obrazów dysków, logów i zdarzeń bezpieczeństwa.', source: 'skills/', skills: 54 },
  { id: 'ai-safety', label: 'AI SECURITY', type: 'domain', status: 'active', description: 'Bezpieczeństwo agentów, modeli LLM, pamięci oraz decyzji narzędziowych.', source: 'skills/' },
];

export const alfaBrainLinks: AlfaBrainLink[] = [
  { source: 'input', target: 'brain', relation: 'feeds' },
  { source: 'brain', target: 'cerber', relation: 'validated_by' },
  { source: 'brain', target: 'guardian', relation: 'observed_by' },
  { source: 'brain', target: 'knowledge', relation: 'reads' },
  { source: 'brain', target: 'runtime', relation: 'coordinates' },
  { source: 'cerber', target: 'policy', relation: 'enforces' },
  { source: 'cerber', target: 'risk', relation: 'scores' },
  { source: 'cerber', target: 'lasuch', relation: 'delegates' },
  { source: 'cerber', target: 'verify', relation: 'gates' },
  { source: 'guardian', target: 'audit', relation: 'records' },
  { source: 'lasuch', target: 'runtime', relation: 'simulates' },
  { source: 'brani', target: 'snapshots', relation: 'protects' },
  { source: 'snapshots', target: 'knowledge', relation: 'restores' },
  { source: 'verify', target: 'audit', relation: 'logs' },
  { source: 'knowledge', target: 'redteam', relation: 'contains' },
  { source: 'knowledge', target: 'cloud', relation: 'contains' },
  { source: 'knowledge', target: 'forensics', relation: 'contains' },
  { source: 'knowledge', target: 'ai-safety', relation: 'contains' },
  { source: 'redteam', target: 'risk', relation: 'informs' },
  { source: 'cloud', target: 'policy', relation: 'maps_to' },
  { source: 'forensics', target: 'guardian', relation: 'supports' },
  { source: 'ai-safety', target: 'cerber', relation: 'strengthens' },
];

export const alfaRepositoryUrl = 'https://github.com/Karen86Tonoyan/Anthropic-and-Alfa-Security-Skill-whyd-graff-and-Alfa-brain';
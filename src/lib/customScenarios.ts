import { z } from 'zod';
import type { SimulationNodeId, SimulationScenario } from '@/data/alfaSimulation';

/** Browser-local storage for user-authored Golden Orb scenarios. Never sent anywhere. */
const STORAGE_KEY = 'alfa-golden-orb-custom-scenarios-v1';
export const MAX_CUSTOM_SCENARIOS = 30;
export const CUSTOM_PREFIX = 'custom-';

export const scenarioNodes: { node: SimulationNodeId; label: string }[] = [
  { node: 'input', label: 'Wejście' },
  { node: 'filters', label: 'Filtry ALFA' },
  { node: 'oracle', label: 'Oracle' },
  { node: 'mono', label: 'MONO' },
  { node: 'verify', label: 'Weryfikacja' },
];

const text = (max: number) => z.string().trim().min(1, 'Pole wymagane').max(max, `Maksymalnie ${max} znaków`);

export const stepSchema = z.object({
  node: z.enum(['input', 'filters', 'oracle', 'mono', 'verify']),
  label: text(40),
  input: text(500),
  output: text(500),
  verdict: z.enum(['pass', 'hold', 'blocked']),
  action: text(160),
});

export const scenarioSchema = z.object({
  id: z.string().startsWith(CUSTOM_PREFIX).max(80),
  label: text(80),
  request: text(500),
  steps: z.array(stepSchema).length(5),
});

export const isCustomScenario = (id: string) => id.startsWith(CUSTOM_PREFIX);

export const loadCustomScenarios = (): SimulationScenario[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = z.array(scenarioSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.slice(0, MAX_CUSTOM_SCENARIOS) as SimulationScenario[] : [];
  } catch {
    return [];
  }
};

export const saveCustomScenarios = (scenarios: SimulationScenario[]): boolean => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios.slice(0, MAX_CUSTOM_SCENARIOS)));
    return true;
  } catch {
    return false;
  }
};

export const createEmptyScenario = (): SimulationScenario => ({
  id: `${CUSTOM_PREFIX}${Date.now().toString(36)}`,
  label: '',
  request: '',
  steps: scenarioNodes.map(({ node, label }) => ({ node, label, input: '', output: '', verdict: 'pass', action: '' })),
});

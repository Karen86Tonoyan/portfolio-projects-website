/** In-memory event bus joining gateway, Cerber, Guardian, HOLD and operator events into one incident timeline (demo). */
export type IncidentSource = 'Brama' | 'Cerber' | 'Guardian' | 'HOLD' | 'Operator' | 'Tokeny';
export type IncidentSeverity = 'info' | 'warning' | 'critical';

export interface IncidentEvent {
  id: number;
  at: string;
  source: IncidentSource;
  type: string;
  message: string;
  severity: IncidentSeverity;
}

type Listener = (events: readonly IncidentEvent[]) => void;
const MAX_EVENTS = 500;
let events: readonly IncidentEvent[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

export const publishIncident = (e: Omit<IncidentEvent, 'id' | 'at'>) => {
  events = [...events, Object.freeze({ ...e, id: nextId++, at: new Date().toISOString() })].slice(-MAX_EVENTS);
  listeners.forEach((l) => l(events));
};

export const subscribeIncidents = (l: Listener) => { listeners.add(l); l(events); return () => { listeners.delete(l); }; };
export const clearIncidents = () => { events = []; listeners.forEach((l) => l(events)); };

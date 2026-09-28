import type { LucideIcon } from 'lucide-react';
import { Bot, Filter, MessageSquareText, Workflow } from 'lucide-react';

export type AlfaConnectionId = 'filters' | 'chats' | 'agents' | 'n8n';
export type AlfaConnectionState = 'connected' | 'degraded' | 'disconnected' | 'checking';

export interface AlfaConnectionDefinition {
  id: AlfaConnectionId;
  label: string;
  icon: LucideIcon;
  initialState: Exclude<AlfaConnectionState, 'checking'>;
  statusLabel: string;
  detail: string;
  retryable: boolean;
  retryFailure?: string;
}

export const alfaConnections: AlfaConnectionDefinition[] = [
  {
    id: 'filters',
    label: 'Filtry ALFA',
    icon: Filter,
    initialState: 'connected',
    statusLabel: 'Aktywne lokalnie',
    detail: 'Siedem warstw filtrów jest dostępnych w schemacie ALFA Brain.',
    retryable: false,
  },
  {
    id: 'chats',
    label: 'Czaty',
    icon: MessageSquareText,
    initialState: 'degraded',
    statusLabel: 'Oczekuje na źródło',
    detail: 'Kanały są odwzorowane w grafie, ale nie wskazano źródła rozmów.',
    retryable: true,
    retryFailure: 'Nie znaleziono skonfigurowanego źródła rozmów. Dodaj połączenie, aby wznowić odbiór.',
  },
  {
    id: 'agents',
    label: 'Agenci',
    icon: Bot,
    initialState: 'degraded',
    statusLabel: 'Tylko schemat',
    detail: 'Mono Agent i Oracle są widoczne, lecz wykonawczy runtime agentów nie jest podłączony.',
    retryable: true,
    retryFailure: 'Runtime agentów nie odpowiada, ponieważ nie został jeszcze skonfigurowany.',
  },
  {
    id: 'n8n',
    label: 'n8n',
    icon: Workflow,
    initialState: 'disconnected',
    statusLabel: 'Niepołączone',
    detail: 'Węzeł n8n jest częścią topologii, ale nie ma autoryzowanego połączenia wykonawczego.',
    retryable: true,
    retryFailure: 'Brak autoryzowanego połączenia n8n. Ponawianie nie uruchomi workflow bez konfiguracji.',
  },
];
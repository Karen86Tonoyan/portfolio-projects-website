import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

export type NotifyEvent = 'HOLD_RAISED' | 'ACTION_STOPPED' | 'HOLD_RESOLVED';
export type NotifyRole = 'admin' | 'analyst' | 'observer';
export type NotifyConfig = Record<NotifyEvent, NotifyRole[]>;

export interface AlfaNotification { id: string; event: NotifyEvent; message: string; time: string; recipients: NotifyRole[] }

export const eventLabels: Record<NotifyEvent, string> = { HOLD_RAISED: 'Nowe zgłoszenie HOLD', ACTION_STOPPED: 'Zatrzymana akcja', HOLD_RESOLVED: 'Rozstrzygnięcie blokady' };
export const roleLabels: Record<NotifyRole, string> = { admin: 'Administrator', analyst: 'Analityk', observer: 'Obserwator' };
export const defaultNotifyConfig: NotifyConfig = { HOLD_RAISED: ['admin', 'analyst'], ACTION_STOPPED: ['admin'], HOLD_RESOLVED: ['admin', 'analyst', 'observer'] };

interface Props { config: NotifyConfig; onChange: (c: NotifyConfig) => void; items: AlfaNotification[] }

const HoldNotifications = ({ config, onChange, items }: Props) => {
  const toggle = (event: NotifyEvent, role: NotifyRole, on: boolean) =>
    onChange({ ...config, [event]: on ? [...config[event], role] : config[event].filter((r) => r !== role) });

  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-semibold"><Bell className="h-4 w-4 text-primary" />Powiadomienia</h3><Badge variant="outline">{items.length}</Badge></div>
      <table className="mt-3 w-full text-xs">
        <thead><tr className="text-muted-foreground"><th className="py-1 text-left font-normal">Zdarzenie</th>{(Object.keys(roleLabels) as NotifyRole[]).map((r) => <th key={r} className="py-1 font-normal">{roleLabels[r]}</th>)}</tr></thead>
        <tbody>
          {(Object.keys(eventLabels) as NotifyEvent[]).map((e) => (
            <tr key={e} className="border-t border-border">
              <td className="py-2">{eventLabels[e]}</td>
              {(Object.keys(roleLabels) as NotifyRole[]).map((r) => (
                <td key={r} className="py-2 text-center"><Checkbox checked={config[e].includes(r)} onCheckedChange={(v) => toggle(e, r, v === true)} aria-label={`${eventLabels[e]} — ${roleLabels[r]}`} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ScrollArea className="mt-3 h-40 border border-border bg-background">
        {items.length ? (
          <ul className="divide-y divide-border">
            {[...items].reverse().map((n) => (
              <li key={n.id} className="p-2 text-xs">
                <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-muted-foreground">{n.time}</span><Badge variant="outline">{eventLabels[n.event]}</Badge></div>
                <p className="mt-1">{n.message}</p>
                <p className="mt-1 text-muted-foreground">Do: {n.recipients.length ? n.recipients.map((r) => roleLabels[r]).join(', ') : 'nikt (brak odbiorców)'}</p>
              </li>
            ))}
          </ul>
        ) : <p className="p-4 text-center text-xs text-muted-foreground">Brak powiadomień.</p>}
      </ScrollArea>
      <p className="mt-2 text-[10px] text-muted-foreground">Lokalna symulacja — powiadomienia nie są wysyłane poza stronę.</p>
    </div>
  );
};

export default HoldNotifications;

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { SimulationScenario, SimulationStep, SimulationVerdict } from '@/data/alfaSimulation';
import { scenarioSchema } from '@/lib/customScenarios';

interface Props {
  open: boolean;
  initial: SimulationScenario | null;
  onOpenChange: (open: boolean) => void;
  onSave: (scenario: SimulationScenario) => void;
}

const ScenarioEditorDialog = ({ open, initial, onOpenChange, onSave }: Props) => {
  const [draft, setDraft] = useState<SimulationScenario | null>(initial);
  const [error, setError] = useState<string>();

  useEffect(() => { setDraft(initial); setError(undefined); }, [initial, open]);
  if (!draft) return null;

  const updateStep = (index: number, patch: Partial<SimulationStep>) =>
    setDraft({ ...draft, steps: draft.steps.map((step, i) => (i === index ? { ...step, ...patch } : step)) });

  const submit = () => {
    const result = scenarioSchema.safeParse(draft);
    if (!result.success) {
      const issue = result.error.issues[0];
      const path = issue.path[0] === 'steps' ? `Krok ${Number(issue.path[1]) + 1}, pole ${String(issue.path[2])}` : String(issue.path[0]);
      setError(`${path}: ${issue.message}`);
      return;
    }
    onSave(result.data as SimulationScenario);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="alfa-brain-theme max-h-[90vh] max-w-3xl overflow-y-auto bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Własny scenariusz symulacji</DialogTitle>
          <DialogDescription>Scenariusz zapisuje się tylko w tej przeglądarce. Nie uruchamia agentów ani akcji zewnętrznych.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-1 text-sm"><span>Nazwa</span><Input value={draft.label} maxLength={80} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /></label>
          <label className="block space-y-1 text-sm"><span>Przykładowe żądanie</span><Textarea value={draft.request} maxLength={500} onChange={(e) => setDraft({ ...draft, request: e.target.value })} /></label>
          {draft.steps.map((step, index) => (
            <fieldset key={step.node} className="space-y-2 border border-border p-3">
              <legend className="px-1 font-mono text-xs uppercase text-primary">Krok {index + 1} · {step.label}</legend>
              <Textarea placeholder="Dane odebrane" value={step.input} maxLength={500} onChange={(e) => updateStep(index, { input: e.target.value })} />
              <Textarea placeholder="Wynik węzła" value={step.output} maxLength={500} onChange={(e) => updateStep(index, { output: e.target.value })} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input placeholder="Akcja (opis)" value={step.action} maxLength={160} onChange={(e) => updateStep(index, { action: e.target.value })} />
                <Select value={step.verdict} onValueChange={(v) => updateStep(index, { verdict: v as SimulationVerdict })}>
                  <SelectTrigger className="sm:w-36" aria-label={`Werdykt kroku ${index + 1}`}><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pass">PASS</SelectItem><SelectItem value="hold">HOLD</SelectItem><SelectItem value="blocked">BLOCK</SelectItem></SelectContent>
                </Select>
              </div>
            </fieldset>
          ))}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Anuluj</Button>
          <Button onClick={submit}><Save />Zapisz scenariusz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioEditorDialog;

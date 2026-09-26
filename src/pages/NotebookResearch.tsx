import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Headphones, Video, ExternalLink, Search, X } from 'lucide-react';
import notebooks from '@/data/notebooks.json';
import { notebookMedia } from '@/data/notebookMedia';

interface Notebook { id: string; icon: string; title: string; date: string; sources: string }

const CATEGORY_RULES: [string, RegExp][] = [
  ['AI Security', /secur|bezpiecz|cerber|guardian|shield|exploit|attack|atak|injection|defen|audit|privacy|łasuch/i],
  ['LLM & AI', /\bai\b|llm|model|agent|prompt|token|gpt|claude|gemini|neural|automation|alfa/i],
  ['Psychologia', /psych|relation|relacj|honor|emoc|emotion|życi|mind|umysł|granic|wolnoś|sumieni/i],
  ['Technologia', /gpu|hardware|cloud|code|kod|github|software|system|browser|web|api|rendering/i],
  ['Twórczość', /story|book|książ|kronik|game|gra|film|video|crimson|silence|antychryst|baranka/i],
];
const categorize = (t: string) => CATEGORY_RULES.find(([, r]) => r.test(t))?.[0] ?? 'Inne';
type Media = { kind: 'pdf' | 'audio' | 'video'; url: string; title: string };

const NotebookResearch: React.FC = () => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Wszystkie');
  const [media, setMedia] = useState<Media | null>(null);

  const list = useMemo(() => (notebooks as Notebook[]).map(n => ({ ...n, category: categorize(n.title) })), []);
  const cats = useMemo(() => ['Wszystkie', ...Array.from(new Set(list.map(n => n.category)))], [list]);
  const filtered = list.filter(n =>
    (cat === 'Wszystkie' || n.category === cat) && n.title.toLowerCase().includes(q.trim().toLowerCase()));

  const open = (m: Media) => { setMedia(m); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Badania NotebookLM</h1>
        <p className="text-muted-foreground mb-8">
          {list.length} notatników badawczych Karena Tonoyana — AI security, LLM, psychologia, technologia i twórczość.
        </p>

        {media && (
          <div className="mb-8 rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between gap-2 p-3 bg-muted">
              <span className="font-medium text-foreground truncate">{media.title}</span>
              <Button size="sm" variant="outline" onClick={() => setMedia(null)} aria-label="Zamknij"><X className="h-4 w-4" /></Button>
            </div>
            {media.kind === 'pdf' && <iframe src={media.url} title={media.title} className="w-full h-[80vh]" />}
            {media.kind === 'audio' && <audio src={media.url} controls className="w-full p-4" />}
            {media.kind === 'video' && <video src={media.url} controls className="w-full max-h-[80vh] bg-background" />}
          </div>
        )}

        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Szukaj badania…" className="pl-9" maxLength={100} />
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {cats.map(c => (
            <Button key={c} size="sm" variant={cat === c ? 'default' : 'outline'} onClick={() => setCat(c)}>
              {c} <span className="ml-1 opacity-60">{c === 'Wszystkie' ? list.length : list.filter(n => n.category === c).length}</span>
            </Button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(n => {
            const m = notebookMedia[n.id] ?? {};
            return (
              <Card key={n.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{n.category}</Badge>
                    <span className="text-xl">{n.icon}</span>
                  </div>
                  <CardTitle className="text-base leading-snug">{n.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{n.date} · {n.sources}</p>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  {m.summary && <p className="text-sm text-muted-foreground">{m.summary}</p>}
                  <div className="flex flex-wrap gap-2">
                    {m.pdfUrl && <Button size="sm" onClick={() => open({ kind: 'pdf', url: m.pdfUrl!, title: n.title })}><FileText className="h-4 w-4 mr-1" />PDF</Button>}
                    {m.audioUrl && <Button size="sm" variant="secondary" onClick={() => open({ kind: 'audio', url: m.audioUrl!, title: n.title })}><Headphones className="h-4 w-4 mr-1" />Audio</Button>}
                    {m.videoUrl && <Button size="sm" variant="secondary" onClick={() => open({ kind: 'video', url: m.videoUrl!, title: n.title })}><Video className="h-4 w-4 mr-1" />Wideo</Button>}
                    <a href={`https://notebooklm.google.com/notebook/${n.id}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline"><ExternalLink className="h-4 w-4 mr-1" />NotebookLM</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Brak wyników.</p>}
      </div>
    </div>
  );
};

export default NotebookResearch;

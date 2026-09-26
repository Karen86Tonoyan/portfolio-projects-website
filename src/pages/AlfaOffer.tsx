import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, KeyRound, Brain, Network, FileSearch, Cpu, Mail, CheckCircle2 } from 'lucide-react';

const pillars = [
  { icon: Eye, name: 'Guardian', desc: 'Ciągle skanuje system, sieć i rozmowy z AI.' },
  { icon: Shield, name: 'Cerber', desc: 'Egzekwuje polityki bezpieczeństwa na całym sprzęcie.' },
  { icon: Lock, name: 'Łasuch', desc: 'Zamyka i odcina nieautoryzowane dostępy.' },
  { icon: KeyRound, name: 'Brani', desc: 'Pilnuje, by dane i pamięć nigdy nie zginęły.' },
];

const tech = [
  { icon: FileSearch, title: 'Rygorystyczne filtry AI', desc: 'Model musi przeczytać dokumenty, zanim odpowie. Zero zgadywania, zero halucynacji.' },
  { icon: Brain, title: 'Snapshoty pamięci', desc: 'Autorskie metody zapisu i odtwarzania stanu pamięci operacyjnej agenta.' },
  { icon: Cpu, title: 'T9 anty-dryf', desc: 'Wykrywa moment, w którym model się wykoleja, i podaje mu właściwe słowa.' },
  { icon: Network, title: 'Grafy wiedzy', desc: 'Stale skanowane przez algorytmy — źródło prawdy dla agentów.' },
];

const offers = [
  { name: 'Audyt bezpieczeństwa AI', points: ['Analiza promptów, agentów i workflow', 'Test podatności (NDI, prompt injection)', 'Raport z rekomendacjami'] },
  { name: 'Wdrożenie filtrów ALFA', points: ['7 filtrów: wejście, kontekst, polityki, pamięć, ryzyko, wykonanie, audyt', 'Tryb offline-first', 'Ślad audytowy każdej decyzji'] },
  { name: 'Ochrona sprzętu — Cerber Suite', points: ['Guardian, Cerber, Łasuch, Brani', 'Narzędzia open source do obrony przed atakami', 'Ochrona w czacie i na komputerze'] },
  { name: 'Lokalna infrastruktura AI', points: ['Ollama / modele lokalne', 'Agenci z kontrolą decyzji', 'Integracja z Twoimi systemami'] },
];

const AlfaOffer: React.FC = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-5xl mx-auto">
      <section className="text-center mb-16 animate-fade-in">
        <Badge variant="outline" className="mb-4">ALFA Security · Nowa oferta</Badge>
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4">
          AI, które <span className="text-primary">nie zgaduje</span>.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Gdy inni klikali prompty do czatu, my budowaliśmy kontrolowaną infrastrukturę AI — lokalną, audytowalną,
          warstwową i odporną na chaos automatyzacji.
        </p>
        <p className="mt-6 text-foreground font-medium">
          Nie pytamy tylko „czy model umie to zrobić” — pytamy „czy powinien”.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <a href="mailto:kontakt@karentonoyan.pl?subject=Oferta%20ALFA"><Button size="lg"><Mail className="h-4 w-4 mr-2" />Zapytaj o ofertę</Button></a>
          <a href="/research"><Button size="lg" variant="outline">Zobacz badania</Button></a>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Autorski silnik ALFA</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {tech.map(t => (
            <Card key={t.title}>
              <CardHeader>
                <t.icon className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t.title}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Straż Twojego sprzętu</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pillars.map(p => (
            <div key={p.name} className="p-5 rounded-lg border border-border bg-card text-center">
              <p.icon className="h-7 w-7 text-primary mx-auto mb-3" />
              <div className="font-semibold text-foreground">{p.name}</div>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Oferta</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {offers.map(o => (
            <Card key={o.name} className="border-primary/20">
              <CardHeader><CardTitle className="text-lg">{o.name}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {o.points.map(pt => (
                  <div key={pt} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{pt}
                  </div>
                ))}
                <p className="text-sm font-medium text-foreground pt-2">Wycena indywidualna</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center p-8 rounded-lg border border-primary/30 bg-primary/5">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Fundament już stoi.</h2>
        <p className="text-muted-foreground mb-6">Napisz — przygotujemy rozwiązanie pod Twoją firmę.</p>
        <a href="mailto:kontakt@karentonoyan.pl?subject=Oferta%20ALFA"><Button size="lg">kontakt@karentonoyan.pl</Button></a>
      </section>
    </div>
  </div>
);

export default AlfaOffer;

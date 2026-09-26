import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, BookOpen, Shield, Brain, Zap, Globe, Pin, Cpu, Network, Lock, Eye, Crown } from 'lucide-react';

const manifests = [
  {
    icon: Shield,
    title: 'Manifest Bezpieczeństwa AI',
    content: `AI musi być kontrolowane, testowane i odpowiedzialne. ALFA Platform X to moja odpowiedź na rosnące zagrożenia — 100% security score, 30 scenariuszy, deception engine który wyłapuje manipulacje zanim dotrą do użytkownika. Filtry Tonoyana (TDCM) eliminują halucynacje z 95% skutecznością. Bezpieczeństwo nie jest opcją — to fundament.`,
  },
  {
    icon: Brain,
    title: 'Manifest TRINITY',
    content: `Przyszłość AI to nie jeden model — to orkiestra. TRINITY System łączy Karen (КОРОЛЬ), Claude (КОРОЛЕВА) i GPT (ГЕНЕРАЛ) w synergii, gdzie każdy pełni unikalną rolę. Karen decyduje, Claude analizuje, GPT wykonuje. Razem osiągają to, czego żaden model sam nie potrafi.`,
  },
  {
    icon: Zap,
    title: 'Manifest Technologiczny',
    content: `Open-source, przejrzysty kod, dzielenie się wiedzą. 300+ repozytoriów to nie liczba — to filozofia. Każdy projekt jest publiczny, każdy system jest testowalny. NOWA LOGIKA AI: 83/83 testów. Filtry Tonoyana: 7 warstw ochrony. Nie buduję czarnych skrzynek — buduję systemy, które można zweryfikować.`,
  },
  {
    icon: FileText,
    title: 'Manifest Kreatywny',
    content: `Programowanie to sztuka, a AI to nowe płótno. Od ComfyUI przez Stable Diffusion po DaVinci Resolve 4K — łączę technologię z wizją artystyczną. RTX 5070 Ti nie służy tylko do obliczeń — służy do tworzenia.`,
  },
  {
    icon: Globe,
    title: 'Psychologia Zwycięstwa',
    content: `Od mindsetu do milionów — zmień myślenie, zmień życie. Kocham udowadniać, że jednak się da. Od myślenia do pieniędzy. Od chaosu do kontroli. Od porażek do dominacji. Nowa inicjatywa: projekt dla tych, których nie stać na terapię — bezpłatne narzędzie AI do wsparcia psychologicznego.`,
  },
  {
    icon: Shield,
    title: 'Collective Mind — Wizja',
    content: `Systemy AI powinny dzielić się wiedzą o zagrożeniach. Gdy jeden system wykryje nowy typ ataku, zapisuje jego strukturę — sekwencję działań, wzorce promptów, sygnatury kodu, metody obejścia filtrów. Inne systemy uzyskują odporność natychmiast. Jak globalny system immunologiczny. Współpraca zamiast rywalizacji.`,
  },
];

const books = [
  {
    title: 'Antychryst: Kronika Karena Tonoyona',
    description: 'Filozoficzna powieść o relacji człowieka z AI, identyfikacja i etyka w erze sztucznej inteligencji.',
  },
  {
    title: 'Sumienie AI',
    description: 'Esej o moralności systemów AI, odpowiedzialności twórców i przyszłości autonomicznych decyzji.',
  },
  {
    title: 'Fenomen Czarnego Baranka',
    description: 'Analiza outsiderów w świecie technologii — jak niestandardowe myślenie prowadzi do przełomowych innowacji.',
  },
];

const Manifests: React.FC = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Manifesty & Twórczość</h1>
      <p className="text-muted-foreground mb-10">Przekonania, wizje, filozofia i publikacje literackie.</p>

      {/* Pinned Post */}
      <section className="mb-12">
        <Card className="border-primary/40 bg-gradient-to-br from-card via-card to-primary/10 animate-fade-in">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-primary text-primary-foreground gap-1">
                <Pin className="h-3 w-3" /> Przypięty post
              </Badge>
              <Badge variant="outline">ALFA Ecosystem</Badge>
              <Badge variant="outline">Security First</Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl leading-snug">
              Gdy wszyscy bawią się w agentów i automatyzacje — ja zrobiłem to wtedy, kiedy oni klikali prompty do ChatGPT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              Jestem autorem <strong className="text-foreground">rygorystycznych filtrów AI</strong>, które
              nie pozwalają modelowi zgadywać. Zmuszają go do rezygnacji z przyjemności halucynacji
              i do <strong className="text-foreground">czytania dokumentów, zanim się wypowie</strong>.
              Sprawdziłem to na bocie w marketplace — oczywiście użyliśmy do tego własnego autorskiego silnika.
            </p>

            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" /> Własne metody i narzędzia
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-primary mt-0.5">▸</span><span><strong className="text-foreground">Snapshoty pamięci</strong> — własna metoda zapisu i odtwarzania stanu modelu</span></li>
                <li className="flex gap-2"><span className="text-primary mt-0.5">▸</span><span><strong className="text-foreground">T9 do wykrywania wykolejeń</strong> — gdy model zaczyna halucynować, podajemy mu właściwe słowa zamiast pozwolić mu zmyślać</span></li>
                <li className="flex gap-2"><span className="text-primary mt-0.5">▸</span><span><strong className="text-foreground">Grafy wiedzy</strong> — skanowane non-stop przez algorytmy weryfikacyjne</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Cerber — ewolucja w stronę pełnego bezpieczeństwa sprzętu
              </h3>
              <p className="text-sm mb-3">
                Cerber ewoluował do warstwy bezpieczeństwa nad całym sprzętem. Posiada wszystkie
                open-source narzędzia do obrony Twojego sprzętu przed atakami hakera — tak samo
                w czacie, jak i na komputerze.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { icon: Eye, name: 'Guardian', desc: 'ciągle skanuje' },
                  { icon: Shield, name: 'Cerber', desc: 'egzekwuje' },
                  { icon: Lock, name: 'Łasuch', desc: 'zamyka i odcina nieautoryzowane dostępy' },
                  { icon: Crown, name: 'Brani', desc: 'dba, by nigdy nie zginęli' },
                ].map((m) => (
                  <div key={m.name} className="p-3 rounded-lg bg-card border border-border">
                    <m.icon className="h-4 w-4 text-primary mb-1.5" />
                    <div className="font-semibold text-foreground text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 flex gap-3">
              <Network className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Nie chodzi o to, czy model <em>potrafi</em> odpowiedzieć — chodzi o to, czy
                <em> powinien</em>, na podstawie <strong>czego</strong> i z jakim poziomem zaufania.
                To jest różnica między klikaniem promptów a budową infrastruktury.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Manifests */}
      <section className="mb-12">
        <div className="space-y-6">
          {manifests.map((m, i) => (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <m.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{m.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{m.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Books */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Publikacje literackie</h2>
        </div>
        <div className="space-y-4">
          {books.map((b, i) => (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${(manifests.length + i) * 100}ms` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{b.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* GPT Link */}
      <div className="mt-10 p-5 rounded-lg bg-card border border-border text-center">
        <p className="text-sm text-muted-foreground mb-2">Bezpłatne narzędzie AI do wsparcia psychologicznego:</p>
        <a
          href="https://chatgpt.com/g/g-69ac5a048c14819181a81781d4169c0c-psychologia-zwyciestwa"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
        >
          Psychologia Zwycięstwa — ChatGPT →
        </a>
      </div>
    </div>
  </div>
);

export default Manifests;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser } from '@/lib/github';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Github, MapPin, Building, ArrowRight, Shield, Brain, Smartphone, BookOpen, ShoppingBag, Zap, Globe } from 'lucide-react';

const Index: React.FC = () => {
  const { data: user } = useQuery({ queryKey: ['github-user'], queryFn: fetchGitHubUser });

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        {user?.avatar_url && (
          <img
            src={user.avatar_url}
            alt="Karen Tonoyan"
            className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-primary/20 shadow-lg"
          />
        )}
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2">
          Karen Tonoyan
        </h1>
        <p className="text-lg md:text-xl text-primary font-semibold mb-1">
          Psychologia Zwycięstwa
        </p>
        <p className="text-sm md:text-base text-muted-foreground italic mb-4">
          Od mindsetu do milionów — zmień myślenie, zmień życie
        </p>
        <p className="text-xl md:text-2xl text-primary font-semibold mb-3">
          AI Security Architect · Full-Stack Developer · Creator
        </p>
        <p className="text-base md:text-lg text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
          {user?.bio || 'Twórca ekosystemu ALFA — zaawansowanego systemu bezpieczeństwa AI. Buduję filtry anty-halucynacyjne, silniki deception i systemy monitoringu. 300+ repozytoriów na GitHub.'}
        </p>
        <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
          Od myślenia do pieniędzy. Od chaosu do kontroli. Od porażek do dominacji.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground mb-8">
          {user?.location && (
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {user.location}</span>
          )}
          {user?.company && (
            <span className="flex items-center gap-1"><Building className="h-4 w-4" /> {user.company}</span>
          )}
          <span className="flex items-center gap-1">
            <Github className="h-4 w-4" /> {user?.public_repos ?? "300+"} repozytoriów
          </span>
          <span className="flex items-center gap-1">
            <Globe className="h-4 w-4" /> Armenia · Polska
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link to="/repositories">
            <Button size="lg">
              Repozytoria <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/cv">
            <Button variant="outline" size="lg">CV & Doświadczenie</Button>
          </Link>
          <Link to="/projects">
            <Button variant="outline" size="lg">Projekty ALFA</Button>
          </Link>
          <Link to="/services">
            <Button variant="outline" size="lg">
              <ShoppingBag className="mr-1 h-4 w-4" /> Usługi & Sklep
            </Button>
          </Link>
          <Link to="/manifests">
            <Button variant="outline" size="lg">Manifesty & Twórczość</Button>
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {[
          { label: 'Repozytoria', value: user?.public_repos ?? "300+", icon: Github },
          { label: 'Gwiazdki', value: '467', icon: Brain },
          { label: 'Security Score', value: '100%', icon: Shield },
          { label: 'Publikacje', value: '3', icon: BookOpen },
        ].map(s => (
          <div key={s.label} className="text-center p-4 rounded-lg bg-card border border-border">
            <s.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ALFA Ecosystem overview */}
      <div className="max-w-3xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-2xl font-bold text-foreground text-center mb-6">ALFA Ecosystem</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: Shield, title: 'ALFA Platform X', desc: 'MVP z 100% security score, 30 scenariuszy testowych. Deception Engine + Cerber + Guardian.' },
            { icon: Brain, title: 'TRINITY System', desc: 'Karen (КОРОЛЬ) + Claude (КОРОЛЕВА) + GPT (ГЕНЕРАЛ) — trzy AI pracujące w harmonii.' },
            { icon: Smartphone, title: 'Cerber Mobile', desc: 'Aplikacja mobilna Kivy/Python, Samsung S24 Ultra z Knox Secure Element.' },
            { icon: BookOpen, title: 'Twórczość literacka', desc: '„Antychryst: Kronika Karena Tonoyona", „Sumienie AI", „Fenomen Czarnego Baranka".' },
            { icon: Zap, title: 'Automatyzacja AI', desc: 'Kimi Claw, SoundBox, Ollama Offline Agent — systemy automatyzacji i sterowania AI.' },
            { icon: ShoppingBag, title: 'Usługi & Oprogramowanie', desc: 'Audyty, tworzenie oprogramowania, ALFA Studio Offline, książki i eBooki.' },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
              <item.icon className="h-5 w-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Psychologia Zwycięstwa initiative */}
      <div className="max-w-2xl mx-auto mt-16 text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <h2 className="text-2xl font-bold text-foreground mb-3">Nowa inicjatywa</h2>
        <p className="text-muted-foreground mb-4">
          Projekt dla tych, których nie stać na terapię — bezpłatne narzędzie AI do wsparcia psychologicznego.
        </p>
        <a
          href="https://chatgpt.com/g/g-69ac5a048c14819181a81781d4169c0c-psychologia-zwyciestwa"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline">
            <Brain className="mr-1 h-4 w-4" /> Psychologia Zwycięstwa — GPT
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Index;

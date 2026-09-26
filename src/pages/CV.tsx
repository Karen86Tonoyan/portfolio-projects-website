import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap, Code, Shield, Brain, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const experience = [
  {
    role: 'AI Security Architect & Founder',
    company: 'ALFA Ecosystem',
    period: '2023 — Obecnie',
    description: 'Projektowanie i budowanie ekosystemu bezpieczeństwa AI: ALFA Platform X (100% security score, 30 scenariuszy), Cerber Security Engine, Guardian Monitoring, ATLAS Architecture. Tworzenie filtrów anty-halucynacyjnych (FILTRY TONOYANA v1.0 — 7 filtrów, 95% niezawodność, TDCM).',
  },
  {
    role: 'AI Logic & Testing Engineer',
    company: 'NOWA LOGIKA AI v2.0.0-ENTERPRISE',
    period: '2023 — Obecnie',
    description: '83/83 testy zaliczone. Dual-gate filter, harmonic mean confidence scoring. Budowanie AI Security Dataset wg OWASP LLM Top 10 (pipeline: Grok → Gemini → Claude → Karen).',
  },
  {
    role: 'Full-Stack Developer',
    company: 'WordPress & Web Projects',
    period: '2022 — Obecnie',
    description: 'ALFA AI WordPress Manager PRO (40+ REST API endpoints), ALFA Claude Bot plugin, Trinity Workspace dashboard (Claude + GPT + Perplexity + Gemini). Zarządzanie karentonoyan.pl i alfaplatformx.com (Cloudflare + Domenomania).',
  },
  {
    role: 'Video & AI Pipeline Engineer',
    company: 'Projekty kreatywne',
    period: '2024 — Obecnie',
    description: 'ComfyUI, Windows native (RTX 5070 Ti). Pipeline: Wav2Lip 2.1, Stable Diffusion, DaVinci Resolve 4K. Produkcja treści AI-driven.',
  },
  {
    role: 'Mobile Security Developer',
    company: 'Cerber Mobile',
    period: '2024 — Obecnie',
    description: 'Aplikacja mobilna Cerber Security w Kivy/Python. Platforma: Samsung S24 Ultra z Knox Secure Element.',
  },
];

const skills = [
  'Python', 'TypeScript', 'Kotlin', 'React', 'Node.js',
  'Tailwind CSS', 'WordPress REST API', 'Docker', 'PostgreSQL',
  'AI/ML Security', 'Prompt Engineering', 'OWASP LLM Top 10',
  'Deception Engineering', 'ComfyUI', 'Stable Diffusion',
  'Kivy', 'Git/GitHub', 'CI/CD', 'Cloudflare', 'DaVinci Resolve',
];

const systems = [
  'ALFA Platform X', 'Cerber Security Engine', 'Guardian Monitoring',
  'ATLAS Architecture', 'TRINITY System', 'FILTRY TONOYANA v1.0',
  'NOWA LOGIKA AI v2.0.0', 'karen1986bot',
];

const CV: React.FC = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">CV & Doświadczenie</h1>
      <p className="text-muted-foreground mb-10">Karen Tonoyan — AI Security Architect, Full-Stack Developer, Creator.</p>

      {/* Experience */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Doświadczenie zawodowe</h2>
        </div>
        <div className="space-y-4">
          {experience.map((e, i) => (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{e.role}</CardTitle>
                <p className="text-sm text-muted-foreground">{e.company} · {e.period}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Systems */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Systemy & Projekty ALFA</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {systems.map(s => (
            <Badge key={s} variant="default" className="text-sm px-3 py-1">{s}</Badge>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Umiejętności techniczne</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map(s => (
            <Badge key={s} variant="secondary" className="text-sm px-3 py-1">{s}</Badge>
          ))}
        </div>
      </section>

      {/* Profiles */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Profile online</h2>
        </div>
        <div className="space-y-2">
          {[
            { label: 'GitHub', url: 'https://github.com/Karen86Tonoyan', desc: '300+ repozytoriów' },
            { label: 'karentonoyan.pl', url: 'https://karentonoyan.pl', desc: 'Strona osobista' },
            { label: 'alfaplatformx.com', url: 'https://alfaplatformx.com', desc: 'ALFA Platform X' },
          ].map(p => (
            <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors">
              <div>
                <span className="font-medium text-foreground">{p.label}</span>
                <span className="text-sm text-muted-foreground ml-2">— {p.desc}</span>
              </div>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>
    </div>
  </div>
);

export default CV;

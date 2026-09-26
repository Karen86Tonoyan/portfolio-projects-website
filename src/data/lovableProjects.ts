export interface LovableProject {
  name: string;
  description: string;
  url?: string;
  category: 'Security' | 'AI Agents' | 'Kreatywne' | 'Biznes' | 'Życie & Edukacja';
}

/** Total number of projects on the Lovable account (verified 26.09.2026). */
export const LOVABLE_PROJECT_COUNT = 107;

/** Curated, de-duplicated list of the most important Lovable projects. */
export const lovableProjects: LovableProject[] = [
  { name: 'ALFA Secure Scan', category: 'Security', url: 'https://alfa-brain-guard.lovable.app', description: 'Walidacja bezpieczeństwa, trening modeli, orkiestracja agentów i wizualizacja architektury.' },
  { name: 'AI Safety Filter', category: 'Security', url: 'https://magic-ai-filters.lovable.app', description: 'Warstwa kontroli bezpieczeństwa modeli — Tonoyan Adaptive Filter Engine, integralność tool-calli, monitoring odpowiedzi.' },
  { name: 'Cerber Dashboard', category: 'Security', url: 'https://atlas-central-glow.lovable.app', description: 'Centralny panel usług serwerowych, WordPressa i cross-postingu social media.' },
  { name: 'Narrative Shield', category: 'Security', description: 'Przetwarzanie wiadomości LLM z kontrolą integralności wejścia/wyjścia i human-in-the-loop.' },
  { name: 'ALFA Control Panel', category: 'Security', description: 'Runtime bezpieczeństwa AI — porównania RAW vs FILTERED, benchmark-first.' },
  { name: 'Secure Chat Archive', category: 'Security', url: 'https://temp-chat-aid.lovable.app', description: 'Bezpieczne archiwum rozmów z automatyczną anonimizacją danych osobowych.' },
  { name: 'Monitoring kamer i sieci', category: 'Security', url: 'https://cam-spark-ai.lovable.app', description: 'Platforma monitoringu oparta o YOLO (Ultralytics) z własnym kluczem AI klienta.' },
  { name: 'ALFA STUDIOX', category: 'AI Agents', url: 'https://alfastudiox.lovable.app', description: 'Rozszerzenie VS Code orkiestrujące workflow kreatywne i przetwarzanie obrazu wieloma modelami.' },
  { name: 'Muse Code Assistant', category: 'AI Agents', url: 'https://muse-play-space.lovable.app', description: 'Agentowe studio IDE — generowanie kodu, planowanie zadań, computer-use.' },
  { name: 'Alpha Genesis Platform', category: 'AI Agents', url: 'https://persona-lab-x.lovable.app', description: 'Ekosystem treningu, fine-tuningu i ewaluacji modeli oraz zarządzania agentami.' },
  { name: 'Brain Cloud Agents', category: 'AI Agents', url: 'https://brain-branch-sims.lovable.app', description: 'Agenci symulujący i weryfikujący scenariusze z pamięcią lokalną i chmurową.' },
  { name: 'OmniChat AI', category: 'AI Agents', url: 'https://chat-all-ai.lovable.app', description: 'Wszystkie modele AI w jednym czacie na telefonie.' },
  { name: 'ALFA Chat (Ollama)', category: 'AI Agents', url: 'https://alfa-chat-buddy.lovable.app', description: 'Przeglądarkowy interfejs do lokalnych modeli Ollama.' },
  { name: 'ASYSTENT ALFA PRO', category: 'AI Agents', url: 'https://ollama-agent-auto.lovable.app', description: 'Agent automatyzujący wideo, audio i zadania przez Ollamę.' },
  { name: 'AI Companion', category: 'AI Agents', url: 'https://alfaplatformxcom.lovable.app', description: 'Web scraping, automatyczne przeglądanie i wyszukiwanie z guardrailami.' },
  { name: 'ALFASHOPCREATOR', category: 'Kreatywne', url: 'https://zsjwx-maker-unfiltered.lovable.app', description: 'Generowanie treści wizualnych i kampanii z lokalnych workflow ComfyUI.' },
  { name: 'Trend Scout AI', category: 'Kreatywne', url: 'https://virtual-trend-spotter.lovable.app', description: 'Wyszukiwarka trendów YouTube/TikTok/Insta/Facebook dla wirtualnego influencera.' },
  { name: 'Alpha Platform Showcase', category: 'Biznes', url: 'https://alfaplatfomx-com.lovable.app', description: 'Katalog programów i produktów alfaplatformx.com.' },
  { name: 'Lovable CMS Connect', category: 'Biznes', url: 'https://cms-sparkle-magic.lovable.app', description: 'Headless frontend karentonoyan.pl zasilany WordPress REST API.' },
  { name: 'Venue Harmony', category: 'Biznes', url: 'https://crowd-zen-manage.lovable.app', description: 'Monitoring klubów, bramek wejściowych i parkingów dla operatorów.' },
  { name: 'Magenta AI Control Center', category: 'Biznes', description: 'Prototyp PoC centrum operacyjnego AI dla operatora telekomunikacyjnego.' },
  { name: 'Webhook Buddy', category: 'Biznes', url: 'https://simple-hook-test.lovable.app', description: 'Testowanie i debugowanie webhooków n8n.' },
  { name: 'AI Skill Forge', category: 'Życie & Edukacja', url: 'https://alfa-skill-spark.lovable.app', description: 'Platforma przekwalifikowania dla osób, których pracę zastąpiło AI.' },
  { name: 'Mindful Journey AI', category: 'Życie & Edukacja', url: 'https://empathic-care-flow.lovable.app', description: 'Wsparcie terapeutyczne z AI, śledzenie postępów i kontakt z lekarzem.' },
  { name: 'Alfa Growth Academy', category: 'Życie & Edukacja', url: 'https://alfa-growth-academy.lovable.app', description: 'Gra dla dzieci — Alfa uczy planu dnia, nauki i wartości.' },
  { name: 'Karen AI Architect', category: 'Życie & Edukacja', url: 'https://karen-ai-architect.lovable.app', description: 'Planer życia z AI — 4 obszary życia, dla Karena i klientów.' },
  { name: 'Your Daily Guardian', category: 'Życie & Edukacja', url: 'https://mindful-pocket-assistant.lovable.app', description: 'Asystent głosowy oceniający rozmowę bez nagrywania.' },
];

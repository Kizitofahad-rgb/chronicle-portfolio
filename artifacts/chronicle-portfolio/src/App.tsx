import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Github,
  Linkedin,
  Menu,
  Volume2,
  VolumeX,
  X,
  Eye,
  ShieldCheck,
  Cpu,
  Bot,
  Layers,
  Sparkles,
  Flame,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { GotAstrolabeCanvas } from '@/components/GotAstrolabeCanvas';
import { Card3D } from '@/components/Card3D';

const queryClient = new QueryClient();
const githubUrl = 'https://github.com/Kizitofahad-rgb';
const linkedinUrl = 'https://www.linkedin.com/in/kizito-fahad-439a793a0';
const noorLiveUrl = 'https://noor-studio-5361.ai.studio/';
const movieZoneLiveUrl = 'https://movie-zone-1a8i-alpha.vercel.app/home';

// Base URL resolution to guarantee all assets load in every deployment environment
function getCleanBase(): string {
  const raw = import.meta.env.BASE_URL || '/';
  if (raw === './' || raw === '.') return '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

const baseUrl = getCleanBase();

export function assetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${clean}`;
}

type Certificate = {
  id: string;
  issuer: string;
  title: string;
  detail: string;
  image: string;
  pdf: string;
  featured?: boolean;
  certId?: string;
  date?: string;
};

type Project = {
  id: string;
  name: string;
  house: string;
  tagline: string;
  type: string;
  status: string;
  tech: string;
  image: string;
  liveUrl?: string;
  featured?: boolean;
  specs: string[];
  note?: string;
};

const certificates: Certificate[] = [
  {
    id: 'claude-101',
    issuer: 'Anthropic',
    title: 'Claude 101',
    detail: 'Certificate of Completion · LLM Cognitive Architecture',
    image: 'assets/certs/claude-101-thumb.png',
    pdf: 'assets/certs/claude-101-cert.pdf',
    featured: true,
  },
  {
    id: 'ccna',
    issuer: 'Cisco Networking Academy',
    title: 'CCNA: Introduction to Networks',
    detail: 'Makerere University · College of Computing and Information Sciences',
    certId: '401ff79d-1aad-406f-9593-027ba3ad4b09',
    date: '26 Jul 2026',
    image: 'assets/certs/ccna-thumb.jpg',
    pdf: 'assets/certs/ccna-cert.pdf',
  },
  {
    id: 'openai',
    issuer: 'OpenAI Academy',
    title: 'AI Foundations',
    detail: 'Course Completion Certificate · Neural Systems & Foundational Models',
    certId: 'yqby21jc2l',
    date: 'August 18, 2026',
    image: 'assets/certs/openai-thumb.jpg',
    pdf: 'assets/certs/openai-cert.pdf',
  },
];

const projects: Project[] = [
  {
    id: '01',
    name: 'Noor',
    house: 'House of the Sanctuary',
    tagline: 'The Quran & Mindfulness Sanctuary · Word-by-Word Tajweed & Reflections',
    type: 'A quiet, contemplative Quran sanctuary built around word-by-word tajweed analysis, verse reflections, and daily spiritual mindfulness. Vibe coded with serene emerald themes, Al-Fatihah reader, and fluid Islamic typography.',
    status: 'LIVE REALM',
    tech: 'React · Tailwind · Audio Engine · PWA',
    image: 'assets/projects/noor-preview.jpg',
    liveUrl: noorLiveUrl,
    featured: true,
    specs: ['Live Deployment', 'Word-by-Word Tajweed', 'Surah & Mushaf Modes', 'Tafsir Ibn Kathir', 'Alafasy Recitations'],
    note: 'Vibe coded for personal Quranic study, spiritual clarity, and daily peace.',
  },
  {
    id: '02',
    name: 'Movie Zone',
    house: 'House of the Silver Screen',
    tagline: 'Cinematic Discovery Portal & Fluid Media Curator',
    type: 'A cinematic discovery space engineered for finding the next film worth your evening through curated graph linkages and zero-latency trailers.',
    status: 'LIVE REALM',
    tech: 'Web · Cinematic Graph UI · Media Streaming',
    image: 'assets/projects/movie-zone-preview.jpg',
    liveUrl: movieZoneLiveUrl,
    featured: false,
    specs: ['Curated Meta-Filter', 'Zero Latency Stream', 'Fluid Trailer Viewports'],
    note: 'Vibe coded for personal cinematic exploration and sheer enjoyment.',
  },
  {
    id: '03',
    name: 'Smart Ride UG',
    house: 'House of the Iron Roads',
    tagline: 'Hyper-Local Urban Spatial Mobility System',
    type: 'A more considered way to move around Kampala, mapping real-time local dynamics, boda-boda nodes, and contextual fares directly onto clean vector grids.',
    status: 'IN THE FORGE',
    tech: 'Mobile · Spatial Geocoding · Routing HUD',
    image: 'assets/projects/smart_ride_preview_1790704919109.jpg',
    specs: ['Offline GPS Caching', 'Kampala Node Matrix', 'Fare Estimation Engine'],
  },
  {
    id: '04',
    name: 'ILES',
    house: 'House of the Citadel Scholars',
    tagline: 'Human-Centered Educational Knowledge Lattice',
    type: 'An education-focused platform exploring how university curricula and academic research can feel more human and interconnected.',
    status: 'IN THE FORGE',
    tech: 'Web · Knowledge Graph · Adaptive LMS',
    image: 'assets/projects/iles_platform_preview_1790704930962.jpg',
    specs: ['Syllabus Ingestion', 'Knowledge Tree Visualizer', 'Peer Sync Protocol'],
  },
];

function AppShell() {
  const [entered, setEntered] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const [inspectProject, setInspectProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background Audio: Auto-plays seamlessly upon entering the Chronicle
  useEffect(() => {
    const audio = new Audio(assetUrl('assets/cant-hold-us.mp3'));
    audio.loop = true;
    audio.volume = 0.55;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Intersection Observer for royal smooth reveals
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.1 },
    );
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [entered]);

  // Key shortcuts
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveCertificate(null);
        setInspectProject(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const enterChronicle = () => {
    setEntered(true);
    const audio = audioRef.current;
    if (audio) {
      audio.play().then(() => {
        setAudioOn(true);
      }).catch(() => {
        setAudioOn(false);
      });
    }
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioOn) {
      audio.pause();
      setAudioOn(false);
    } else {
      audio.play().then(() => {
        setAudioOn(true);
      }).catch(() => {
        setNotice('Sound blocked by browser policy. Tap again to grant voice.');
      });
    }
  };

  const copyGithub = async () => {
    try {
      await navigator.clipboard.writeText(githubUrl);
      setCopied(true);
      setNotice('The Citadel parchment link copied to your clipboard.');
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setNotice('Raven delayed. Use the direct link instead.');
    }
  };

  const unavailableProject = (name: string) => {
    setNotice(`${name} is presently being forged in secret. The Citadel will announce its unveiling.`);
    window.setTimeout(() => setNotice(''), 3600);
  };

  return (
    <main className="chronicle">
      {/* 3D Game of Thrones Astrolabe & Clockwork Towers Canvas */}
      <GotAstrolabeCanvas isPlaying={audioOn} />

      {/* Citadel Entrance Gate */}
      <div className={`intro-gate ${entered ? 'is-hidden' : ''}`} aria-hidden={entered}>
        <div className="intro-gate-ornament" />
        <div className="gate-content">
          <div className="gate-mark flex items-center justify-center gap-2">
            <span>⚔️</span>
            <span>HOUSE OF KIZITO FAHAD // CITADEL ARCHIVE // 2026</span>
            <span>⚔️</span>
          </div>

          <h1 className="gate-title display-got">
            The <span>Chronicle</span>
          </h1>

          <p className="gate-subtitle">
            “A living record of Kizito Fahad — Computer Science scholar at Makerere University, craftsman of the digital forge, and builder of sovereign systems.”
          </p>

          <button
            className="enter-button"
            type="button"
            onClick={enterChronicle}
            data-testid="button-enter-chronicle"
          >
            Enter The Realm <ArrowUpRight size={17} />
          </button>

          <div className="mt-8 text-xs font-serif text-[#a89f89] tracking-wider uppercase">
            Sound begins upon entry · Clockwork movement in 3D space · Scroll to survey the kingdoms
          </div>
        </div>
      </div>

      {/* 3-Zone Top Navigation Bar (Citadel High Seat) */}
      <header className="topbar">
        {/* Zone 1: Wordmark */}
        <a href="#top" className="brand" data-testid="link-brand">
          <span className="brand-seal"><span>KF</span></span>
          <span className="tracking-widest">CHRONICLE</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className={`nav ${navOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          {[
            ['The Iron Oath', '#oath'],
            ['Citadel Scrolls', '#scrolls'],
            ['The Forge: Robotics', '#robotics'],
            ['Quests & Realms', '#quests'],
            ['Send a Raven', '#raven'],
          ].map(([label, href]) => (
            <a
              href={href}
              key={href}
              onClick={() => setNavOpen(false)}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Royal Sound Seal & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleAudio}
            className="audio-crest-btn"
            aria-label={audioOn ? 'Silence Soundtrack' : 'Awaken Soundtrack'}
            title={audioOn ? 'Soundtrack Playing — Tap to Silence' : 'Tap to Awaken Soundtrack'}
            data-testid="button-toggle-audio"
          >
            {audioOn ? (
              <>
                <Volume2 size={16} className="text-[#ffd875] animate-pulse" />
                <span>Sound On</span>
              </>
            ) : (
              <>
                <VolumeX size={16} className="text-[#8e856e]" />
                <span>Sound Off</span>
              </>
            )}
          </button>

          <button
            className="mobile-menu"
            type="button"
            onClick={() => setNavOpen(value => !value)}
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            data-testid="button-mobile-menu"
          >
            {navOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div id="top" />

      {/* Hero Section */}
      <section className="hero shell" aria-label="Introduction">
        <div className="hero-grid">
          <div className="reveal">
            <div className="eyebrow-realm">
              <span>MAKERERE CITADEL // KAMPALA, UGANDA // REALM OF 2026</span>
            </div>

            <h1 className="display-got">
              Built by<br />
              <em>curiosity.</em>
            </h1>

            <p className="hero-copy">
              I’m Kizito Fahad, studying Computer Science at Makerere University. Like the clockwork astrolabes of ancient citadels, I build software that moves with precision — from web architectures to the deep frontiers of embedded systems and robotics.
            </p>

            <div className="hero-actions">
              <a className="gold-button" href="#quests" data-testid="link-hero-quests">
                Survey The Quests <ArrowDown size={15} />
              </a>
              <a
                className="outline-button"
                href={noorLiveUrl}
                target="_blank"
                rel="noreferrer"
                data-testid="link-hero-noor"
              >
                <Sparkles size={14} className="text-[#e7b73d]" /> Noor Sanctuary
              </a>
              <a
                className="outline-button"
                href={movieZoneLiveUrl}
                target="_blank"
                rel="noreferrer"
                data-testid="link-hero-movie-zone"
              >
                <Flame size={14} className="text-[#e7b73d]" /> Movie Zone
              </a>
              <a
                className="outline-button"
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                data-testid="link-hero-github"
              >
                <Github size={15} /> Citadel GitHub
              </a>
            </div>

            <div className="hero-telemetry">
              <div className="telemetry-item">
                <strong>04</strong>
                <span>Active Realms</span>
              </div>
              <div className="telemetry-item">
                <strong>03</strong>
                <span>Honor Scrolls</span>
              </div>
              <div className="telemetry-item">
                <strong>FORGING</strong>
                <span>Robotics & Embedded</span>
              </div>
            </div>
          </div>

          <div className="portrait-wrap reveal" style={{ transitionDelay: '140ms' }}>
            <Card3D maxTilt={10} glowColor="rgba(231, 183, 61, 0.4)">
              <div className="relative overflow-hidden rounded border border-[#e7b73d]/40">
                <img
                  className="portrait"
                  src={assetUrl('assets/kizito.jpg')}
                  alt="Kizito Fahad - Software Builder & Makerere CS Scholar"
                  data-testid="img-kizito-portrait"
                />
                <div className="portrait-tint" />
              </div>
            </Card3D>

            <div className="status-card">
              <div className="micro flex items-center justify-between">
                <span>ROYAL FORGE</span>
                <span className="w-2 h-2 rounded-full bg-[#e7b73d] animate-ping" />
              </div>
              <div className="status-line">
                <span className="text-[#a49a82]">CURRENT MASTERY</span>
                <strong className="text-[#ffd875]">ACTIVE 90%</strong>
              </div>
              <div className="status-bar"><i /></div>
              <div className="text-[12px] text-[#a49a82] mt-2 font-serif italic">
                Focus: Embedded systems, microcontrollers & robotics.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 01 · The Iron Oath */}
      <section className="section shell" id="oath">
        <div className="section-header reveal">
          <div>
            <div className="eyebrow-realm">01 · The Iron Oath</div>
            <h2 className="section-title display-got">Why I<br />build.</h2>
          </div>
          <p className="section-intro">
            “Words are wind, but craft endures. A craftsman does not wait for orders; he builds until the realm is changed.”
          </p>
        </div>

        <div className="oath-layout grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="reveal">
            <p className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight font-serif text-white">
              “Make it <span className="text-[#e7b73d]">useful.</span><br />
              Make it feel<br />
              like someone <span className="text-[#ffdf79]">cared.”</span>
            </p>
            <p className="mt-6 text-base text-[#c4baa2] leading-relaxed max-w-lg font-prose">
              I’m studying Computer Science at Makerere University and treating every semester as a grand forge. My favorite part of the process is the breathless gap between a raw thought in the dark and the first living person who places their hands on it.
            </p>
            <p className="mt-4 text-base text-[#c4baa2] leading-relaxed max-w-lg font-prose">
              I care about the edge cases, the tactile feel of the interface, the mechanical precision under the hood, and building with relentless integrity.
            </p>
          </div>

          <div className="reveal flex flex-col gap-4" style={{ transitionDelay: '120ms' }}>
            <Card3D maxTilt={6} glowColor="rgba(231, 183, 61, 0.25)">
              <div className="p-6 rounded bg-[#0d1224]/90 border border-[#e7b73d]/30 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded bg-[#e7b73d]/10 text-[#e7b73d] border border-[#e7b73d]/30">
                    <Layers size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-white text-lg tracking-wide uppercase">
                    Web & Responsive Castles
                  </h3>
                </div>
                <p className="text-sm text-[#b5aa93] leading-relaxed font-prose">
                  Crafting resilient client architectures with React, TypeScript, and modern styling that move as smoothly as the gears of an ancient astrolabe.
                </p>
              </div>
            </Card3D>

            <Card3D maxTilt={6} glowColor="rgba(231, 183, 61, 0.25)">
              <div className="p-6 rounded bg-[#0d1224]/90 border border-[#e7b73d]/30 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded bg-[#e7b73d]/10 text-[#e7b73d] border border-[#e7b73d]/30">
                    <Flame size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-white text-lg tracking-wide uppercase">
                    Artificial Intelligence & LLMs
                  </h3>
                </div>
                <p className="text-sm text-[#b5aa93] leading-relaxed font-prose">
                  Deeply trained through OpenAI Academy and Anthropic Claude certifications — applying intelligent reasoning directly to real user workflows.
                </p>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* SPECIAL SPOTLIGHT: EMBEDDED SYSTEMS & ROBOTICS */}
      <section className="section shell pt-0" id="robotics">
        <div className="reveal">
          <Card3D maxTilt={6} glowColor="rgba(231, 183, 61, 0.5)">
            <div className="p-8 sm:p-12 rounded border border-[#e7b73d]/50 bg-gradient-to-br from-[#121933] via-[#090d1f] to-[#050711] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(231,183,61,0.15)] relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,rgba(231,183,61,0.12),transparent_70%)] pointer-events-none" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded text-xs font-serif tracking-widest uppercase bg-[#e7b73d]/20 text-[#ffd875] border border-[#e7b73d]/40">
                      THE MASTER'S FRONTIER
                    </span>
                    <span className="text-xs font-mono text-[#a49a82]">
                      IN THE FORGE · 2026
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-extrabold uppercase font-got tracking-wider text-white mb-3">
                    Embedded Systems & <span className="text-[#e7b73d]">Robotics</span>
                  </h3>

                  <p className="text-base sm:text-lg text-[#ddd3bc] leading-relaxed font-prose">
                    I am actively centering my deepest engineering focus and laboratory work on <strong>Embedded Systems, Microcontrollers, Hardware-Software Interfaces, and Autonomous Robotics</strong>.
                  </p>

                  <p className="text-sm text-[#a89e87] mt-3 font-prose italic">
                    These mechanical and physical computing projects are currently undergoing rigorous assembly and stress-testing in the workshop. I will be unveiling them right here in the chronicle as they take form.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                  <div className="p-4 rounded border border-[#e7b73d]/30 bg-[#050812]/80 text-center min-w-[180px]">
                    <Bot size={28} className="text-[#e7b73d] mx-auto mb-1 animate-pulse" />
                    <div className="text-xs font-serif uppercase tracking-widest text-[#ffd875]">Robotic Nodes</div>
                    <div className="text-[11px] text-[#8e856e] font-mono mt-0.5">Firmware & Actuators</div>
                  </div>
                  <div className="p-4 rounded border border-[#e7b73d]/30 bg-[#050812]/80 text-center min-w-[180px]">
                    <Cpu size={28} className="text-[#e7b73d] mx-auto mb-1" />
                    <div className="text-xs font-serif uppercase tracking-widest text-[#ffd875]">Embedded Core</div>
                    <div className="text-[11px] text-[#8e856e] font-mono mt-0.5">Low-level Architectures</div>
                  </div>
                </div>
              </div>
            </div>
          </Card3D>
        </div>
      </section>

      {/* 02 · Citadel Scrolls (Certificates) */}
      <section className="section shell" id="scrolls">
        <div className="section-header reveal">
          <div>
            <div className="eyebrow-realm">02 · Scrolls of the Citadel</div>
            <h2 className="section-title display-got">Proof of<br />Honor.</h2>
          </div>
          <p className="section-intro">
            Credentials awarded by the great academies of computing, artificial intelligence, and network architecture.
          </p>
        </div>

        <div className="certificate-grid">
          {certificates.map((certificate, index) => (
            <Card3D
              key={certificate.id}
              maxTilt={8}
              glowColor="rgba(231, 183, 61, 0.35)"
              className={`cert-card reveal ${certificate.featured ? 'featured' : ''}`}
            >
              <div className="relative overflow-hidden rounded border border-[#e7b73d]/30 bg-[#060812]">
                <img
                  className="cert-art w-full object-cover transition-transform duration-500 hover:scale-102"
                  src={assetUrl(certificate.image)}
                  alt={`${certificate.issuer} ${certificate.title} certificate parchment`}
                  loading="eager"
                />
              </div>

              <div className="pt-4">
                <div className="micro text-[#e7b73d] flex items-center gap-1.5 font-serif font-bold">
                  <ShieldCheck size={14} /> {certificate.issuer}
                </div>
                <h3 className="font-serif font-bold text-2xl uppercase mt-2 mb-1 text-white tracking-wide">
                  {certificate.title}
                </h3>
                <p className="text-sm text-[#b5aa93] mb-2 font-prose">{certificate.detail}</p>
                {certificate.certId && (
                  <div className="text-[11px] font-mono text-[#8e856e] mb-3">
                    CERT ID: {certificate.certId} {certificate.date && `· ${certificate.date}`}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCertificate(certificate)}
                    className="px-3 py-1.5 rounded border border-[#e7b73d]/50 text-[#ffd875] hover:bg-[#e7b73d]/15 text-[11px] font-serif uppercase tracking-widest transition-colors"
                    data-testid={`button-view-certificate-${certificate.id}`}
                  >
                    Examine Scroll
                  </button>
                  <a
                    href={assetUrl(certificate.pdf)}
                    download
                    className="px-3 py-1.5 rounded border border-white/10 text-[#dcd4be] hover:border-[#e7b73d] hover:text-[#e7b73d] text-[11px] font-serif uppercase tracking-widest transition-colors flex items-center gap-1.5"
                    data-testid={`link-download-certificate-${certificate.id}`}
                  >
                    <Download size={12} /> Download PDF
                  </a>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* 03 · Quests & Shipped Realms */}
      <section className="section shell" id="quests">
        <div className="section-header reveal">
          <div>
            <div className="eyebrow-realm">03 · Quests & Castles</div>
            <h2 className="section-title display-got">The Great<br />Realms.</h2>
          </div>
          <p className="section-intro">
            Projects built for real-world impact and personal enjoyment. Experience live deployments directly in your browser.
          </p>
        </div>

        <div className="project-bento">
          {projects.map((project, idx) => (
            <Card3D
              key={project.id}
              maxTilt={7}
              glowColor="rgba(231, 183, 61, 0.35)"
              className="project-card reveal"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="relative overflow-hidden rounded border border-[#e7b73d]/25 mb-4 group">
                <img
                  src={assetUrl(project.image)}
                  alt={`${project.name} preview`}
                  className="project-card-image transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <span className="absolute top-2.5 right-2.5 text-[10px] font-serif font-bold uppercase bg-[#050812]/90 text-[#ffd875] border border-[#e7b73d]/40 px-2.5 py-1 rounded backdrop-blur-md">
                  {project.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-serif text-[#e7b73d] mb-1">
                <span>{project.id} · {project.house}</span>
                <span className="text-[#8e856e] font-mono">{project.tech.split('·')[0]}</span>
              </div>

              <h3 className="text-3xl font-bold font-serif uppercase tracking-wide text-white mb-2">
                {project.name}
              </h3>

              <p className="text-base text-[#c4baa2] leading-relaxed font-prose mb-3">
                {project.type}
              </p>

              {project.note && (
                <div className="text-xs italic text-[#e7b73d]/90 bg-[#e7b73d]/10 border border-[#e7b73d]/20 px-3 py-1.5 rounded mb-4 font-prose">
                  “{project.note}”
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                {project.specs.map((spec, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] font-serif tracking-wider text-[#b5aa93] bg-white/5 px-2.5 py-0.5 rounded border border-[#e7b73d]/20"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-[#e7b73d]/20 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInspectProject(project)}
                  className="text-xs font-serif uppercase tracking-wider text-[#dcd4be] hover:text-[#e7b73d] flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={14} /> Citadel Inspect
                </button>

                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-serif font-bold uppercase tracking-wider text-[#ffd875] hover:text-white flex items-center gap-1.5 bg-[#e7b73d]/20 hover:bg-[#e7b73d]/30 px-3 py-1.5 rounded border border-[#e7b73d]/40 transition-colors"
                  >
                    Enter Realm <ArrowUpRight size={13} />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => unavailableProject(project.name)}
                    className="text-[11px] font-serif uppercase text-[#8e856e] hover:text-[#c4baa2]"
                  >
                    In The Forge
                  </button>
                )}
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* 04 · Send a Raven */}
      <section className="section shell" id="raven">
        <div className="contact-panel reveal">
          <div className="eyebrow-realm">04 · The Rookery // Send a Raven</div>
          <h2 className="display-got text-white mt-4 mb-4 text-4xl sm:text-6xl font-black">
            Have a quest<br />
            <span className="text-[#e7b73d]">worth taking?</span>
          </h2>
          <p className="text-[#ddd3bc] max-w-xl text-lg leading-relaxed mb-8 font-prose">
            For ambitious collaborations, embedded systems engineering, robotic prototypes, and challenging digital products, send your message through the Citadel’s direct channels.
          </p>
          <div className="contact-actions flex flex-wrap gap-4">
            <a
              className="gold-button"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              data-testid="link-contact-github"
            >
              <Github size={16} /> Open GitHub Profile <ArrowUpRight size={14} />
            </a>
            <a
              className="outline-button"
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              data-testid="link-contact-linkedin"
            >
              <Linkedin size={16} /> Connect On LinkedIn <ArrowUpRight size={14} />
            </a>
            <button
              className="outline-button"
              type="button"
              onClick={copyGithub}
              data-testid="button-copy-github"
            >
              {copied ? <Check size={16} className="text-[#ffd875]" /> : <Copy size={16} />}
              <span>{copied ? 'Raven Dispatched (Copied)' : 'Copy Profile Link'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer shell">
        <div className="flex items-center gap-2 font-serif font-bold">
          <span className="text-[#e7b73d]">⚔️</span>
          <span>HOUSE OF KIZITO FAHAD · THE CHRONICLE</span>
        </div>
        <span className="text-[#8e856e] font-serif text-center sm:text-left">
          MAKERERE UNIVERSITY · EMBEDDED SYSTEMS & ROBOTICS
        </span>
        <a href="#top" className="hover:text-[#e7b73d] flex items-center gap-1 transition-colors font-serif" data-testid="link-back-to-top">
          Return to High Seat <ArrowUpRight size={13} />
        </a>
      </footer>

      {/* Toast Notification Banner */}
      {notice && (
        <div
          role="status"
          className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 bg-[#0d1224] text-[#ffd875] border border-[#e7b73d] px-6 py-3 rounded text-sm font-serif shadow-[0_0_35px_rgba(231,183,61,0.5)] animate-in fade-in slide-in-from-bottom-3 duration-200"
          data-testid="status-notice"
        >
          {notice}
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {activeCertificate && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeCertificate.title} certificate parchment`}
          onMouseDown={event => event.target === event.currentTarget && setActiveCertificate(null)}
        >
          <div className="modal">
            <div className="modal-head">
              <div>
                <div className="eyebrow-realm">{activeCertificate.issuer}</div>
                <h3 className="text-white text-3xl font-serif font-bold uppercase mt-1 tracking-wide">
                  {activeCertificate.title}
                </h3>
                <p className="text-sm text-[#b5aa93] mt-1 font-prose">{activeCertificate.detail}</p>
                {activeCertificate.certId && (
                  <p className="text-xs text-[#8e856e] font-mono mt-1">ID: {activeCertificate.certId}</p>
                )}
              </div>
              <button
                className="close-button"
                type="button"
                onClick={() => setActiveCertificate(null)}
                aria-label="Close certificate preview"
                data-testid="button-close-certificate"
              >
                <X size={18} />
              </button>
            </div>

            <iframe
              className="pdf-frame"
              src={`${assetUrl(activeCertificate.pdf)}#view=FitH`}
              title={`${activeCertificate.title} PDF preview`}
              data-testid="iframe-certificate-preview"
            />

            <div className="flex justify-end gap-3 mt-4">
              <a
                className="gold-button"
                href={assetUrl(activeCertificate.pdf)}
                download
                data-testid="link-modal-download-certificate"
              >
                <Download size={14} /> Download Citadel Parchment
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Project Holo-Inspect Modal */}
      {inspectProject && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${inspectProject.name} inspection preview`}
          onMouseDown={event => event.target === event.currentTarget && setInspectProject(null)}
        >
          <div className="modal max-w-3xl">
            <div className="modal-head">
              <div>
                <div className="eyebrow-realm">{inspectProject.house} // {inspectProject.status}</div>
                <h3 className="text-white text-3xl font-serif font-bold uppercase mt-1">
                  {inspectProject.name}
                </h3>
                <p className="text-sm text-[#ffd875] mt-0.5 font-prose italic">{inspectProject.tagline}</p>
              </div>
              <button
                className="close-button"
                type="button"
                onClick={() => setInspectProject(null)}
                aria-label="Close project preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative rounded overflow-hidden border border-[#e7b73d]/30 mb-5">
              <img
                src={assetUrl(inspectProject.image)}
                alt={`${inspectProject.name} preview`}
                className="w-full aspect-video object-cover"
                loading="eager"
              />
            </div>

            <div className="space-y-4 text-[#ddd3bc] text-base font-prose">
              <p className="leading-relaxed">{inspectProject.type}</p>
              {inspectProject.note && (
                <p className="text-sm italic text-[#ffd875] bg-[#e7b73d]/10 border border-[#e7b73d]/20 p-3 rounded">
                  Note from the Craftsman: “{inspectProject.note}”
                </p>
              )}
              <div>
                <h4 className="text-xs font-serif uppercase tracking-widest text-[#a89e87] mb-2">Citadel Architecture:</h4>
                <div className="flex flex-wrap gap-2">
                  {inspectProject.specs.map((spec, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded bg-[#050812] text-[#ffd875] border border-[#e7b73d]/30 text-xs font-serif"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e7b73d]/20">
              <button
                type="button"
                onClick={() => setInspectProject(null)}
                className="outline-button"
              >
                Close Scroll
              </button>
              {inspectProject.liveUrl && (
                <a
                  href={inspectProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="gold-button"
                >
                  <Sparkles size={14} /> Enter Live Realm <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppShell} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const raw = import.meta.env.BASE_URL || '';
  const routerBase = raw === '/' || raw === './' || raw === '.' ? '' : raw.replace(/\/$/, '');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={routerBase}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

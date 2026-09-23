import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Menu,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const githubUrl = 'https://github.com/Kizitofahad-rgb';
const linkedinUrl = 'https://www.linkedin.com/in/kizito-fahad-439a793a0';

type Certificate = {
  id: string;
  issuer: string;
  title: string;
  detail: string;
  image: string;
  pdf: string;
  featured?: boolean;
};

const certificates: Certificate[] = [
  {
    id: 'claude-101',
    issuer: 'Anthropic',
    title: 'Claude 101',
    detail: 'Certificate of Completion',
    image: '/assets/certs/claude-101-thumb.png',
    pdf: '/assets/certs/claude-101-cert.pdf',
    featured: true,
  },
  {
    id: 'ccna',
    issuer: 'Cisco Networking Academy',
    title: 'CCNA: Introduction to Networks',
    detail: 'Makerere University · College of Computing and Information Sciences',
    image: '/assets/certs/ccna-thumb.jpg',
    pdf: '/assets/certs/ccna-cert.pdf',
  },
  {
    id: 'openai',
    issuer: 'OpenAI Academy',
    title: 'AI Foundations',
    detail: 'Course Completion Certificate',
    image: '/assets/certs/openai-thumb.jpg',
    pdf: '/assets/certs/openai-cert.pdf',
  },
];

const projects = [
  { id: '01', name: 'Movie Zone', type: 'A cinematic discovery space for finding the next film worth your evening.', status: 'SHIPPED', tech: 'Web · Product UI' },
  { id: '02', name: 'Smart Ride UG', type: 'A more considered way to move around Kampala, with the local context in the foreground.', status: 'SHIPPED', tech: 'Mobile · Mobility' },
  { id: '03', name: 'Noor', type: 'A quiet digital experience built around reflection, clarity, and daily practice.', status: 'IN PROGRESS', tech: 'Web · Experience' },
  { id: '04', name: 'ILES', type: 'An education-focused product exploring how useful information can feel more human.', status: 'IN PROGRESS', tech: 'Web · Systems' },
];

function AppShell() {
  const [entered, setEntered] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/assets/got-theme.mp3');
    audio.loop = true;
    audio.volume = 0.18;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 },
    );
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [entered]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveCertificate(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const enterChronicle = () => {
    setEntered(true);
    const audio = audioRef.current;
    if (audio) {
      audio.play().then(() => setAudioOn(true)).catch(() => setAudioOn(false));
    }
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioOn) {
      audio.pause();
      setAudioOn(false);
    } else {
      audio.play().then(() => setAudioOn(true)).catch(() => {
        setNotice('Sound is unavailable in this browser. The Chronicle is still fully playable.');
      });
    }
  };

  const copyGithub = async () => {
    try {
      await navigator.clipboard.writeText(githubUrl);
      setCopied(true);
      setNotice('GitHub profile link copied to your clipboard.');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setNotice('Copy is unavailable here. Use the GitHub profile button instead.');
    }
  };

  const unavailableProject = (name: string) => {
    setNotice(`${name} is part of the record, but its public project link is not available yet.`);
    window.setTimeout(() => setNotice(''), 3400);
  };

  return (
    <main className="chronicle">
      <div className={`intro-gate ${entered ? 'is-hidden' : ''}`} aria-hidden={entered}>
        <div className="gate-content">
          <div className="gate-mark">ARCHIVE  /  PERSONAL RECORD  /  2026</div>
          <h1 className="gate-title display">The <span>Chronicle</span></h1>
          <p className="gate-subtitle">A living record of Kizito Fahad — computer science undergraduate, builder, and collector of shipped things.</p>
          <button className="enter-button" type="button" onClick={enterChronicle} data-testid="button-enter-chronicle">
            Enter the Chronicle <ArrowUpRight size={15} />
          </button>
          <div className="gate-footer">Sound is optional · scroll is encouraged</div>
        </div>
      </div>

      <header className="topbar">
        <a href="#top" className="brand" data-testid="link-brand">
          <span className="brand-seal"><span>KF</span></span>
          <span>CHRONICLE</span>
        </a>
        <nav className={`nav ${navOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          {[
            ['The Oath', '#oath'],
            ['Scrolls', '#scrolls'],
            ['Quests', '#quests'],
            ['Send a Raven', '#raven'],
          ].map(([label, href]) => (
            <a href={href} key={href} onClick={() => setNavOpen(false)} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 17 }}>
          <button className="audio-toggle" type="button" onClick={toggleAudio} aria-label={audioOn ? 'Mute soundtrack' : 'Play soundtrack'} data-testid="button-toggle-audio">
            {audioOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{audioOn ? 'Sound on' : 'Sound off'}</span>
          </button>
          <button className="mobile-menu" type="button" onClick={() => setNavOpen(value => !value)} aria-label={navOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {navOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div id="top" />
      <section className="hero shell" aria-label="Introduction">
        <div className="hero-grid">
          <div className="reveal">
            <div className="eyebrow">Player profile · Kampala, Uganda</div>
            <h1 className="display">Built by<br /><em>curiosity.</em></h1>
            <p className="hero-copy">I’m Kizito Fahad, a Computer Science undergraduate at Makerere University. I build web and mobile products, then keep showing up until the idea has somewhere real to live.</p>
            <div className="hero-actions">
              <a className="gold-button" href="#quests" data-testid="link-hero-quests">Explore the quests <ArrowDown size={15} /></a>
              <a className="outline-button" href={githubUrl} target="_blank" rel="noreferrer" data-testid="link-hero-github"><Github size={15} /> View GitHub</a>
            </div>
            <div className="hero-note">
              <div><strong>04</strong>active records</div>
              <div><strong>03</strong>certificates</div>
              <div><strong>01</strong>persistent curiosity</div>
            </div>
          </div>
          <div className="portrait-wrap reveal" style={{ transitionDelay: '140ms' }}>
            <img className="portrait" src="/assets/kizito.jpg" alt="Kizito Fahad standing in a dark shirt" data-testid="img-kizito-portrait" />
            <div className="portrait-tint" />
            <div className="status-card">
              <div className="micro">Current status</div>
              <div className="status-line"><span>BUILDING</span><strong>74%</strong></div>
              <div className="status-bar"><i /></div>
              <div style={{ color: '#8994aa', fontSize: 10, marginTop: 9 }}>Next: ship something useful.</div>
            </div>
          </div>
        </div>
        <div className="scroll-cue"><i /> Scroll to inspect the record</div>
      </section>

      <section className="section shell" id="oath">
        <div className="section-header reveal">
          <div><div className="eyebrow">01 · The Oath</div><h2 className="section-title display">Why I<br />build.</h2></div>
          <p className="section-intro">The short version for a recruiter in a hurry. The longer version is in the work.</p>
        </div>
        <div className="oath-layout">
          <p className="oath-quote reveal">“Make it <span>useful.</span><br />Make it feel<br />like someone<br />cared.”</p>
          <div className="reveal" style={{ transitionDelay: '120ms' }}>
            <div className="oath-copy">
              <p>I’m studying Computer Science at Makerere University and using every semester as an excuse to make something more than an assignment. My favourite part of the process is the space between a rough thought and the first person who actually uses it.</p>
              <p>That means caring about the interface, the edge cases, the handoff, and the feeling of a product in someone’s hands. I’m early in the journey, but I’m already collecting the habits that compound: learn quickly, ship visibly, ask better questions.</p>
            </div>
            <div className="skill-rail">
              <div className="skill"><b>WEB</b><span>Interfaces & systems</span></div>
              <div className="skill"><b>MOBILE</b><span>Products on the move</span></div>
              <div className="skill"><b>AI</b><span>Curious, practical, current</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" id="scrolls">
        <div className="section-header reveal">
          <div><div className="eyebrow">02 · Scrolls of Honor</div><h2 className="section-title display">Proof<br />of work.</h2></div>
          <p className="section-intro">Credentials are not the whole story. They are useful landmarks along the way.</p>
        </div>
        <div className="certificate-grid">
          {certificates.map((certificate, index) => (
            <article className={`cert-card reveal ${certificate.featured ? 'featured' : ''}`} style={{ transitionDelay: `${index * 90}ms` }} key={certificate.id} data-testid={`card-certificate-${certificate.id}`}>
              <img className="cert-art" src={certificate.image} alt={`${certificate.issuer} ${certificate.title} certificate preview`} />
              <div className="cert-meta">
                <div className="micro">{certificate.issuer}</div>
                <h3>{certificate.title}</h3>
                <p>{certificate.detail}</p>
                <div className="cert-actions">
                  <button type="button" onClick={() => setActiveCertificate(certificate)} data-testid={`button-view-certificate-${certificate.id}`}>View preview</button>
                  <a href={certificate.pdf} download data-testid={`link-download-certificate-${certificate.id}`}><Download size={13} /> Download PDF</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell" id="quests">
        <div className="section-header reveal">
          <div><div className="eyebrow">03 · Quests</div><h2 className="section-title display">The<br />workbench.</h2></div>
          <p className="section-intro">A quick scan of products I’ve carried from idea to interface. Public links are added when the work is ready for the open world.</p>
        </div>
        <div className="project-list">
          {projects.map((project, index) => (
            <article className="project-row reveal" style={{ transitionDelay: `${index * 70}ms` }} key={project.id} data-testid={`row-project-${project.name.toLowerCase().replaceAll(' ', '-')}`}>
              <div className="project-index">{project.id}</div>
              <div className="project-name">{project.name}</div>
              <div className="project-type">{project.type}<br /><span className="micro">{project.tech}</span></div>
              <div className={`project-status ${project.status === 'IN PROGRESS' ? 'pending' : ''}`}>{project.status}</div>
              <button className="outline-button" type="button" onClick={() => unavailableProject(project.name)} data-testid={`button-project-link-${project.id}`} style={{ gridColumn: '4', justifySelf: 'end', padding: '9px 11px', fontSize: 9 }}>
                {project.status === 'SHIPPED' ? 'Link pending' : 'In the forge'}
              </button>
            </article>
          ))}
        </div>
        <div className="hero-actions" style={{ justifyContent: 'flex-end', marginTop: 26 }}>
          <a className="outline-button" href={githubUrl} target="_blank" rel="noreferrer" data-testid="link-quests-github">Browse the public GitHub <ExternalLink size={14} /></a>
        </div>
      </section>

      <section className="section shell" id="raven">
        <div className="contact-panel reveal">
          <div className="eyebrow">04 · Send a Raven</div>
          <h2 className="display">Have a quest<br /><span style={{ color: '#e7b73d' }}>worth taking?</span></h2>
          <p>For collaborations, early product conversations, and good problems to solve, find me through GitHub or LinkedIn. I do not publish an email address here yet.</p>
          <div className="contact-actions">
            <a className="gold-button" href={githubUrl} target="_blank" rel="noreferrer" data-testid="link-contact-github"><Github size={15} /> Open GitHub profile</a>
            <a className="outline-button" href={linkedinUrl} target="_blank" rel="noreferrer" data-testid="link-contact-linkedin"><Linkedin size={15} /> Open LinkedIn</a>
            <button className="outline-button" type="button" onClick={copyGithub} data-testid="button-copy-github">{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy profile link'}</button>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <span>Kizito Fahad · Chronicle</span>
        <span>Built with curiosity · Makerere University</span>
        <a href="#top" data-testid="link-back-to-top">Back to top <ArrowUpRight size={12} /></a>
      </footer>

      {notice && <div role="status" style={{ position: 'fixed', zIndex: 45, bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#e7b73d', color: '#090d1d', padding: '12px 16px', fontSize: 12, fontWeight: 700, boxShadow: '5px 5px 0 rgba(9,13,29,.45)', width: 'max-content', maxWidth: 'calc(100% - 32px)' }} data-testid="status-notice">{notice}</div>}

      {activeCertificate && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${activeCertificate.title} certificate preview`} onMouseDown={event => event.target === event.currentTarget && setActiveCertificate(null)}>
          <div className="modal">
            <div className="modal-head">
              <div><div className="eyebrow">{activeCertificate.issuer}</div><h3>{activeCertificate.title} · {activeCertificate.detail}</h3></div>
              <button className="close-button" type="button" onClick={() => setActiveCertificate(null)} aria-label="Close certificate preview" data-testid="button-close-certificate"><X size={17} /></button>
            </div>
            <iframe className="pdf-frame" src={`${activeCertificate.pdf}#view=FitH`} title={`${activeCertificate.title} PDF preview`} data-testid="iframe-certificate-preview" />
            <div className="cert-actions" style={{ marginTop: 15 }}>
              <a className="gold-button" style={{ marginTop: 0 }} href={activeCertificate.pdf} download data-testid="link-modal-download-certificate"><Download size={14} /> Download this certificate</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={AppShell} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
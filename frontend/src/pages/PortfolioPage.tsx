import { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Award,
  Send,
  Sparkles,
  ChevronRight,
  Mail,
  ExternalLink,
  Terminal,
  Minimize2,
  Cpu,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { profileApi, projectsApi, experienceApi, skillsApi, chatApi } from '../services/api';
import type { Profile, Project, Experience, Skill } from '../services/api';
import NeuralMeshCanvas from '../components/NeuralMeshCanvas';
import AIOrb from '../components/AIOrb';
import QuantumLoader from '../components/QuantumLoader';
import SpotlightCard from '../components/SpotlightCard';

export default function PortfolioPage() {
  // ── Loading & Initialization ─────────────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);

  // ── Dynamic Chatbot State ────────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "Greetings! I am KAIROS, Harish Kamireddi's digital AI clone, powered by LangGraph and Gemini. Ask me anything regarding Harish's system architecture, AI projects, research, or work history!",
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // ── Data State ───────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>('All');

  // Dynamic Typewriter Roles
  const roles = [
    'AI Systems Architect',
    'Multi-Agent LangGraph Engineer',
    'Full-Stack Machine Learning Developer',
    'Supabase & Vector DB Specialist',
  ];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    const roleTimer = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3200);
    return () => clearInterval(roleTimer);
  }, [roles.length]);

  // Load backend data
  useEffect(() => {
    async function fetchData() {
      try {
        const [prof, projs, exp, skls] = await Promise.all([
          profileApi.get().catch(() => null),
          projectsApi.list().catch(() => []),
          experienceApi.list().catch(() => []),
          skillsApi.list().catch(() => []),
        ]);
        if (prof) setProfile(prof);
        if (projs.length) setProjects(projs);
        if (exp.length) setExperience(exp);
        if (skls.length) setSkills(skls);
      } catch {
        // Fallback to static data
      }
    }
    fetchData();
  }, []);

  // Auto scroll chat
  useEffect(() => {
    if (chatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen, isAiThinking]);

  const samplePrompts = [
    "What AI architectures has Harish engineered?",
    "Explain the Flagship project stack.",
    "Which multi-agent systems has Harish built?",
    "How can I reach Harish for collaboration?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: query, time: timeStr }]);
    setInputValue('');
    setIsAiThinking(true);

    try {
      // 1. Send query to real backend LangGraph agent
      const res = await chatApi.send(query);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      // 2. Seamless offline cognitive fallback
      let aiReply = '';
      const lower = query.toLowerCase();

      if (lower.includes('flagship') || lower.includes('stack')) {
        aiReply =
          "The Flagship platform is engineered as a reactive 3-tier architecture: FastAPI + LangGraph Python orchestrator on the backend, Supabase pgvector for vector store and persistence, and a high-performance React 19 + TypeScript frontend with dynamic neural canvas shaders.";
      } else if (lower.includes('multi-agent') || lower.includes('agent')) {
        aiReply =
          "Harish specializes in orchestrating autonomous multi-agent graphs using LangGraph and Gemini 1.5. Agents coordinate planning, web research, tool calling, and self-reflection loops with pgvector memory.";
      } else if (lower.includes('contact') || lower.includes('reach') || lower.includes('email')) {
        aiReply =
          "You can reach Harish directly at harishkamireddi@zohomail.in or connect via LinkedIn (linkedin.com/in/harish-kamireddi-a5a3b52a7) and GitHub (@HARISHKAMIREDDI).";
      } else {
        aiReply = `Synthesizing neural query: "${query}". Harish is focused on production-grade generative AI, LangGraph multi-agent swarms, and scalable cloud microservices with PostgreSQL/Supabase.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Fallbacks
  const displayName = profile?.name || 'Harish Kamireddi';
  const displayTagline =
    profile?.tagline ||
    'Architecting production-quality AI applications, full-stack microservices, and autonomous multi-agent swarms using LangGraph, FastAPI, and Supabase.';
  const displayBio =
    profile?.bio ||
    'I specialize in designing and deploying end-to-end intelligent systems. From agentic orchestrator graphs to high-speed vector embeddings and resilient cloud backends, I transform cutting-edge AI research into production-grade infrastructure.';
  const githubUrl = profile?.github_url || 'https://github.com/HARISHKAMIREDDI';
  const linkedinUrl =
    profile?.linkedin_url || 'https://www.linkedin.com/in/harish-kamireddi-a5a3b52a7';
  const emailAddress = profile?.email || 'harishkamireddi@zohomail.in';

  const rawProjects = projects.length
    ? projects
    : [
        {
          id: 1,
          title: 'Flagship AI Portfolio & Autonomous CMS',
          description:
            'A reactive 3-tier system featuring an autonomous LangGraph assistant, Supabase pgvector memory, and a sleek cyberpunk administrative dashboard.',
          tags: ['React 19', 'FastAPI', 'LangGraph', 'Supabase', 'pgvector'],
          github_url: 'https://github.com/HARISHKAMIREDDI/flagship',
          featured: true,
        },
        {
          id: 2,
          title: 'Multi-Agent Autonomous Research Swarm',
          description:
            'Collaborative AI agent network that decomposes financial briefs, queries live web sources, aggregates findings, and delivers structured syntheses.',
          tags: ['LangGraph', 'Gemini 1.5 Pro', 'Python', 'Vector DB'],
          github_url: 'https://github.com/HARISHKAMIREDDI',
          featured: true,
        },
        {
          id: 3,
          title: 'Neural RAG Knowledge Engine',
          description:
            'Hybrid sparse & dense vector search system with automatic chunking, metadata re-ranking, and dynamic context caching.',
          tags: ['Python', 'FastAPI', 'pgvector', 'Google AI'],
          github_url: 'https://github.com/HARISHKAMIREDDI',
          featured: false,
        },
      ];

  const projectFilters = ['All', 'React 19', 'FastAPI', 'LangGraph', 'Supabase'];
  const filteredProjects =
    activeProjectFilter === 'All'
      ? rawProjects
      : rawProjects.filter((p) => p.tags.includes(activeProjectFilter));

  const rawExperience = experience.length
    ? experience
    : [
        {
          id: 1,
          role: 'Lead AI Engineer & Solutions Architect',
          company: 'Flagship AI Labs',
          period: '2024 - Present',
          description:
            'Directing design of autonomous agent workflows, LangGraph graphs, RAG vector pipelines, and full-stack reactive control centers.',
          sort_order: 0,
        },
        {
          id: 2,
          role: 'Full-Stack Machine Learning Developer',
          company: 'Applied AI Projects',
          period: '2023 - 2024',
          description:
            'Engineered resilient RESTful APIs using FastAPI, integrated Supabase auth & PostgreSQL databases, and built high-performance React frontends.',
          sort_order: 1,
        },
      ];

  const rawSkills = skills.length
    ? skills.map((s) => s.name)
    : [
        'LangGraph',
        'Gemini 1.5 Pro',
        'FastAPI',
        'Python',
        'React 19',
        'TypeScript',
        'Supabase',
        'pgvector',
        'PostgreSQL',
        'Tailwind CSS v4',
        'Multi-Agent Swarms',
        'RAG Pipelines',
      ];

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-violet-600/40 selection:text-white">
      {/* Attractive Quantum Loader on Start */}
      {initialLoading && <QuantumLoader onComplete={() => setInitialLoading(false)} />}

      {/* Dynamic Interactive Neural Mesh Canvas (60fps interactive nodes) */}
      <NeuralMeshCanvas />

      {/* Ambient Cybernetic Radial Flares */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-violet-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-t from-pink-600/10 via-purple-600/10 to-transparent blur-[100px] pointer-events-none z-0" />

      {/* Main Content Layout */}
      <div className="relative z-10 pt-28 pb-32">
        {/* ── HERO SECTION ─────────────────────────────────────────── */}
        <section className="container mx-auto px-6 max-w-5xl text-center pt-8 pb-20">
          {/* Holographic Status Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs font-mono mb-8 shadow-[0_0_20px_rgba(139,92,246,0.2)] backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
            </span>
            <span className="text-gray-300">NEURAL REPLICA ONLINE</span>
            <span className="text-violet-400/60 font-light">•</span>
            <span className="text-cyan-300 font-semibold">GEMINI 1.5 PRO READY</span>
          </div>

          {/* Central Animated Hologram Orb Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => setChatOpen(true)}>
              <AIOrb size="xl" isThinking={false} className="group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-[10px] text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 whitespace-nowrap font-mono pointer-events-none">
                CLICK TO LAUNCH AGENT
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 font-mono">
            <span className="text-white">{displayName.split(' ')[0]} </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-pink-400">
              {displayName.split(' ').slice(1).join(' ') || 'KAMIREDDI'}
            </span>
          </h1>

          {/* Dynamic Rotating Role Badge */}
          <div className="h-8 flex items-center justify-center mb-6 font-mono text-sm md:text-lg text-cyan-300">
            <span className="text-gray-500 mr-2">&gt;</span>
            <span className="border-b border-cyan-400/50 pb-0.5 tracking-wide">
              {roles[currentRoleIndex]}
            </span>
            <span className="inline-block w-2 h-4 bg-cyan-400 ml-1.5 animate-pulse" />
          </div>

          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            {displayTagline}
          </p>

          {/* Interactive Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setChatOpen(true)}
              className="relative group overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium text-sm transition-all shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] hover:scale-[1.03] active:scale-[0.98] flex items-center gap-3"
            >
              <AIOrb size="xs" isActive={true} />
              <span>Talk with KAIROS (AI Twin)</span>
              <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            </button>

            <a
              href="#projects"
              className="px-8 py-4 rounded-xl bg-[#0f121e]/90 hover:bg-[#15192b] border border-[#262c47] text-gray-300 hover:text-white font-medium text-sm transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-violet-400" />
              <span>Inspect Systems</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </a>
          </div>

          {/* Social Proof Channels */}
          <div className="flex justify-center items-center gap-6 mt-14 text-gray-400">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-violet-500/50 hover:text-white hover:scale-110 transition-all shadow-md group"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 hover:text-white hover:scale-110 transition-all shadow-md"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                  clipRule="evenodd"
                />
              </svg>
            </a>

            <a
              href={`mailto:${emailAddress}`}
              className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-pink-500/50 hover:text-white hover:scale-110 transition-all shadow-md"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* ── ABOUT ME / ARCHITECTURE HIGHLIGHTS ──────────────────── */}
        <section id="about" className="container mx-auto px-6 py-20 max-w-5xl border-t border-[#1c2136]">
          <div className="grid md:grid-cols-3 gap-10 items-start">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>ARCHITECTURAL PHILOSOPHY</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Engineered for Autonomous Resilience
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                Real-time synchronized with Supabase PostgreSQL & pgvector
              </p>
            </div>

            <div className="md:col-span-2 space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
              <p className="p-6 rounded-2xl bg-[#0c0e18]/80 border border-[#1b1f31] backdrop-blur-md shadow-lg">
                {displayBio}
              </p>

              {/* Dynamic Metrics Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0c0e18]/70 border border-[#1a1e30] text-center">
                  <p className="text-2xl font-black text-cyan-400 font-mono">100%</p>
                  <p className="text-[11px] text-gray-500 mt-1 uppercase font-mono">Dynamic CMS Synced</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0c0e18]/70 border border-[#1a1e30] text-center">
                  <p className="text-2xl font-black text-violet-400 font-mono">&lt; 15ms</p>
                  <p className="text-[11px] text-gray-500 mt-1 uppercase font-mono">Vector Query Latency</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0c0e18]/70 border border-[#1a1e30] text-center">
                  <p className="text-2xl font-black text-pink-400 font-mono">LangGraph</p>
                  <p className="text-[11px] text-gray-500 mt-1 uppercase font-mono">Multi-Agent Engine</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROJECTS SECTION (Spotlight Cards + Filters) ─────────── */}
        <section id="projects" className="container mx-auto px-6 py-20 max-w-5xl border-t border-[#1c2136]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-violet-950/50 border border-violet-500/30 text-violet-300 text-xs font-mono mb-3">
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                <span>ACTIVE DEPLOYMENTS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Featured Architectures
              </h2>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {projectFilters.map((flt) => (
                <button
                  key={flt}
                  onClick={() => setActiveProjectFilter(flt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeProjectFilter === flt
                      ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                      : 'bg-[#101322] text-gray-400 hover:text-white border border-[#20253d]'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => (
              <SpotlightCard key={proj.id} className="p-7 flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      {proj.title}
                    </h3>
                    <a
                      href={proj.github_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-violet-600/30 transition-colors"
                      aria-label="Visit project"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {proj.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {proj.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 text-[11px] font-mono bg-violet-950/40 text-violet-300 border border-violet-500/20 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Explore Repository</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* ── EXPERIENCE & SKILLS (Spotlight Grid) ──────────────────── */}
        <section id="experience" className="container mx-auto px-6 py-20 max-w-5xl border-t border-[#1c2136]">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Experience */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-6">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>CAREER TIMELINE</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-8">Work History</h2>

              <div className="border-l-2 border-violet-500/30 pl-6 space-y-8 relative ml-2">
                {rawExperience.map((exp) => (
                  <div key={exp.id} className="relative group">
                    <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-[#06070a] shadow-[0_0_10px_#06b6d4]" />
                    <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {exp.role}
                    </h3>
                    <p className="text-xs font-mono text-violet-400 mt-0.5">
                      {exp.company} • {exp.period}
                    </p>
                    <p className="text-sm text-gray-400 mt-2.5 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Skills Matrix */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-pink-950/50 border border-pink-500/30 text-pink-300 text-xs font-mono mb-6">
                <Award className="w-3.5 h-3.5 text-pink-400" />
                <span>CORE SPECIALIZATIONS</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-8">Skill Constellation</h2>

              <div className="flex flex-wrap gap-2.5">
                {rawSkills.map((sk, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 rounded-xl bg-[#0e111d]/90 border border-[#1e2338] text-gray-300 text-xs font-mono hover:border-cyan-400/60 hover:text-white hover:bg-violet-950/30 hover:scale-105 transition-all cursor-default shadow-sm flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{sk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── FLOATING HOLOGRAPHIC CHATBOT WIDGET ─────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="group relative flex items-center gap-3.5 pl-3 pr-6 py-3 rounded-full bg-[#0d101c]/95 border border-cyan-500/40 text-white shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:shadow-[0_0_45px_rgba(139,92,246,0.6)] hover:border-violet-400 transition-all hover:scale-105 active:scale-95 backdrop-blur-xl"
          >
            <AIOrb size="sm" isThinking={false} />
            <div className="text-left">
              <p className="text-xs font-mono font-bold tracking-wider text-cyan-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                <span>TALK TO KAIROS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </p>
              <p className="text-[10px] text-gray-400">Ask anything about systems</p>
            </div>
          </button>
        ) : (
          <div className="w-[390px] md:w-[430px] h-[560px] bg-[#090b14]/95 border border-[#252b45] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(139,92,246,0.25)] flex flex-col overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Chat Header */}
            <div className="px-5 py-3.5 bg-[#0e1120] border-b border-[#1f253d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AIOrb size="sm" isThinking={isAiThinking} />
                <div>
                  <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
                    KAIROS COGNITIVE TWIN
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-full font-mono">
                      ONLINE
                    </span>
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono">LangGraph RAG • Supabase pgvector</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Minimize Chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body (Message stream) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && <AIOrb size="xs" isThinking={false} className="mt-1 shrink-0" />}
                  <div
                    className={`max-w-[82%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-tr-none'
                        : 'bg-[#121526] border border-[#222842] text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    <p
                      className={`text-[9px] mt-1.5 font-mono ${
                        m.sender === 'user' ? 'text-violet-200 text-right' : 'text-gray-500'
                      }`}
                    >
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}

              {/* AI Thinking Animation */}
              {isAiThinking && (
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px] p-2">
                  <AIOrb size="xs" isThinking={true} />
                  <span className="animate-pulse">Retrieving embeddings from pgvector...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompts Capsule Bar */}
            <div className="px-3 py-2 bg-[#0c0e1a] border-t border-[#1b2036] flex gap-1.5 overflow-x-auto scrollbar-none">
              {samplePrompts.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleSendMessage(q)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-[#14172a] hover:bg-violet-950/60 border border-[#242b47] hover:border-cyan-400/50 text-[10px] text-gray-300 hover:text-cyan-200 transition-all font-mono whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Interactive Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[#0a0c16] border-t border-[#1c2136] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask KAIROS anything..."
                className="flex-1 bg-[#101322] border border-[#202742] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-sans"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isAiThinking}
                className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

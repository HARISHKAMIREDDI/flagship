import { useState, useEffect } from 'react';
import { Bot, User, Briefcase, Award, Send, Sparkles, ChevronRight, Mail, ExternalLink, Terminal, Loader2 } from 'lucide-react';
import { profileApi, projectsApi, experienceApi, skillsApi } from '../services/api';
import type { Profile, Project, Experience, Skill } from '../services/api';

export default function PortfolioPage() {
  // ── Chat state ───────────────────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "Hello! I am Harish Kamireddi's AI Assistant. Ask me anything about his projects, experience, skills, or career goals!" }
  ]);
  const [inputValue, setInputValue] = useState('');

  // ── Portfolio data ───────────────────────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    async function loadAll() {
      try {
        const [prof, projs, exp, skls] = await Promise.all([
          profileApi.get().catch(() => null),
          projectsApi.list().catch(() => []),
          experienceApi.list().catch(() => []),
          skillsApi.list().catch(() => []),
        ]);
        if (prof) setProfile(prof);
        setProjects(projs);
        setExperience(exp);
        setSkills(skls);
      } catch {
        setDataError(true);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const samplePrompts = [
    "What AI models has Harish worked with?",
    "Tell me about the Flagship project architecture.",
    "Show me Harish's career highlights."
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputValue('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `Thanks for asking! I'm in Phase 1 (mock mode) right now. In Phase 3, my FastAPI + LangGraph agent backend will answer this using vector database retrieval. You asked: "${text}"`
      }]);
    }, 800);
  };

  // ── Fallback values when DB not yet seeded ───────────────────────────────
  const displayName    = profile?.name    ?? 'Harish Kamireddi';
  const displayTagline = profile?.tagline ?? 'AI Engineer — FastAPI · React · LangGraph';
  const displayBio     = profile?.bio     ?? 'I build production-quality AI applications, full-stack architectures, and multi-agent systems using FastAPI, React, and LangGraph.';
  const githubUrl      = profile?.github_url   ?? 'https://github.com/HARISHKAMIREDDI';
  const linkedinUrl    = profile?.linkedin_url ?? 'https://www.linkedin.com/in/harish-kamireddi-a5a3b52a7';
  const emailAddress   = profile?.email        ?? 'harishkamireddi@zohomail.in';

  const displayProjects = projects.length > 0 ? projects : [
    { id: 0, title: 'AI Portfolio & CMS Platform', description: 'This website: a FastAPI + React portfolio with a CMS admin panel.', tags: ['React', 'FastAPI', 'Supabase', 'LangGraph'], github_url: 'https://github.com/HARISHKAMIREDDI/flagship', featured: true },
    { id: 1, title: 'Multi-Agent Analyst System', description: 'A collaborative AI swarm using LangGraph for automated research.', tags: ['LangGraph', 'Gemini 1.5', 'Python', 'Tavily'], github_url: '#', featured: true },
  ];

  const displayExperience = experience.length > 0 ? experience : [
    { id: 0, role: 'AI Developer / Architect', company: 'Flagship Projects', period: '2024 - Present', description: 'Designing agentic architectures and CMS integration layers.', sort_order: 0 },
  ];

  const displaySkills = skills.length > 0 ? skills.map(s => s.name) : [
    'React', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Python', 'LangGraph', 'LangChain', 'Supabase', 'PostgreSQL', 'Vector Embeddings', 'Gemini API'
  ];

  return (
    <div className="relative min-h-screen pb-20">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#090a0f]/60 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      )}

      {/* Backend offline notice */}
      {dataError && !loading && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs px-4 py-2 rounded-full shadow-lg">
          ⚠️ Backend offline — showing static fallback data
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-20 text-center max-w-4xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6 animate-pulse">
          <Sparkles className="w-3 h-3" />
          <span>AI-Powered Portfolio Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Hi, I'm {displayName.toUpperCase()}
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {displayTagline}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-violet-600/20 hover:scale-[1.02]"
          >
            <Bot className="w-5 h-5" />
            Talk to my AI Assistant
          </button>
          <a
            href="#projects"
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-200 font-medium rounded-lg transition-all hover:scale-[1.02]"
          >
            Explore Projects
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mt-12 text-gray-500">
          <a href={githubUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
            </svg>
          </a>
          <a href={emailAddress !== '#' ? `mailto:${emailAddress}` : '#'} className="hover:text-white transition-colors" aria-label="Email">
            <Mail className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-6 py-20 max-w-5xl border-t border-zinc-900">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <User className="w-5 h-5 text-violet-500" />
              About Me
            </h2>
            <p className="text-sm text-gray-500 mt-2">Dynamic database-driven profile</p>
          </div>
          <div className="md:col-span-2 text-gray-400 space-y-6 leading-relaxed">
            <p>{displayBio}</p>
            <p>Everything on this site is managed from a secure CMS dashboard powered by Supabase.</p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="container mx-auto px-6 py-20 max-w-5xl border-t border-zinc-900">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-white mb-10">
          <Terminal className="w-5 h-5 text-violet-500" />
          Featured Projects
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {displayProjects.map((project) => (
            <div key={project.id} className="p-6 bg-zinc-900/40 border border-zinc-950 rounded-xl hover:border-zinc-800 transition-all flex flex-col justify-between group">
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors flex items-center justify-between">
                  {project.title}
                  <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-violet-400" />
                </h3>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">{project.description}</p>
              </div>
              <div className="mt-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded-md">{tag}</span>
                  ))}
                </div>
                {project.github_url && project.github_url !== '#' && (
                  <a href={project.github_url} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
                    View Source Code <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience & Skills Section */}
      <section id="experience" className="container mx-auto px-6 py-20 max-w-5xl border-t border-zinc-900 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white mb-8">
            <Briefcase className="w-5 h-5 text-violet-500" />
            Experience
          </h2>
          <div className="border-l border-zinc-800 pl-6 space-y-8 relative">
            {displayExperience.map((exp) => (
              <div key={exp.id} className="relative">
                <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-violet-500" />
                <h3 className="text-md font-semibold text-white">{exp.role}</h3>
                <p className="text-xs text-gray-500">{exp.company} • {exp.period}</p>
                <p className="text-sm text-gray-400 mt-2">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white mb-8">
            <Award className="w-5 h-5 text-violet-500" />
            Core Skills
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {displaySkills.map((skill, idx) => (
              <span key={idx} className="px-3.5 py-1.5 bg-zinc-900/50 border border-zinc-800 hover:border-violet-500/40 hover:bg-zinc-900 text-gray-300 rounded-lg text-sm transition-colors">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-2xl transition-all hover:scale-[1.05]"
          >
            <Bot className="w-5 h-5" />
            <span className="text-sm font-medium">Ask AI Assistant</span>
          </button>
        ) : (
          <div className="w-[380px] h-[500px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-500" />
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Portfolio Guide</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-800"
              >
                Minimize
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-gray-300'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/50">
              <p className="text-[10px] text-gray-500 mb-1.5 font-medium">Suggested queries:</p>
              <div className="flex flex-col gap-1">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="text-left text-xs text-violet-400 hover:text-violet-300 truncate hover:bg-zinc-900 px-2 py-1 rounded transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
              className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button type="submit" className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

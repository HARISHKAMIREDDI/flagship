import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, User, Briefcase, Award, Brain, Settings,
  Lock, FileText, Database, ShieldAlert, Plus, Trash2, Loader2,
  Save, RefreshCw, CheckCircle, XCircle,
} from 'lucide-react';
import { profileApi, projectsApi, experienceApi, skillsApi, healthApi } from '../services/api';
import type { Profile, Project, Experience, Skill } from '../services/api';

const API_BASE = 'http://localhost:8000/api';
type Tab = 'overview' | 'profile' | 'experience' | 'projects' | 'skills' | 'prompts' | 'knowledge' | 'settings';

// ── Reusable feedback badge ───────────────────────────────────────────────────
function StatusBadge({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${ok ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-red-950/30 border-red-500/30 text-red-400'}`}>
      {ok ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {msg}
    </div>
  );
}

// ── Input helpers ─────────────────────────────────────────────────────────────
const inputCls = "w-full bg-[#090a0f] border border-[#1f212e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors";
const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5";

export default function AdminDashboard() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!sessionStorage.getItem('admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ── Navigation ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // ── Overview stats ────────────────────────────────────────────────────────
  const [healthStatus, setHealthStatus] = useState<{ supabase_configured: boolean; gemini_configured: boolean } | null>(null);

  // ── Profile ───────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState<Omit<Profile, 'id'>>({ name: '', tagline: '', bio: '', github_url: '', linkedin_url: '', email: '', avatar_url: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Projects ──────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([]);
  const [projLoading, setProjLoading] = useState(false);
  const [newProj, setNewProj] = useState({ title: '', description: '', tags: '', github_url: '', featured: false });
  const [projMsg, setProjMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Experience ────────────────────────────────────────────────────────────
  const [experience, setExperience] = useState<Experience[]>([]);
  const [expLoading, setExpLoading] = useState(false);
  const [newExp, setNewExp] = useState({ role: '', company: '', period: '', description: '', sort_order: 0 });
  const [expMsg, setExpMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Skills ────────────────────────────────────────────────────────────────
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillLoading, setSkillLoading] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('general');
  const [skillMsg, setSkillMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Load data on tab change ───────────────────────────────────────────────
  const loadOverview = useCallback(async () => {
    try { const h = await healthApi.check(); setHealthStatus(h); } catch { /* offline */ }
    try { const projs = await projectsApi.list(); setProjects(projs); } catch { /* offline */ }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const p = await profileApi.get();
      setProfile(p);
      setProfileForm({ name: p.name, tagline: p.tagline, bio: p.bio, github_url: p.github_url ?? '', linkedin_url: p.linkedin_url ?? '', email: p.email ?? '', avatar_url: p.avatar_url ?? '' });
    } catch { /* no profile row yet */ }
  }, []);

  const loadProjects = useCallback(async () => {
    setProjLoading(true);
    try { setProjects(await projectsApi.list()); } catch { /* offline */ } finally { setProjLoading(false); }
  }, []);

  const loadExperience = useCallback(async () => {
    setExpLoading(true);
    try { setExperience(await experienceApi.list()); } catch { /* offline */ } finally { setExpLoading(false); }
  }, []);

  const loadSkills = useCallback(async () => {
    setSkillLoading(true);
    try { setSkills(await skillsApi.list()); } catch { /* offline */ } finally { setSkillLoading(false); }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'overview') loadOverview();
    if (activeTab === 'profile') loadProfile();
    if (activeTab === 'projects') loadProjects();
    if (activeTab === 'experience') loadExperience();
    if (activeTab === 'skills') loadSkills();
  }, [activeTab, isAuthenticated, loadOverview, loadProfile, loadProjects, loadExperience, loadSkills]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: 'Authentication failed.' }));
        throw new Error(d.detail || 'Login failed.');
      }
      const data = await res.json();
      sessionStorage.setItem('admin_token', data.access_token);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Please verify your admin credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ── Profile save ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile) return;
    setProfileSaving(true); setProfileMsg(null);
    try {
      await profileApi.update(profile.id, profileForm);
      setProfileMsg({ text: 'Profile saved successfully.', ok: true });
    } catch (err: unknown) {
      setProfileMsg({ text: err instanceof Error ? err.message : 'Save failed.', ok: false });
    } finally { setProfileSaving(false); }
  };

  // ── Projects CRUD ─────────────────────────────────────────────────────────
  const handleAddProject = async () => {
    if (!newProj.title.trim()) return;
    setProjMsg(null);
    try {
      const created = await projectsApi.create({ ...newProj, tags: newProj.tags.split(',').map(t => t.trim()).filter(Boolean) });
      setProjects(prev => [created, ...prev]);
      setNewProj({ title: '', description: '', tags: '', github_url: '', featured: false });
      setProjMsg({ text: 'Project added.', ok: true });
    } catch (err: unknown) {
      setProjMsg({ text: err instanceof Error ? err.message : 'Failed to add project.', ok: false });
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await projectsApi.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch { /* offline */ }
  };

  const handleToggleFeatured = async (p: Project) => {
    try {
      const updated = await projectsApi.update(p.id, { ...p, featured: !p.featured });
      setProjects(prev => prev.map(x => x.id === p.id ? updated : x));
    } catch { /* offline */ }
  };

  // ── Experience CRUD ───────────────────────────────────────────────────────
  const handleAddExperience = async () => {
    if (!newExp.role.trim()) return;
    setExpMsg(null);
    try {
      const created = await experienceApi.create(newExp);
      setExperience(prev => [...prev, created]);
      setNewExp({ role: '', company: '', period: '', description: '', sort_order: 0 });
      setExpMsg({ text: 'Experience entry added.', ok: true });
    } catch (err: unknown) {
      setExpMsg({ text: err instanceof Error ? err.message : 'Failed to add entry.', ok: false });
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      await experienceApi.delete(id);
      setExperience(prev => prev.filter(e => e.id !== id));
    } catch { /* offline */ }
  };

  // ── Skills CRUD ───────────────────────────────────────────────────────────
  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    setSkillMsg(null);
    try {
      const created = await skillsApi.create({ name: newSkillName, category: newSkillCat, sort_order: skills.length });
      setSkills(prev => [...prev, created]);
      setNewSkillName('');
      setSkillMsg({ text: `Skill "${created.name}" added.`, ok: true });
    } catch (err: unknown) {
      setSkillMsg({ text: err instanceof Error ? err.message : 'Failed to add skill.', ok: false });
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await skillsApi.delete(id);
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch { /* offline */ }
  };

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090a0f] px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="w-full max-w-md bg-[#12131a] border border-[#1f212e] rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Secure CMS Admin</h2>
            <p className="text-sm text-gray-500 mt-1">Authenticate to manage portfolio database</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={labelCls}>Admin Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#090a0f] border border-[#1f212e] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors" required />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090a0f] border border-[#1f212e] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors" required />
            </div>
            {loginError && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg flex gap-2 text-xs text-red-400 items-start">
                <ShieldAlert className="w-4 h-4 shrink-0" /><span>{loginError}</span>
              </div>
            )}
            <button type="submit" disabled={isLoggingIn}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
              {isLoggingIn ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard Shell ───────────────────────────────────────────────────────
  const tabs = [
    { id: 'overview',    label: 'Overview',         icon: LayoutDashboard },
    { id: 'profile',     label: 'Profile Settings',  icon: User },
    { id: 'experience',  label: 'Experience',         icon: Briefcase },
    { id: 'projects',    label: 'Projects Manager',   icon: FileText },
    { id: 'skills',      label: 'Skills Grid',        icon: Award },
    { id: 'prompts',     label: 'AI Prompt Agent',    icon: Brain },
    { id: 'knowledge',   label: 'Knowledge Base',     icon: Database },
    { id: 'settings',    label: 'Global Config',      icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen flex bg-[#090a0f]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1f212e] bg-[#0c0d14] flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-[#1f212e] flex items-center gap-2">
            <Database className="w-5 h-5 text-violet-500" />
            <span className="font-bold text-white text-md tracking-tight">CMS Admin Panel</span>
          </div>
          <nav className="p-4 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20'
                      : 'text-gray-400 hover:bg-zinc-900/50 hover:text-white border border-transparent'
                  }`}>
                  <Icon className="w-4 h-4" />{tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-[#1f212e] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-white">Harish Kamireddi</p>
            <p className="text-[9px] text-gray-500">Super Administrator</p>
          </div>
          <button onClick={() => { sessionStorage.removeItem('admin_token'); setIsAuthenticated(false); }}
            className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-white capitalize">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <p className="text-xs text-gray-500 mt-1">Configure parameters reflected on the public portfolio.</p>
        </header>

        <div className="bg-[#12131a] border border-[#1f212e] rounded-xl p-8 shadow-xl">

          {/* ── OVERVIEW ───────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Projects</h4>
                  <p className="text-3xl font-extrabold text-white mt-2">{projects.length}</p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Gemini API</h4>
                  <p className={`text-sm font-bold mt-4 flex items-center gap-1.5 ${healthStatus?.gemini_configured ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${healthStatus?.gemini_configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {healthStatus?.gemini_configured ? 'Configured' : 'Not configured'}
                  </p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Supabase</h4>
                  <p className={`text-sm font-bold mt-4 flex items-center gap-1.5 ${healthStatus?.supabase_configured ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${healthStatus?.supabase_configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {healthStatus?.supabase_configured ? 'Connected' : 'Not configured'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE ────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              {!profile && (
                <p className="text-xs text-amber-400 bg-amber-950/30 border border-amber-500/20 rounded-lg px-4 py-3">
                  No profile row found in Supabase. Run the SQL migration first.
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                {(['name', 'tagline', 'github_url', 'linkedin_url', 'email', 'avatar_url'] as const).map(field => (
                  <div key={field} className={field === 'tagline' ? 'col-span-2' : ''}>
                    <label className={labelCls}>{field.replace('_', ' ')}</label>
                    <input className={inputCls} value={(profileForm as Record<string, string>)[field] ?? ''}
                      onChange={e => setProfileForm(prev => ({ ...prev, [field]: e.target.value }))} />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className={labelCls}>Bio</label>
                  <textarea rows={4} className={inputCls} value={profileForm.bio}
                    onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handleSaveProfile} disabled={profileSaving || !profile}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-colors">
                  {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Profile
                </button>
                <button onClick={loadProfile} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Reload
                </button>
                {profileMsg && <StatusBadge msg={profileMsg.text} ok={profileMsg.ok} />}
              </div>
            </div>
          )}

          {/* ── PROJECTS ───────────────────────────────────────────────── */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              {/* Add form */}
              <div className="p-6 bg-zinc-900/40 border border-[#1f212e] rounded-xl space-y-4 max-w-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-violet-500" /> Add New Project
                </h4>
                <div className="grid gap-3">
                  <input className={inputCls} placeholder="Project title" value={newProj.title}
                    onChange={e => setNewProj(p => ({ ...p, title: e.target.value }))} />
                  <textarea rows={2} className={inputCls} placeholder="Short description..."
                    value={newProj.description} onChange={e => setNewProj(p => ({ ...p, description: e.target.value }))} />
                  <input className={inputCls} placeholder="Tags (comma-separated): React, FastAPI, Python"
                    value={newProj.tags} onChange={e => setNewProj(p => ({ ...p, tags: e.target.value }))} />
                  <input className={inputCls} placeholder="GitHub URL (optional)"
                    value={newProj.github_url} onChange={e => setNewProj(p => ({ ...p, github_url: e.target.value }))} />
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={newProj.featured} onChange={e => setNewProj(p => ({ ...p, featured: e.target.checked }))}
                      className="accent-violet-500" />
                    Featured on portfolio
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={handleAddProject}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg text-xs transition-colors">
                    Insert Project
                  </button>
                  {projMsg && <StatusBadge msg={projMsg.text} ok={projMsg.ok} />}
                </div>
              </div>

              {/* Records list */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Database Records ({projects.length})
                  </h4>
                  <button onClick={loadProjects} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                    {projLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refresh
                  </button>
                </div>
                <div className="divide-y divide-[#1f212e]">
                  {projects.map(p => (
                    <div key={p.id} className="py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold text-white truncate">{p.title}</h5>
                          {p.featured && <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded">Featured</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{p.description}</p>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {p.tags.map((tag, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">{tag}</span>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleToggleFeatured(p)}
                          className="text-[10px] px-2 py-1 border border-zinc-700 text-gray-400 hover:text-white hover:border-violet-500 rounded transition-colors">
                          {p.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button onClick={() => handleDeleteProject(p.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!projLoading && projects.length === 0 && (
                    <p className="text-xs text-gray-600 py-6 text-center">No projects yet. Add one above or run the SQL migration.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── EXPERIENCE ─────────────────────────────────────────────── */}
          {activeTab === 'experience' && (
            <div className="space-y-8">
              {/* Add form */}
              <div className="p-6 bg-zinc-900/40 border border-[#1f212e] rounded-xl space-y-4 max-w-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-violet-500" /> Add Experience Entry
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Role</label>
                    <input className={inputCls} placeholder="AI Engineer" value={newExp.role}
                      onChange={e => setNewExp(x => ({ ...x, role: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Company</label>
                    <input className={inputCls} placeholder="Flagship AI" value={newExp.company}
                      onChange={e => setNewExp(x => ({ ...x, company: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Period</label>
                    <input className={inputCls} placeholder="2024 - Present" value={newExp.period}
                      onChange={e => setNewExp(x => ({ ...x, period: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Sort Order</label>
                    <input type="number" className={inputCls} value={newExp.sort_order}
                      onChange={e => setNewExp(x => ({ ...x, sort_order: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea rows={3} className={inputCls} value={newExp.description}
                      onChange={e => setNewExp(x => ({ ...x, description: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={handleAddExperience}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg text-xs transition-colors">
                    Add Entry
                  </button>
                  {expMsg && <StatusBadge msg={expMsg.text} ok={expMsg.ok} />}
                </div>
              </div>

              {/* Records list */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entries ({experience.length})</h4>
                  <button onClick={loadExperience} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                    {expLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refresh
                  </button>
                </div>
                <div className="border-l border-zinc-800 pl-6 space-y-6">
                  {experience.map(exp => (
                    <div key={exp.id} className="relative flex items-start justify-between gap-4">
                      <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-violet-500" />
                      <div>
                        <h5 className="text-sm font-semibold text-white">{exp.role}</h5>
                        <p className="text-xs text-gray-500">{exp.company} · {exp.period}</p>
                        <p className="text-xs text-gray-400 mt-1">{exp.description}</p>
                      </div>
                      <button onClick={() => handleDeleteExperience(exp.id)} className="shrink-0 p-2 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {!expLoading && experience.length === 0 && (
                    <p className="text-xs text-gray-600 py-4">No entries yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SKILLS ─────────────────────────────────────────────────── */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              {/* Add form */}
              <div className="p-6 bg-zinc-900/40 border border-[#1f212e] rounded-xl space-y-4 max-w-sm">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-violet-500" /> Add Skill
                </h4>
                <div className="grid gap-3">
                  <div>
                    <label className={labelCls}>Skill Name</label>
                    <input className={inputCls} placeholder="e.g. LangGraph" value={newSkillName}
                      onChange={e => setNewSkillName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSkill()} />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select className={inputCls} value={newSkillCat} onChange={e => setNewSkillCat(e.target.value)}>
                      <option value="general">General</option>
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="ai">AI / ML</option>
                      <option value="infra">Infra / DB</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={handleAddSkill}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg text-xs transition-colors">
                    Add Skill
                  </button>
                  {skillMsg && <StatusBadge msg={skillMsg.text} ok={skillMsg.ok} />}
                </div>
              </div>

              {/* Skills grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Skills ({skills.length})</h4>
                  <button onClick={loadSkills} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                    {skillLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refresh
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg group hover:border-red-500/40 transition-colors">
                      <span className="text-sm text-gray-300">{s.name}</span>
                      <span className="text-[10px] text-gray-600">{s.category}</span>
                      <button onClick={() => handleDeleteSkill(s.id)} className="text-gray-700 hover:text-red-400 transition-colors ml-1">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {!skillLoading && skills.length === 0 && (
                    <p className="text-xs text-gray-600">No skills yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PROMPTS (Phase 3 placeholder) ──────────────────────────── */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="p-6 bg-zinc-900/40 border border-[#1f212e] rounded-xl space-y-4 max-w-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-500" /> KAIROS System Prompts
                </h4>
                <p className="text-xs text-gray-500">Tune KAIROS's personality and system constraints. Persisted to Supabase and LangGraph.</p>
                <div>
                  <label className={labelCls}>System Instruction</label>
                  <textarea defaultValue="You are KAIROS, Harish Kamireddi's AI Assistant representation. Ground all answers strictly in the knowledge base. Be professional, concise, and direct." rows={6}
                    className={inputCls + ' font-mono'} />
                </div>
                <div>
                  <label className={labelCls}>Temperature</label>
                  <input type="number" defaultValue={0.2} step={0.1} min={0} max={1} className={inputCls + ' w-24'} />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => alert('Phase 3: will persist to Supabase.')}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg text-xs transition-colors">
                    Save Configuration
                  </button>
                  <span className="text-[10px] text-zinc-600">Persistence coming in Phase 3</span>
                </div>
              </div>
            </div>
          )}

          {/* ── KNOWLEDGE / SETTINGS (Phase 3 placeholder) ─────────────── */}
          {(activeTab === 'knowledge' || activeTab === 'settings') && (
            <div className="text-center py-16">
              <Database className="w-10 h-10 text-violet-500/30 mx-auto mb-4" />
              <h5 className="text-white text-sm font-semibold">Coming in Phase 3</h5>
              <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
                {activeTab === 'knowledge'
                  ? 'Upload documents to build the RAG knowledge base powering the AI chat assistant.'
                  : 'Global configuration settings stored in Supabase.'}
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

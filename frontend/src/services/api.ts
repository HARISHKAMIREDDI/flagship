/**
 * Centralised API client for the Flagship FastAPI backend.
 * All fetch calls go through the typed helpers below.
 */

const API_BASE = 'http://localhost:8000/api';

// ── Types ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: number;
  name: string;
  tagline: string;
  bio: string;
  github_url?: string;
  linkedin_url?: string;
  email?: string;
  avatar_url?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  github_url?: string;
  live_url?: string;
  featured: boolean;
  created_at?: string;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  sort_order: number;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  sort_order: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user_id: string; email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ── Health ────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () =>
    request<{ status: string; project_name: string; supabase_configured: boolean; gemini_configured: boolean }>(
      '/health'
    ),
};

// ── Profile ───────────────────────────────────────────────────────────────

export const profileApi = {
  get: () => request<Profile>('/profile'),
  update: (id: number, data: Omit<Profile, 'id'>) =>
    request<Profile>(`/profile/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Projects ──────────────────────────────────────────────────────────────

export const projectsApi = {
  list: (featuredOnly = false) =>
    request<Project[]>(`/projects${featuredOnly ? '?featured_only=true' : ''}`),
  create: (data: Omit<Project, 'id' | 'created_at'>) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Omit<Project, 'id' | 'created_at'>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
};

// ── Experience ────────────────────────────────────────────────────────────

export const experienceApi = {
  list: () => request<Experience[]>('/experience'),
  create: (data: Omit<Experience, 'id'>) =>
    request<Experience>('/experience', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Omit<Experience, 'id'>) =>
    request<Experience>(`/experience/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/experience/${id}`, { method: 'DELETE' }),
};

// ── Skills ────────────────────────────────────────────────────────────────

export const skillsApi = {
  list: () => request<Skill[]>('/skills'),
  create: (data: Omit<Skill, 'id'>) =>
    request<Skill>('/skills', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/skills/${id}`, { method: 'DELETE' }),
};


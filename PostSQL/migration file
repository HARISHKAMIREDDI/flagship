-- ============================================================
-- Flagship AI Portfolio Platform — Supabase SQL Migration
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
create table if not exists profiles (
  id          bigint primary key generated always as identity,
  name        text not null,
  tagline     text not null,
  bio         text not null default '',
  github_url  text,
  linkedin_url text,
  email       text,
  avatar_url  text,
  updated_at  timestamptz default now()
);

-- Seed with one default row (edit values as needed)
insert into profiles (name, tagline, bio, github_url, linkedin_url, email)
values (
  'Harish Kamireddi',
  'AI Engineer — FastAPI · React · LangGraph',
  'I build production-quality AI applications, full-stack architectures, and multi-agent systems.',
  'https://github.com/HARISHKAMIREDDI',
  'https://www.linkedin.com/in/harish-kamireddi-a5a3b52a7',
  'harishkamireddi@zohomail.in'
)
on conflict do nothing;

-- ── 2. PROJECTS ─────────────────────────────────────────────
create table if not exists projects (
  id           bigint primary key generated always as identity,
  title        text not null,
  description  text not null default '',
  tags         text[] default '{}',
  github_url   text,
  live_url     text,
  featured     boolean default false,
  created_at   timestamptz default now()
);

-- Seed sample rows
insert into projects (title, description, tags, github_url, featured)
values
  (
    'AI Portfolio & CMS Platform',
    'This website: a multi-tier digital replica with a FastAPI assistant and custom admin CMS.',
    array['React', 'FastAPI', 'Supabase', 'LangGraph'],
    'https://github.com/HARISHKAMIREDDI/flagship',
    true
  ),
  (
    'Multi-Agent Analyst System',
    'A collaborative AI swarm using LangGraph for automated web research and financial reports.',
    array['LangGraph', 'Gemini 1.5', 'Python', 'Tavily'],
    '#',
    true
  )
on conflict do nothing;

-- ── 3. EXPERIENCE ───────────────────────────────────────────
create table if not exists experience (
  id           bigint primary key generated always as identity,
  role         text not null,
  company      text not null,
  period       text not null,
  description  text not null default '',
  sort_order   int default 0
);

-- Seed sample row
insert into experience (role, company, period, description, sort_order)
values (
  'AI Developer / Architect',
  'Flagship Projects',
  '2024 - Present',
  'Designing agentic architectures and CMS integration layers.',
  0
)
on conflict do nothing;

-- ── 4. SKILLS ───────────────────────────────────────────────
create table if not exists skills (
  id          bigint primary key generated always as identity,
  name        text not null,
  category    text default 'general',
  sort_order  int default 0
);

-- Seed skill tags
insert into skills (name, category, sort_order)
values
  ('React',              'frontend',  0),
  ('TypeScript',         'frontend',  1),
  ('Tailwind CSS',       'frontend',  2),
  ('FastAPI',            'backend',   3),
  ('Python',             'backend',   4),
  ('LangGraph',          'ai',        5),
  ('LangChain',          'ai',        6),
  ('Supabase',           'infra',     7),
  ('PostgreSQL',         'infra',     8),
  ('Vector Embeddings',  'ai',        9),
  ('Gemini API',         'ai',        10)
on conflict do nothing;

-- ── 5. ROW-LEVEL SECURITY (RLS) ─────────────────────────────
-- Public read on all tables (portfolio is public-facing)
alter table profiles  enable row level security;
alter table projects  enable row level security;
alter table experience enable row level security;
alter table skills    enable row level security;

create policy "Public read profiles"   on profiles   for select using (true);
create policy "Public read projects"   on projects   for select using (true);
create policy "Public read experience" on experience for select using (true);
create policy "Public read skills"     on skills     for select using (true);

-- Authenticated write (service role key bypasses RLS — used by backend)
create policy "Auth write profiles"   on profiles   for all using (auth.role() = 'authenticated');
create policy "Auth write projects"   on projects   for all using (auth.role() = 'authenticated');
create policy "Auth write experience" on experience for all using (auth.role() = 'authenticated');
create policy "Auth write skills"     on skills     for all using (auth.role() = 'authenticated');


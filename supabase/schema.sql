-- Scriptshot — Phase 1 schema
-- Run this once in your Supabase project's SQL editor.

create extension if not exists "pgcrypto";

create table if not exists project (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  format text not null,
  duration text not null,
  idea text,
  status text not null default 'idea',
  created_at timestamptz not null default now()
);

-- No RLS / auth yet — Phase 1 is single-owner (you) and the app uses the
-- anon key directly. Add auth + row-level security when the Future Phase
-- (auth & collaboration) is scoped. Until then this table is open to
-- anyone holding the anon key, which is an accepted Phase 1 trade-off.
alter table project enable row level security;

create policy "anon full access (phase 1, no auth)"
  on project
  for all
  to anon
  using (true)
  with check (true);

-- Scriptshot — Phase 7 schema
-- Run this in your Supabase project's SQL editor, after phase6 (no schema
-- changes in Phase 6, so this follows phase5.sql).

create table if not exists opportunity_shot (
  id uuid primary key default gen_random_uuid(),
  description text not null default '',
  type text,
  location_id uuid references location(id) on delete set null,
  reference text,
  notes text,
  project_id uuid references project(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table opportunity_shot enable row level security;

create policy "anon full access (phase 1, no auth)"
  on opportunity_shot for all to anon using (true) with check (true);

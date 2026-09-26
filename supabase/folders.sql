-- Scriptshot — Folders
-- Run this in your Supabase project's SQL editor, after phase7.sql.

create table if not exists folder (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table folder enable row level security;

create policy "anon full access (phase 1, no auth)"
  on folder for all to anon using (true) with check (true);

alter table project
  add column if not exists folder_id uuid references folder(id) on delete set null;

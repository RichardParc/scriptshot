-- Scriptshot — Phase 2 schema
-- Run this in your Supabase project's SQL editor, after schema.sql.

create table if not exists story_block (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project(id) on delete cascade,
  title text not null,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists voice_over (
  id uuid primary key default gen_random_uuid(),
  story_block_id uuid not null references story_block(id) on delete cascade,
  text text not null default '',
  recorded boolean not null default false,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists scene (
  id uuid primary key default gen_random_uuid(),
  story_block_id uuid not null references story_block(id) on delete cascade,
  voice_over_id uuid references voice_over(id) on delete set null,
  description text not null default '',
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

-- Same Phase 1 trade-off: no auth yet, open to the anon key.
alter table story_block enable row level security;
alter table voice_over enable row level security;
alter table scene enable row level security;

create policy "anon full access (phase 1, no auth)"
  on story_block for all to anon using (true) with check (true);

create policy "anon full access (phase 1, no auth)"
  on voice_over for all to anon using (true) with check (true);

create policy "anon full access (phase 1, no auth)"
  on scene for all to anon using (true) with check (true);

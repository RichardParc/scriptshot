-- Scriptshot — Phase 5 schema
-- Run this in your Supabase project's SQL editor, after phase4.sql.
--
-- Turns `scene.location` (free text) into a proper `location` table, so
-- scenes from different projects can share the same location record —
-- this is what makes shooting-by-location (Fase 5) possible.

create table if not exists location (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table location enable row level security;

create policy "anon full access (phase 1, no auth)"
  on location for all to anon using (true) with check (true);

alter table scene
  add column if not exists location_id uuid references location(id) on delete set null;

-- Migrate any existing free-text locations into the location table,
-- then point each scene at the matching record.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'scene' and column_name = 'location'
  ) then
    insert into location (name)
    select distinct trim(location)
    from scene
    where location is not null and trim(location) <> ''
    on conflict (name) do nothing;

    update scene s
    set location_id = l.id
    from location l
    where s.location is not null
      and trim(s.location) <> ''
      and trim(s.location) = l.name;

    alter table scene drop column location;
  end if;
end $$;

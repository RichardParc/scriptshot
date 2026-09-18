-- Scriptshot — Phase 4 schema
-- Run this in your Supabase project's SQL editor, after phase3.sql.

alter table scene
  add column if not exists status text not null default 'pendiente';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'scene_status_check'
  ) then
    alter table scene
      add constraint scene_status_check
      check (status in ('pendiente', 'grabada', 'repetir'));
  end if;
end $$;

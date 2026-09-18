-- Scriptshot — Phase 3 schema
-- Run this in your Supabase project's SQL editor, after phase2.sql.

alter table scene
  add column if not exists camera text,
  add column if not exists angle text,
  add column if not exists movement text,
  add column if not exists location text,
  add column if not exists requirements text[] not null default '{}',
  add column if not exists reference text,
  add column if not exists post_production boolean not null default false,
  add column if not exists post_production_notes text,
  add column if not exists notes text;

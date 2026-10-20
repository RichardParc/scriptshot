-- Scriptshot — Referentes por proyecto
-- Run once in the Supabase SQL editor. Image files stay in a private bucket;
-- access is limited to the owner of the matching project.

begin;

create table if not exists public.project_reference (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.project(id) on delete cascade,
  kind text not null check (kind in ('link', 'image')),
  title text not null,
  url text,
  storage_path text,
  created_at timestamptz not null default now(),
  constraint project_reference_target_check check (
    (kind = 'link' and url is not null and storage_path is null)
    or
    (kind = 'image' and url is null and storage_path is not null)
  )
);

create index if not exists project_reference_project_created_idx
  on public.project_reference(project_id, created_at);

alter table public.project_reference enable row level security;
drop policy if exists project_reference_owner_access on public.project_reference;
create policy project_reference_owner_access on public.project_reference
  for all to authenticated
  using (exists (
    select 1 from public.project p
    where p.id = project_reference.project_id and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.project p
    where p.id = project_reference.project_id and p.owner_id = auth.uid()
  ));

grant select, insert, delete on public.project_reference to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-references',
  'project-references',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists project_references_storage_read on storage.objects;
create policy project_references_storage_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-references'
    and exists (
      select 1 from public.project p
      where p.id::text = (storage.foldername(name))[1]
        and p.owner_id = auth.uid()
    )
  );

-- Storage returns the inserted object metadata after upload. Allow the
-- authenticated uploader to read that object as well, so the upload response
-- passes SELECT RLS even when project-folder checks don't match its metadata.
drop policy if exists project_references_storage_owner_read on storage.objects;
create policy project_references_storage_owner_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-references'
    and owner_id = (select auth.uid()::text)
  );

drop policy if exists project_references_storage_insert on storage.objects;
create policy project_references_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-references'
    and exists (
      select 1 from public.project p
      where p.id::text = (storage.foldername(name))[1]
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists project_references_storage_delete on storage.objects;
create policy project_references_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'project-references'
    and owner_id = (select auth.uid()::text)
  );

commit;

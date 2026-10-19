-- Scriptshot: enable account-based access and assign the existing workspace
-- to its first account. Run only after creating that account in /login.
-- Replace the UUID below with that account's id from Supabase Auth > Users.
-- This migration is transactional and intentionally removes the old anon policies.

begin;

do $$
declare
  data_owner uuid := 'REPLACE_WITH_AUTH_USER_UUID'::uuid;
  policy_row record;
begin
  if not exists (select 1 from auth.users where id = data_owner) then
    raise exception 'The configured owner UUID is not present in auth.users';
  end if;

  alter table project add column if not exists owner_id uuid references auth.users(id);
  alter table folder add column if not exists owner_id uuid references auth.users(id);
  alter table location add column if not exists owner_id uuid references auth.users(id);
  alter table opportunity_shot add column if not exists owner_id uuid references auth.users(id);
  alter table preset_option add column if not exists owner_id uuid references auth.users(id);

  update project set owner_id = data_owner where owner_id is null;
  update folder set owner_id = data_owner where owner_id is null;
  update location set owner_id = data_owner where owner_id is null;
  update opportunity_shot set owner_id = data_owner where owner_id is null;
  update preset_option set owner_id = data_owner where owner_id is null;

  alter table project alter column owner_id set default auth.uid();
  alter table project alter column owner_id set not null;
  alter table folder alter column owner_id set default auth.uid();
  alter table folder alter column owner_id set not null;
  alter table location alter column owner_id set default auth.uid();
  alter table location alter column owner_id set not null;
  alter table opportunity_shot alter column owner_id set default auth.uid();
  alter table opportunity_shot alter column owner_id set not null;
  alter table preset_option alter column owner_id set default auth.uid();
  alter table preset_option alter column owner_id set not null;

  alter table project enable row level security;
  alter table folder enable row level security;
  alter table location enable row level security;
  alter table opportunity_shot enable row level security;
  alter table preset_option enable row level security;
  alter table story_block enable row level security;
  alter table voice_over enable row level security;
  alter table scene enable row level security;

  -- Locations are unique per account, not globally across every Scriptshot user.
  alter table location drop constraint if exists location_name_key;
  create unique index if not exists location_owner_name_key on location(owner_id, name);

  -- Remove every previous permissive policy on the app's data tables.
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('project', 'folder', 'location', 'opportunity_shot', 'preset_option', 'story_block', 'voice_over', 'scene')
  loop
    execute format('drop policy %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;

  create policy project_owner_access on project for all to authenticated
    using (owner_id = auth.uid())
    with check (owner_id = auth.uid() and (folder_id is null or exists (
      select 1 from folder f where f.id = project.folder_id and f.owner_id = auth.uid()
    )));
  create policy folder_owner_access on folder for all to authenticated
    using (owner_id = auth.uid()) with check (owner_id = auth.uid());
  create policy location_owner_access on location for all to authenticated
    using (owner_id = auth.uid()) with check (owner_id = auth.uid());
  create policy opportunity_owner_access on opportunity_shot for all to authenticated
    using (owner_id = auth.uid())
    with check (owner_id = auth.uid()
      and (project_id is null or exists (
        select 1 from project p where p.id = opportunity_shot.project_id and p.owner_id = auth.uid()
      ))
      and (location_id is null or exists (
        select 1 from location l where l.id = opportunity_shot.location_id and l.owner_id = auth.uid()
      ))
    );
  create policy preset_owner_access on preset_option for all to authenticated
    using (owner_id = auth.uid()) with check (owner_id = auth.uid());

  create policy story_block_owner_access on story_block for all to authenticated
    using (exists (
      select 1 from project p where p.id = story_block.project_id and p.owner_id = auth.uid()
    ))
    with check (exists (
      select 1 from project p where p.id = story_block.project_id and p.owner_id = auth.uid()
    ));

  create policy voice_over_owner_access on voice_over for all to authenticated
    using (exists (
      select 1 from story_block b join project p on p.id = b.project_id
      where b.id = voice_over.story_block_id and p.owner_id = auth.uid()
    ))
    with check (exists (
      select 1 from story_block b join project p on p.id = b.project_id
      where b.id = voice_over.story_block_id and p.owner_id = auth.uid()
    ));

  create policy scene_owner_access on scene for all to authenticated
    using (exists (
      select 1 from story_block b join project p on p.id = b.project_id
      where b.id = scene.story_block_id and p.owner_id = auth.uid()
    ))
    with check (exists (
      select 1 from story_block b join project p on p.id = b.project_id and p.owner_id = auth.uid()
      where b.id = scene.story_block_id
        and (scene.location_id is null or exists (
          select 1 from location l where l.id = scene.location_id and l.owner_id = auth.uid()
        ))
    ));
end $$;

commit;

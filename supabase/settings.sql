-- Scriptshot — Settings (editable preset lists)
-- Run this in your Supabase project's SQL editor, after folders.sql.
--
-- Moves camera/angle/movement/requirement/opportunity-type options from
-- hardcoded constants into a real table, editable from /configuracion.
-- Seeded with the values that were previously hardcoded, so nothing
-- changes for existing scenes/opportunities until you edit a list.

create table if not exists preset_option (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  label text not null,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

alter table preset_option enable row level security;

create policy "anon full access (phase 1, no auth)"
  on preset_option for all to anon using (true) with check (true);

insert into preset_option (category, label, "order")
select * from (values
  ('camera_type', 'General', 0),
  ('camera_type', 'Lejano', 1),
  ('camera_type', 'Medio', 2),
  ('camera_type', 'Cercano', 3),
  ('camera_type', 'Close-up', 4),
  ('camera_type', 'Detalle', 5),
  ('camera_type', 'POV', 6),
  ('camera_type', 'Selfie', 7),
  ('camera_type', 'Drone', 8),
  ('camera_type', 'Seguimiento', 9),
  ('camera_type', 'Movimiento', 10),
  ('camera_type', 'Plano fijo', 11),

  ('camera_angle', 'Frontal', 0),
  ('camera_angle', 'Lateral', 1),
  ('camera_angle', 'Trasero', 2),
  ('camera_angle', 'Cenital', 3),
  ('camera_angle', 'Contrapicado', 4),
  ('camera_angle', 'Picado', 5),
  ('camera_angle', 'Subjetivo', 6),

  ('camera_movement', 'Fijo', 0),
  ('camera_movement', 'Pan', 1),
  ('camera_movement', 'Tilt', 2),
  ('camera_movement', 'Travelling', 3),
  ('camera_movement', 'Seguimiento', 4),
  ('camera_movement', 'Handheld', 5),
  ('camera_movement', 'Drone', 6),

  ('scene_requirement', 'Drone', 0),
  ('scene_requirement', 'Cámara submarina', 1),
  ('scene_requirement', 'GoPro', 2),
  ('scene_requirement', 'Trípode', 3),
  ('scene_requirement', 'Micrófono', 4),
  ('scene_requirement', 'Actor', 5),
  ('scene_requirement', 'Animal', 6),
  ('scene_requirement', 'Luz', 7),
  ('scene_requirement', 'Vehículo', 8),
  ('scene_requirement', 'Props', 9),

  ('opportunity_type', 'Animal', 0),
  ('opportunity_type', 'Paisaje', 1),
  ('opportunity_type', 'Clima', 2),
  ('opportunity_type', 'Persona', 3),
  ('opportunity_type', 'Aéreo', 4),
  ('opportunity_type', 'Textura', 5),
  ('opportunity_type', 'Calle', 6),
  ('opportunity_type', 'Momento espontáneo', 7),
  ('opportunity_type', 'Comportamiento animal', 8)
) as seed(category, label, "order")
where not exists (select 1 from preset_option limit 1);

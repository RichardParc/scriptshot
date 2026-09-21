export const PROJECT_FORMATS = [
  "Carrusel",
  "Reel vertical",
  "Cuadrado",
  "Semivertical",
  "16:9 horizontal",
] as const;

export type ProjectFormat = (typeof PROJECT_FORMATS)[number];

export const PROJECT_DURATIONS = [
  "15s",
  "30s",
  "60s",
  "90s",
  "2 min",
  "5 min",
  "Otro",
] as const;

export type ProjectDuration = (typeof PROJECT_DURATIONS)[number];

// Computed by lib/status.ts as of Phase 6 — never set by hand outside of
// project creation's initial default. See computeProjectStatus.
export const PROJECT_STATUSES = [
  "idea",
  "en_planificacion",
  "listo_para_rodaje",
  "en_rodaje",
  "faltan_tomas",
  "falta_voz_en_off",
  "listo_para_editar",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;
  name: string;
  format: ProjectFormat;
  duration: ProjectDuration;
  idea: string | null;
  status: ProjectStatus;
  created_at: string;
}

export type NewProject = Pick<Project, "name" | "format" | "duration" | "idea">;

export interface VoiceOver {
  id: string;
  story_block_id: string;
  text: string;
  recorded: boolean;
  order: number;
}

export const SCENE_STATUSES = ["pendiente", "grabada", "repetir"] as const;
export type SceneStatus = (typeof SCENE_STATUSES)[number];

export interface Location {
  id: string;
  name: string;
}

export interface Scene {
  id: string;
  story_block_id: string;
  voice_over_id: string | null;
  description: string;
  order: number;
  camera: string | null;
  angle: string | null;
  movement: string | null;
  location_id: string | null;
  // Present only when fetched with the `location(name)` embed — not a
  // real column, never send this back on an update.
  location?: { id: string; name: string } | null;
  requirements: string[] | null;
  reference: string | null;
  post_production: boolean;
  post_production_notes: string | null;
  notes: string | null;
  status: SceneStatus;
}

export interface FlatScene extends Scene {
  blockTitle: string;
  // Only set in location-based RODAJE (Phase 5), where scenes come from
  // multiple projects.
  projectName?: string;
}

export const CAMERA_TYPES = [
  "General",
  "Lejano",
  "Medio",
  "Cercano",
  "Close-up",
  "Detalle",
  "POV",
  "Selfie",
  "Drone",
  "Seguimiento",
  "Movimiento",
  "Plano fijo",
] as const;

export const CAMERA_ANGLES = [
  "Frontal",
  "Lateral",
  "Trasero",
  "Cenital",
  "Contrapicado",
  "Picado",
  "Subjetivo",
] as const;

export const CAMERA_MOVEMENTS = [
  "Fijo",
  "Pan",
  "Tilt",
  "Travelling",
  "Seguimiento",
  "Handheld",
  "Drone",
] as const;

export const SCENE_REQUIREMENTS = [
  "Drone",
  "Cámara submarina",
  "GoPro",
  "Trípode",
  "Micrófono",
  "Actor",
  "Animal",
  "Luz",
  "Vehículo",
  "Props",
] as const;

export interface StoryBlock {
  id: string;
  project_id: string;
  title: string;
  order: number;
  voice_over: VoiceOver[];
  scene: Scene[];
}

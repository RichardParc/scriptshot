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

// Manual for Phase 1. Becomes computed (per section 34/35 of the product
// spec) once story/voice-over/scenes exist in Phase 2+.
export const PROJECT_STATUSES = [
  "idea",
  "en_planificacion",
  "listo_para_rodaje",
  "en_rodaje",
  "faltan_tomas",
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

export interface Scene {
  id: string;
  story_block_id: string;
  voice_over_id: string | null;
  description: string;
  order: number;
  camera: string | null;
  angle: string | null;
  movement: string | null;
  location: string | null;
  requirements: string[] | null;
  reference: string | null;
  post_production: boolean;
  post_production_notes: string | null;
  notes: string | null;
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

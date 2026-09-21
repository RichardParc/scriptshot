import type { ProjectStatus, SceneStatus } from "./types";

interface StatusInput {
  hasBlocks: boolean;
  scenes: { status: SceneStatus }[];
  voiceOvers: { recorded: boolean }[];
}

/**
 * The single place project status is decided. Never set this by hand
 * elsewhere — compute it fresh from live data every time it's displayed,
 * so it can never drift out of sync with the actual shot list.
 */
export function computeProjectStatus({
  hasBlocks,
  scenes,
  voiceOvers,
}: StatusInput): ProjectStatus {
  if (!hasBlocks) return "idea";
  if (scenes.length === 0) return "en_planificacion";

  const recorded = scenes.filter((s) => s.status === "grabada").length;
  const pending = scenes.filter((s) => s.status === "pendiente").length;
  const repeat = scenes.filter((s) => s.status === "repetir").length;

  // Nothing attempted yet.
  if (recorded === 0 && repeat === 0) return "listo_para_rodaje";

  // Every scene recorded — readiness now depends only on voice-over.
  if (recorded === scenes.length) {
    const totalVO = voiceOvers.length;
    const recordedVO = voiceOvers.filter((v) => v.recorded).length;
    if (totalVO > 0 && recordedVO < totalVO) return "falta_voz_en_off";
    return "listo_para_editar";
  }

  // Been through the whole list once (no untouched scenes left), but some
  // still need a retake.
  if (pending === 0) return "faltan_tomas";

  // Still working through untouched scenes for the first time.
  return "en_rodaje";
}

export interface ProjectSummary {
  status: ProjectStatus;
  recordedScenes: number;
  totalScenes: number;
}

export function computeProjectSummary(
  blocks: {
    scene: { status: SceneStatus }[];
    voice_over: { recorded: boolean }[];
  }[]
): ProjectSummary {
  const hasBlocks = blocks.length > 0;
  const scenes = blocks.flatMap((b) => b.scene ?? []);
  const voiceOvers = blocks.flatMap((b) => b.voice_over ?? []);

  return {
    status: computeProjectStatus({ hasBlocks, scenes, voiceOvers }),
    recordedScenes: scenes.filter((s) => s.status === "grabada").length,
    totalScenes: scenes.length,
  };
}

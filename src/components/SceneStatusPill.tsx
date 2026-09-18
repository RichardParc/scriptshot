import type { SceneStatus } from "@/lib/types";

const LABEL: Record<SceneStatus, string> = {
  pendiente: "PENDIENTE",
  grabada: "GRABADA",
  repetir: "A REPETIR",
};

const COLOR: Record<SceneStatus, string> = {
  pendiente: "bg-status-idea",
  grabada: "bg-status-ready",
  repetir: "bg-status-shooting",
};

const TEXT: Record<SceneStatus, string> = {
  pendiente: "text-text-secondary",
  grabada: "text-status-ready",
  repetir: "text-status-shooting",
};

export function SceneStatusPill({ status }: { status: SceneStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide ${TEXT[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${COLOR[status]}`} />
      {LABEL[status]}
    </span>
  );
}

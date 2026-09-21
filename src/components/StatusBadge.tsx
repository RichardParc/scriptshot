import type { ProjectStatus } from "@/lib/types";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "IDEA",
  en_planificacion: "EN PLANIFICACIÓN",
  listo_para_rodaje: "LISTO PARA RODAJE",
  en_rodaje: "EN RODAJE",
  faltan_tomas: "FALTAN TOMAS",
  listo_para_editar: "LISTO PARA EDITAR",
};

export const STATUS_COLOR: Record<ProjectStatus, string> = {
  idea: "bg-status-idea",
  en_planificacion: "bg-status-planning",
  listo_para_rodaje: "bg-status-ready",
  en_rodaje: "bg-status-shooting",
  faltan_tomas: "bg-status-missing",
  listo_para_editar: "bg-status-edit",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-text-secondary">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLOR[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

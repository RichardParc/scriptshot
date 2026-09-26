import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/lib/types";
import type { ProjectSummary } from "@/lib/status";

export function ProjectCardGrid({
  projects,
  selectionMode,
  selectedIds,
  onToggleSelect,
}: {
  projects: { project: Project; summary: ProjectSummary }[];
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  if (projects.length === 0) {
    return (
      <p className="pl-6 text-sm text-text-secondary">
        Sin proyectos en esta carpeta.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map(({ project, summary }) => (
        <ProjectCard
          key={project.id}
          project={project}
          summary={summary}
          selectionMode={selectionMode}
          selected={selectedIds.has(project.id)}
          onToggleSelect={() => onToggleSelect(project.id)}
        />
      ))}
    </div>
  );
}

import Link from "next/link";
import { Clapperboard, Timer } from "lucide-react";
import type { Project } from "@/lib/types";
import type { ProjectSummary } from "@/lib/status";
import { StatusBadge, STATUS_COLOR } from "./StatusBadge";

export function ProjectCard({
  project,
  summary,
}: {
  project: Project;
  summary: ProjectSummary;
}) {
  const { status, recordedScenes, totalScenes } = summary;

  return (
    <Link
      href={`/project/${project.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-xl hover:shadow-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <div className={`h-1 w-full ${STATUS_COLOR[status]}`} />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="min-w-0 line-clamp-1 text-lg font-medium text-text-primary">
            {project.name}
          </h3>
          <div className="shrink-0">
            <StatusBadge status={status} />
          </div>
        </div>

        {project.idea ? (
          <p className="mb-4 line-clamp-3 flex-1 text-base text-text-secondary">
            {project.idea}
          </p>
        ) : (
          <p className="mb-4 flex-1 text-base italic text-text-disabled">
            Sin idea todavía.
          </p>
        )}

        {totalScenes > 0 && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between font-mono text-xs text-text-secondary">
              <span>
                {recordedScenes}/{totalScenes} tomas
              </span>
              <span>{Math.round((recordedScenes / totalScenes) * 100)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full ${STATUS_COLOR[status]}`}
                style={{ width: `${(recordedScenes / totalScenes) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-border pt-3 font-mono text-xs text-text-secondary">
          <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
            <Clapperboard size={12} />
            {project.format}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
            <Timer size={12} />
            {project.duration}
          </span>
        </div>
      </div>
    </Link>
  );
}

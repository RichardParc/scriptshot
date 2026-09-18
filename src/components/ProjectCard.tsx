import Link from "next/link";
import { Clapperboard, Timer } from "lucide-react";
import type { Project } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="group flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg hover:shadow-black/30"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 text-base font-medium text-text-primary">
          {project.name}
        </h3>
        <StatusBadge status={project.status} />
      </div>

      {project.idea ? (
        <p className="mb-4 line-clamp-3 flex-1 text-sm text-text-secondary">
          {project.idea}
        </p>
      ) : (
        <p className="mb-4 flex-1 text-sm italic text-text-disabled">
          Sin idea todavía.
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-3 font-mono text-[11px] text-text-secondary">
        <span className="flex items-center gap-1">
          <Clapperboard size={12} />
          {project.format}
        </span>
        <span className="flex items-center gap-1">
          <Timer size={12} />
          {project.duration}
        </span>
      </div>
    </Link>
  );
}

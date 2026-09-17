import Link from "next/link";
import type { Project } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="group block rounded-md border border-border bg-surface p-5 transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-medium text-text-primary">
          {project.name}
        </h3>
        <StatusBadge status={project.status} />
      </div>
      <div className="mt-2 flex items-center gap-2 font-mono text-xs text-text-secondary">
        <span>{project.format}</span>
        <span className="text-border-strong">·</span>
        <span>{project.duration}</span>
      </div>
      {project.idea && (
        <p className="mt-3 line-clamp-2 text-sm text-text-secondary">
          {project.idea}
        </p>
      )}
    </Link>
  );
}

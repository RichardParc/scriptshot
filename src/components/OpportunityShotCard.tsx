import Link from "next/link";
import { MapPin, Link as LinkIcon } from "lucide-react";
import type { OpportunityShot } from "@/lib/types";

export function OpportunityShotCard({
  shot,
  showProject = true,
}: {
  shot: OpportunityShot;
  showProject?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {shot.type && (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-text-secondary">
            {shot.type}
          </span>
        )}
        {shot.location && (
          <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 font-mono text-xs text-text-secondary">
            <MapPin size={11} />
            {shot.location.name}
          </span>
        )}
        {showProject && shot.project && (
          <Link
            href={`/project/${shot.project.id}`}
            className="rounded-full border border-accent/40 bg-accent-muted px-2 py-0.5 font-mono text-xs text-accent-hover hover:border-accent"
          >
            {shot.project.name}
          </Link>
        )}
      </div>

      <p className="mb-2 text-base text-text-primary">
        {shot.description || "Sin descripción."}
      </p>

      {shot.reference && (
        <a
          href={shot.reference}
          target="_blank"
          rel="noreferrer"
          className="mb-2 flex items-center gap-1.5 text-sm text-accent-hover hover:text-accent"
        >
          <LinkIcon size={13} />
          Ver referencia
        </a>
      )}

      {shot.notes && (
        <p className="text-sm text-text-secondary">{shot.notes}</p>
      )}
    </div>
  );
}

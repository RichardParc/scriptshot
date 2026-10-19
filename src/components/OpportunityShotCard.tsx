"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Link as LinkIcon, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { OpportunityShot } from "@/lib/types";
import { useConfirm } from "@/components/ui/useConfirm";

export function OpportunityShotCard({
  shot,
  showProject = true,
}: {
  shot: OpportunityShot;
  showProject?: boolean;
}) {
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = await confirm({
      title: "¿Eliminar esta toma de oportunidad?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Borrar",
    });
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabase
      .from("opportunity_shot")
      .delete()
      .eq("id", shot.id);

    if (error) {
      setDeleting(false);
      setError("No se pudo eliminar. Intenta de nuevo.");
      return;
    }

    setHidden(true);
    router.refresh();
  }

  if (hidden) return null;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface p-4 transition-all hover:border-border-strong hover:shadow-lg hover:shadow-black/20 sm:p-5">
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-accent/70 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 pl-1">
        <div className="flex flex-wrap items-center gap-2">
          {shot.type && (
            <span className="rounded-md border border-border bg-base/50 px-2 py-1 font-mono text-[10px] tracking-wide text-text-secondary">
              {shot.type}
            </span>
          )}
          {shot.location && (
            <span className="flex items-center gap-1 rounded-md border border-border bg-base/50 px-2 py-1 font-mono text-[10px] text-text-secondary">
              <MapPin size={11} />
              {shot.location.name}
            </span>
          )}
          {showProject && shot.project && (
            <Link
              href={`/project/${shot.project.id}`}
              className="rounded-md border border-accent/30 bg-accent-muted/70 px-2 py-1 font-mono text-[10px] text-accent-hover transition-colors hover:border-accent"
            >
              {shot.project.name}
            </Link>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Eliminar toma de oportunidad"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-status-missing/10 hover:text-status-missing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <p className="mb-3 pl-1 text-base leading-6 text-text-primary">
        {shot.description || "Sin descripción."}
      </p>

      {shot.reference && (
        <a
          href={shot.reference}
          target="_blank"
          rel="noreferrer"
          className="mb-3 flex items-center gap-2 rounded-md pl-1 text-sm font-medium text-accent-hover transition-opacity hover:opacity-80"
        >
          <LinkIcon size={13} />
          Ver referencia
        </a>
      )}

      {shot.notes && (
        <p className="text-sm text-text-secondary">{shot.notes}</p>
      )}

      {error && <p className="mt-2 text-sm text-status-missing">{error}</p>}

      {ConfirmModal}
    </div>
  );
}

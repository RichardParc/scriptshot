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
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
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
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Eliminar toma de oportunidad"
          className="rounded-sm text-text-secondary hover:text-status-missing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <p className="mb-2 text-base text-text-primary">
        {shot.description || "Sin descripción."}
      </p>

      {shot.reference && (
        <a
          href={shot.reference}
          target="_blank"
          rel="noreferrer"
          className="mb-2 flex items-center gap-1.5 text-sm text-accent-hover transition-opacity hover:opacity-80"
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

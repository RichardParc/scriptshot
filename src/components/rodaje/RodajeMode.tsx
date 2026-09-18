"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Camera,
  Compass,
  Move,
  MapPin,
  Link as LinkIcon,
  Wand2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { FlatScene, SceneStatus } from "@/lib/types";

export function RodajeMode({
  projectId,
  projectName,
  initialScenes,
}: {
  projectId: string;
  projectName: string;
  initialScenes: FlatScene[];
}) {
  const [scenes, setScenes] = useState<FlatScene[]>(initialScenes);
  const [index, setIndex] = useState<number>(() => {
    const firstPending = initialScenes.findIndex(
      (s) => s.status !== "grabada"
    );
    return firstPending === -1 ? 0 : firstPending;
  });

  const total = scenes.length;
  const recorded = useMemo(
    () => scenes.filter((s) => s.status === "grabada").length,
    [scenes]
  );
  const current = scenes[index];

  async function setStatus(status: SceneStatus, advance: boolean) {
    if (!current) return;
    const updated = scenes.map((s) =>
      s.id === current.id ? { ...s, status } : s
    );
    setScenes(updated);
    supabase.from("scene").update({ status }).eq("id", current.id);

    if (advance) {
      const nextPending = updated.findIndex(
        (s, i) => i > index && s.status !== "grabada"
      );
      if (nextPending !== -1) {
        setIndex(nextPending);
      } else if (index < total - 1) {
        setIndex(index + 1);
      }
    }
  }

  if (total === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-text-secondary">
          No hay escenas todavía en este proyecto.
        </p>
        <Link
          href={`/project/${projectId}`}
          className="rounded-md border border-border px-4 py-2 text-sm text-text-primary hover:border-border-strong"
        >
          Volver al proyecto
        </Link>
      </div>
    );
  }

  const allDone = recorded === total;

  return (
    <div className="flex min-h-screen flex-col bg-base">
      {/* Top bar */}
      <div className="border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link
            href={`/project/${projectId}`}
            className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary"
          >
            <ChevronLeft size={14} />
            {projectName}
          </Link>
          <span className="font-mono text-xs text-text-secondary">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="mx-auto mt-2 h-1.5 max-w-2xl overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${(recorded / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Scene content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {allDone ? (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-lg font-medium text-accent">
                RODAJE COMPLETADO
              </p>
              <p className="text-sm text-text-secondary">
                Todas las escenas están grabadas.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-text-secondary">
                {current.blockTitle}
              </p>
              <p className="mb-6 text-2xl leading-snug text-text-primary">
                {current.description || "Sin descripción."}
              </p>

              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {current.camera && (
                  <MetaTag icon={<Camera size={13} />} label={current.camera} />
                )}
                {current.angle && (
                  <MetaTag icon={<Compass size={13} />} label={current.angle} />
                )}
                {current.movement && (
                  <MetaTag icon={<Move size={13} />} label={current.movement} />
                )}
                {current.location && (
                  <MetaTag icon={<MapPin size={13} />} label={current.location} />
                )}
              </div>

              {current.requirements && current.requirements.length > 0 && (
                <div className="mb-6">
                  <p className="mb-2 font-mono text-[11px] text-text-secondary">
                    NECESIDADES
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {current.requirements.map((r) => (
                      <span
                        key={r}
                        className="rounded-sm border border-border px-2 py-1 text-xs text-text-secondary"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {current.reference && (
                <a
                  href={current.reference}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-6 flex items-center gap-2 text-sm text-accent hover:text-accent-hover"
                >
                  <LinkIcon size={14} />
                  Ver referencia
                </a>
              )}

              {current.post_production && (
                <div className="mb-6 rounded-sm border border-border bg-surface p-3">
                  <p className="mb-1 flex items-center gap-1.5 font-mono text-[11px] text-text-secondary">
                    <Wand2 size={12} />
                    POSTPRODUCCIÓN
                  </p>
                  <p className="text-sm text-text-secondary">
                    {current.post_production_notes || "Requiere postproducción."}
                  </p>
                </div>
              )}

              {current.notes && (
                <p className="text-sm text-text-secondary">{current.notes}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom nav — large touch targets */}
      <div className="border-t border-border px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="flex items-center justify-center rounded-md border border-border px-4 py-4 text-text-secondary hover:border-border-strong disabled:opacity-30"
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={() => setStatus("repetir", false)}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-status-shooting px-4 py-4 text-sm font-medium text-status-shooting hover:bg-status-shooting/10"
          >
            <RotateCcw size={18} />
            REPETIR
          </button>

          <button
            onClick={() => setStatus("grabada", true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-accent bg-accent-muted px-4 py-4 text-sm font-medium text-accent hover:bg-accent hover:text-base"
          >
            <Check size={18} />
            GRABADA
          </button>

          <button
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={index === total - 1}
            className="flex items-center justify-center rounded-md border border-border px-4 py-4 text-text-secondary hover:border-border-strong disabled:opacity-30"
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs text-text-secondary">
      {icon}
      {label}
    </div>
  );
}

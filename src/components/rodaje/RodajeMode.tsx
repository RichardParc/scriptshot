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
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { FlatScene, SceneStatus } from "@/lib/types";
import { SceneStatusPill } from "@/components/SceneStatusPill";

export function RodajeMode({
  backHref,
  backLabel,
  initialScenes,
}: {
  backHref: string;
  backLabel: string;
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
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: SceneStatus, advance: boolean) {
    if (!current) return;
    const { error } = await supabase
      .from("scene")
      .update({ status })
      .eq("id", current.id);

    if (error) {
      setError("No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }

    const updated = scenes.map((s) =>
      s.id === current.id ? { ...s, status } : s
    );
    setScenes(updated);

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
        <p className="text-base text-text-secondary">
          No hay escenas todavía en este proyecto.
        </p>
        <Link
          href={backHref}
          className="rounded-md border border-border px-4 py-2 text-base text-text-primary hover:border-border-strong"
        >
          Volver
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
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
          >
            <ChevronLeft size={14} />
            {backLabel}
          </Link>
          <span className="font-mono text-sm text-text-secondary">
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

      {error && (
<<<<<<< HEAD
        <div role="alert" className="flex items-center justify-between gap-3 border-b border-status-missing/40 bg-status-missing/10 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-status-missing">
=======
        <div className="flex items-center justify-between gap-3 border-b border-status-missing/40 bg-status-missing/10 px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-status-missing">
>>>>>>> efb76c43b01d98888bdc5a74d3dfa57c264e6781
            <AlertCircle size={14} />
            {error}
          </div>
          <button
            onClick={() => setError(null)}
<<<<<<< HEAD
            aria-label="Cerrar aviso"
            className="rounded-sm text-sm text-status-missing hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
=======
            className="text-xs text-status-missing hover:opacity-70"
>>>>>>> efb76c43b01d98888bdc5a74d3dfa57c264e6781
          >
            ✕
          </button>
        </div>
      )}

      {/* Scene content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {allDone ? (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-xl font-medium text-accent">
                RODAJE COMPLETADO
              </p>
              <p className="text-base text-text-secondary">
                Todas las escenas están grabadas.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-wide text-text-secondary">
                  {current.projectName
                    ? `${current.projectName} · ${current.blockTitle}`
                    : current.blockTitle}
                </p>
                <SceneStatusPill status={current.status} />
              </div>
              <p className="mb-6 text-3xl leading-snug text-text-primary">
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
                  <MetaTag icon={<MapPin size={13} />} label={current.location.name} />
                )}
              </div>

              {current.requirements && current.requirements.length > 0 && (
                <div className="mb-6">
                  <p className="mb-2 font-mono text-xs text-text-secondary">
                    NECESIDADES
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {current.requirements.map((r) => (
                      <span
                        key={r}
                        className="rounded-sm border border-border px-2 py-1 text-sm text-text-secondary"
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
                  className="mb-6 flex items-center gap-2 text-base text-accent hover:text-accent-hover"
                >
                  <LinkIcon size={14} />
                  Ver referencia
                </a>
              )}

              {current.post_production && (
                <div className="mb-6 rounded-sm border border-border bg-surface p-3">
                  <p className="mb-1 flex items-center gap-1.5 font-mono text-xs text-text-secondary">
                    <Wand2 size={12} />
                    POSTPRODUCCIÓN
                  </p>
                  <p className="text-base text-text-secondary">
                    {current.post_production_notes || "Requiere postproducción."}
                  </p>
                </div>
              )}

              {current.notes && (
                <p className="text-base text-text-secondary">{current.notes}</p>
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
            className="flex items-center justify-center rounded-md border border-border px-4 py-4 text-text-secondary hover:border-border-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={() => setStatus("repetir", false)}
            aria-pressed={current.status === "repetir"}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-4 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              current.status === "repetir"
                ? "border-status-shooting bg-status-shooting/20 text-status-shooting"
                : "border-status-shooting text-status-shooting hover:bg-status-shooting/10"
            }`}
          >
            <RotateCcw size={18} />
            REPETIR
          </button>

          <button
            onClick={() => setStatus("grabada", true)}
            aria-pressed={current.status === "grabada"}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-4 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              current.status === "grabada"
                ? "border-accent bg-accent text-accent-ink"
                : "border-accent bg-accent-muted text-accent hover:bg-accent hover:text-accent-ink"
            }`}
          >
            <Check size={18} />
            GRABADA
          </button>

          <button
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={index === total - 1}
            className="flex items-center justify-center rounded-md border border-border px-4 py-4 text-text-secondary hover:border-border-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-text-disabled">
          GRABADA: ya la tienes. REPETIR: quedó mal, hay que volver a grabarla.
        </p>
      </div>
    </div>
  );
}

function MetaTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-sm text-text-secondary">
      {icon}
      {label}
    </div>
  );
}

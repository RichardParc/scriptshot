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
import { QuickOpportunityButton } from "./QuickOpportunityButton";

export function RodajeMode({
  backHref,
  backLabel,
  initialScenes,
  projectId,
}: {
  backHref: string;
  backLabel: string;
  initialScenes: FlatScene[];
  projectId?: string;
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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/25 bg-accent-muted/60 text-accent-hover">
          <Camera size={28} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Aún no hay escenas para rodar</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
            Añade escenas al guion del proyecto y aparecerán aquí para acompañarte durante la grabación.
          </p>
        </div>
        <Link
          href={backHref}
          className="rounded-lg border border-border bg-surface-2 px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-border-strong"
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
      <div className="border-b border-border bg-surface/70 px-4 py-3 sm:py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex min-w-0 items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
          >
            <ChevronLeft size={14} className="shrink-0" />
            <span className="truncate">{backLabel}</span>
          </Link>
          <span className="shrink-0 rounded-md border border-border bg-base px-2.5 py-1 font-mono text-xs text-text-secondary">
            {String(index + 1).padStart(2, "0")} <span className="text-text-disabled">/</span> {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="mx-auto mt-3 flex max-w-2xl items-center gap-3">
          <div
            role="progressbar"
            aria-label="Progreso del rodaje"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={recorded}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"
          >
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{ width: `${(recorded / total) * 100}%` }}
          />
          </div>
          <span className="shrink-0 font-mono text-[10px] tracking-wide text-text-secondary">
            {recorded}/{total} LISTAS
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 border-b border-status-missing/40 bg-status-missing/10 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-status-missing">
            <AlertCircle size={14} />
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            aria-label="Cerrar aviso"
            className="rounded-sm text-sm text-status-missing hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scene content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:py-8">
        <div className="mx-auto max-w-2xl">
          {allDone ? (
            <>
              <div className="mb-6 flex flex-col items-center gap-2 rounded-2xl border border-accent/25 bg-accent-muted/30 px-5 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-ink">
                  <Check size={22} />
                </div>
                <p className="text-xl font-semibold tracking-wide text-text-primary">
                  RODAJE COMPLETADO
                </p>
                <p className="max-w-md text-sm leading-6 text-text-secondary">
                  Todas las escenas están grabadas. Repaso rápido abajo — toca
                  una escena para volver a verla.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {scenes.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIndex(i)}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      i === index
                        ? "border-accent bg-accent-muted"
                        : "border-border hover:border-border-strong"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate font-mono text-xs text-text-secondary">
                        {String(i + 1).padStart(2, "0")}
                        {s.projectName ? ` · ${s.projectName}` : ""} ·{" "}
                        {s.blockTitle}
                      </span>
                      <div className="shrink-0">
                        <SceneStatusPill status={s.status} />
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm text-text-primary">
                      {s.description || "Sin descripción."}
                    </p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:p-8">
              <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-52 w-52 rounded-full bg-accent/10 blur-3xl" />
              <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 truncate font-mono text-xs uppercase tracking-wide text-text-secondary">
                  {current.projectName
                    ? `${current.projectName} · ${current.blockTitle}`
                    : current.blockTitle}
                </p>
                <div className="shrink-0">
                  <SceneStatusPill status={current.status} />
                </div>
              </div>
              <p className="relative mb-6 text-3xl font-medium leading-snug tracking-tight text-text-primary sm:text-4xl">
                {current.description || "Sin descripción."}
              </p>

              {current.voiceOver && (
                <div className="relative mb-6 rounded-xl border border-accent/20 bg-accent-muted/20 p-4 sm:p-5">
                  <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-accent-hover">
                    VOZ EN OFF · {current.voiceOver.recorded ? "GRABADA" : "PENDIENTE"}
                  </p>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-text-primary">
                    {current.voiceOver.text || "Sin texto todavía."}
                  </p>
                </div>
              )}

              <div className="relative mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                <div className="relative mb-6">
                  <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-text-secondary">
                    NECESIDADES
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {current.requirements.map((r) => (
                      <span
                        key={r}
                        className="rounded-md border border-border bg-base/50 px-3 py-1.5 text-sm text-text-secondary"
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
                  className="relative mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-accent/25 bg-accent-muted/30 px-3 text-sm font-medium text-accent-hover transition-colors hover:bg-accent-muted/60"
                >
                  <LinkIcon size={14} />
                  Ver referencia
                </a>
              )}

              {current.post_production && (
                <div className="relative mb-6 rounded-xl border border-border bg-base/50 p-4">
                  <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-text-secondary">
                    <Wand2 size={12} />
                    POSTPRODUCCIÓN
                  </p>
                  <p className="text-base text-text-secondary">
                    {current.post_production_notes || "Requiere postproducción."}
                  </p>
                </div>
              )}

              {current.notes && (
                <p className="relative border-t border-border pt-4 text-sm leading-6 text-text-secondary">{current.notes}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav — large touch targets */}
      <div className="border-t border-border bg-surface/95 px-3 py-3 shadow-[0_-12px_32px_rgba(0,0,0,0.22)] sm:px-4 sm:py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="flex shrink-0 items-center justify-center rounded-lg border border-border bg-base px-3 py-3 text-text-secondary transition-colors hover:border-border-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-4 sm:py-4"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => setStatus("repetir", false)}
            aria-pressed={current.status === "repetir"}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-semibold tracking-wide text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:gap-2 sm:px-4 sm:py-4 sm:text-sm ${
              current.status === "repetir"
                ? "border-status-shooting bg-status-shooting/20"
                : "border-status-shooting hover:bg-status-shooting/10"
            }`}
          >
            <RotateCcw size={16} className="shrink-0" />
            <span className="truncate">REPETIR</span>
          </button>

          <button
            onClick={() => setStatus("grabada", true)}
            aria-pressed={current.status === "grabada"}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:gap-2 sm:px-4 sm:py-4 sm:text-sm ${
              current.status === "grabada"
                ? "border-accent bg-accent text-accent-ink"
                : "border-accent text-text-primary hover:bg-accent/10"
            }`}
          >
            <Check size={16} className="shrink-0" />
            <span className="truncate">GRABADA</span>
          </button>

          <button
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={index === total - 1}
            className="flex shrink-0 items-center justify-center rounded-lg border border-border bg-base px-3 py-3 text-text-secondary transition-colors hover:border-border-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-4 sm:py-4"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-text-disabled">
          GRABADA: ya la tienes. REPETIR: quedó mal, hay que volver a grabarla.
        </p>
      </div>

      <QuickOpportunityButton defaultProjectId={projectId} />
    </div>
  );
}

function MetaTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-base/60 px-3 py-2 text-sm text-text-secondary">
      <span className="text-accent-hover">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

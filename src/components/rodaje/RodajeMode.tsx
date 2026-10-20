"use client";

import { useCallback, useMemo, useState } from "react";
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
  Wand2,
  AlertCircle,
  SkipForward,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { FlatScene, SceneStatus } from "@/lib/types";
import { SceneStatusPill } from "@/components/SceneStatusPill";
import { SceneReferencePreview } from "@/components/editor/SceneReferencePreview";
import { Select } from "@/components/ui/Select";
import { QuickOpportunityButton } from "./QuickOpportunityButton";

const ALL_PROJECTS = "__all_projects__";
const ALL_STATUSES = "__all_statuses__";
const ALL_CAMERA_TYPES = "__all_camera_types__";
const ALL_LOCATIONS = "__all_locations__";
const ALL_REQUIREMENTS = "__all_requirements__";

type FilterOverrides = Partial<{
  projectId: string;
  status: string;
  camera: string;
  locationId: string;
  requirement: string;
}>;

const STATUS_FILTER_OPTIONS = [
  { value: ALL_STATUSES, label: "Todos los estados" },
  { value: "pendiente", label: "Por grabar" },
  { value: "repetir", label: "Por repetir" },
  { value: "grabada", label: "Grabadas" },
];

function findNextPending(scenes: FlatScene[], currentIndex: number) {
  for (let offset = 1; offset < scenes.length; offset += 1) {
    const candidate = (currentIndex + offset) % scenes.length;
    if (scenes[candidate].status !== "grabada") return candidate;
  }
  return -1;
}

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
  const isLocationRodaje = !projectId;
  const [selectedProjectId, setSelectedProjectId] = useState(ALL_PROJECTS);
  const [selectedStatus, setSelectedStatus] = useState(ALL_STATUSES);
  const [selectedCamera, setSelectedCamera] = useState(ALL_CAMERA_TYPES);
  const [selectedLocationId, setSelectedLocationId] = useState(ALL_LOCATIONS);
  const [selectedRequirement, setSelectedRequirement] = useState(ALL_REQUIREMENTS);
  const [index, setIndex] = useState<number>(() => {
    const firstPending = initialScenes.findIndex(
      (s) => s.status !== "grabada"
    );
    return firstPending === -1 ? 0 : firstPending;
  });

  const matchesFilters = useCallback((scene: FlatScene, overrides: FilterOverrides = {}) => {
    const projectFilter = overrides.projectId ?? selectedProjectId;
    const statusFilter = overrides.status ?? selectedStatus;
    const cameraFilter = overrides.camera ?? selectedCamera;
    const locationFilter = overrides.locationId ?? selectedLocationId;
    const requirementFilter = overrides.requirement ?? selectedRequirement;

    return (
      (!isLocationRodaje || projectFilter === ALL_PROJECTS || scene.projectId === projectFilter) &&
      (statusFilter === ALL_STATUSES || scene.status === statusFilter) &&
      (cameraFilter === ALL_CAMERA_TYPES || scene.camera === cameraFilter) &&
      (locationFilter === ALL_LOCATIONS || scene.location_id === locationFilter) &&
      (requirementFilter === ALL_REQUIREMENTS || scene.requirements?.includes(requirementFilter))
    );
  }, [isLocationRodaje, selectedProjectId, selectedStatus, selectedCamera, selectedLocationId, selectedRequirement]);

  const visibleScenes = useMemo(
    () => scenes.filter((scene) => matchesFilters(scene)),
    [scenes, matchesFilters]
  );
  const projectOptions = useMemo(
    () => [
      { value: ALL_PROJECTS, label: "Todos los proyectos" },
      ...Array.from(
        new Map(
          scenes
            .filter((scene) => scene.projectId)
            .map((scene) => [scene.projectId!, scene.projectName ?? "Proyecto"])
        ),
        ([value, label]) => ({ value, label })
      ).sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [scenes]
  );
  const cameraOptions = useMemo(
    () => [
      { value: ALL_CAMERA_TYPES, label: "Todos los tipos de plano" },
      ...Array.from(new Set(scenes.map((scene) => scene.camera).filter((camera): camera is string => Boolean(camera))))
        .sort((a, b) => a.localeCompare(b))
        .map((camera) => ({ value: camera, label: camera })),
    ],
    [scenes]
  );
  const locationOptions = useMemo(
    () => [
      { value: ALL_LOCATIONS, label: "Todas las locaciones" },
      ...Array.from(
        new Map(
          scenes
            .filter((scene) => scene.location_id)
            .map((scene) => [scene.location_id!, scene.location?.name ?? "Locación"])
        ),
        ([value, label]) => ({ value, label })
      ).sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [scenes]
  );
  const requirementOptions = useMemo(
    () => [
      { value: ALL_REQUIREMENTS, label: "Todas las necesidades" },
      ...Array.from(new Set(scenes.flatMap((scene) => scene.requirements ?? [])))
        .sort((a, b) => a.localeCompare(b))
        .map((requirement) => ({ value: requirement, label: requirement })),
    ],
    [scenes]
  );
  const total = visibleScenes.length;
  const scopedScenes = useMemo(
    () =>
      isLocationRodaje && selectedProjectId !== ALL_PROJECTS
        ? scenes.filter((scene) => scene.projectId === selectedProjectId)
        : scenes,
    [isLocationRodaje, scenes, selectedProjectId]
  );
  const recorded = useMemo(
    () => visibleScenes.filter((s) => s.status === "grabada").length,
    [visibleScenes]
  );
  const current =
    visibleScenes.find((scene) => scene.id === scenes[index]?.id) ?? visibleScenes[0];
  const isFilteringToProject =
    isLocationRodaje && selectedProjectId !== ALL_PROJECTS;
  const visibleIndex = current
    ? visibleScenes.findIndex((scene) => scene.id === current.id)
    : 0;
  const [error, setError] = useState<string | null>(null);

  function focusFirstMatch(overrides: FilterOverrides = {}) {
    const firstScene = scenes.find((scene) => matchesFilters(scene, overrides));
    setIndex(firstScene ? scenes.findIndex((scene) => scene.id === firstScene.id) : 0);
  }

  function changeProjectFilter(nextProjectId: string) {
    setSelectedProjectId(nextProjectId);
    focusFirstMatch({ projectId: nextProjectId });
  }

  function changeStatusFilter(nextStatus: string) {
    setSelectedStatus(nextStatus);
    focusFirstMatch({ status: nextStatus });
  }

  function changeCameraFilter(nextCamera: string) {
    setSelectedCamera(nextCamera);
    focusFirstMatch({ camera: nextCamera });
  }

  function changeLocationFilter(nextLocationId: string) {
    setSelectedLocationId(nextLocationId);
    focusFirstMatch({ locationId: nextLocationId });
  }

  function changeRequirementFilter(nextRequirement: string) {
    setSelectedRequirement(nextRequirement);
    focusFirstMatch({ requirement: nextRequirement });
  }

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
      const updatedVisible = updated.filter((scene) => matchesFilters(scene));
      const currentOrder = updated.findIndex((scene) => scene.id === current.id);
      const pendingScenes = updatedVisible.filter(
        (scene) => scene.id !== current.id && scene.status !== "grabada"
      );
      const nextScene =
        pendingScenes.find((scene) => updated.findIndex((item) => item.id === scene.id) > currentOrder) ??
        pendingScenes[0] ??
        updatedVisible.find((scene) => updated.findIndex((item) => item.id === scene.id) > currentOrder) ??
        updatedVisible[0];
      if (nextScene) {
        setIndex(updated.findIndex((scene) => scene.id === nextScene.id));
      }
    }
  }

  if (scenes.length === 0) {
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

  const allDone =
    scopedScenes.length > 0 &&
    scopedScenes.every((scene) => scene.status === "grabada");

  return (
    <div className="flex min-h-dvh flex-col bg-base">
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
            {String(total > 0 ? visibleIndex + 1 : 0).padStart(2, "0")} <span className="text-text-disabled">/</span> {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="mx-auto mt-3 flex max-w-2xl items-center gap-2 sm:gap-3">
          <div
            role="progressbar"
            aria-label="Progreso del rodaje"
            aria-valuemin={0}
            aria-valuemax={total || 1}
            aria-valuenow={recorded}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"
          >
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{ width: `${total > 0 ? (recorded / total) * 100 : 0}%` }}
          />
          </div>
          <span className="shrink-0 font-mono text-[10px] tracking-wide text-text-secondary">
            {recorded}/{total} GRABADAS
          </span>
          {findNextPending(visibleScenes, visibleIndex) !== -1 && (
            <button
              type="button"
              onClick={() => {
                const nextPending = findNextPending(visibleScenes, visibleIndex);
                if (nextPending !== -1) {
                  const nextScene = visibleScenes[nextPending];
                  setIndex(scenes.findIndex((scene) => scene.id === nextScene.id));
                }
              }}
              aria-label="Ir a la siguiente escena pendiente"
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-accent-hover transition-colors hover:bg-accent-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-3"
            >
              <SkipForward size={14} aria-hidden="true" />
              <span>Siguiente pendiente</span>
            </button>
          )}
        </div>
        <div className="mx-auto mt-3 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
          {isLocationRodaje && projectOptions.length > 2 && (
            <Select
              label="PROYECTO"
              size="sm"
              value={selectedProjectId}
              options={projectOptions}
              onChange={changeProjectFilter}
            />
          )}
          <Select
            label="ESTADO"
            size="sm"
            value={selectedStatus}
            options={STATUS_FILTER_OPTIONS}
            onChange={changeStatusFilter}
          />
          {cameraOptions.length > 1 && (
            <Select
              label="TIPO DE PLANO"
              size="sm"
              value={selectedCamera}
              options={cameraOptions}
              onChange={changeCameraFilter}
            />
          )}
          {!isLocationRodaje && locationOptions.length > 1 && (
            <Select
              label="LOCACIÓN"
              size="sm"
              value={selectedLocationId}
              options={locationOptions}
              onChange={changeLocationFilter}
            />
          )}
          {requirementOptions.length > 1 && (
            <Select
              label="NECESIDAD"
              size="sm"
              value={selectedRequirement}
              options={requirementOptions}
              onChange={changeRequirementFilter}
            />
          )}
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
          {total === 0 ? (
            <div className="py-12 text-center">
              <p className="text-base font-medium text-text-primary">No hay tomas con estos filtros</p>
              <p className="mt-2 text-sm text-text-secondary">
                Prueba con otro estado, tipo de plano o proyecto.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId(ALL_PROJECTS);
                  setSelectedStatus(ALL_STATUSES);
                  setSelectedCamera(ALL_CAMERA_TYPES);
                  setSelectedLocationId(ALL_LOCATIONS);
                  setSelectedRequirement(ALL_REQUIREMENTS);
                  setIndex(0);
                }}
                className="mt-3 min-h-10 text-sm font-medium text-accent-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Limpiar filtros
              </button>
            </div>
          ) : allDone ? (
            <>
              <div className="mb-6 flex flex-col items-center gap-2 rounded-2xl border border-accent/25 bg-accent-muted/30 px-5 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-ink">
                  <Check size={22} />
                </div>
                <p className="text-xl font-semibold tracking-wide text-text-primary">
                  {isFilteringToProject ? "PROYECTO COMPLETADO" : "RODAJE COMPLETADO"}
                </p>
                <p className="max-w-md text-sm leading-6 text-text-secondary">
                  {isFilteringToProject
                    ? "Todas las escenas de este proyecto en la locación están grabadas. Puedes repasarlas abajo."
                    : "Todas las escenas están grabadas. Repaso rápido abajo — toca una escena para volver a verla."}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {visibleScenes.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIndex(scenes.findIndex((scene) => scene.id === s.id))}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      i === visibleIndex
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
              <p className="relative mb-6 break-words text-2xl font-medium leading-snug tracking-tight text-text-primary sm:text-4xl">
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
                <div className="relative mb-6">
                  <p className="mb-1 font-mono text-[10px] tracking-[0.14em] text-text-secondary">
                    REFERENCIA VISUAL
                  </p>
                  <SceneReferencePreview url={current.reference} />
                </div>
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
      {current && (
      <div className="border-t border-border bg-surface/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_32px_rgba(0,0,0,0.22)] sm:px-4 sm:pt-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-2xl items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              const previousScene = visibleScenes[visibleIndex - 1];
              if (previousScene) {
                setIndex(scenes.findIndex((scene) => scene.id === previousScene.id));
              }
            }}
            disabled={visibleIndex === 0}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-base text-text-secondary transition-colors hover:border-border-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:h-14 sm:w-14"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => setStatus("repetir", false)}
            aria-pressed={current.status === "repetir"}
            className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-[10px] font-semibold tracking-wide text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:gap-2 sm:px-4 sm:py-4 sm:text-sm ${
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
            className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-[10px] font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:gap-2 sm:px-4 sm:py-4 sm:text-sm ${
              current.status === "grabada"
                ? "border-accent bg-accent text-accent-ink"
                : "border-accent text-text-primary hover:bg-accent/10"
            }`}
          >
            <Check size={16} className="shrink-0" />
            <span className="truncate">GRABADA</span>
          </button>

          <button
            onClick={() => {
              const nextScene = visibleScenes[visibleIndex + 1];
              if (nextScene) {
                setIndex(scenes.findIndex((scene) => scene.id === nextScene.id));
              }
            }}
            disabled={visibleIndex === total - 1}
            className="flex shrink-0 items-center justify-center rounded-lg border border-border bg-base px-3 py-3 text-text-secondary transition-colors hover:border-border-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-4 sm:py-4"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] leading-4 text-text-disabled sm:text-xs">
          GRABADA: ya la tienes. REPETIR: quedó mal, hay que volver a grabarla.
        </p>
      </div>
      )}

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

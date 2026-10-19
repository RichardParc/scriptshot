"use client";

import { fieldClass } from "@/lib/field";
import { useEffect, useId, useState } from "react";
import { Pencil, X, Check, AlertCircle, Folder as FolderIcon, Clock3, Film } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  PROJECT_DURATIONS,
  PROJECT_FORMATS,
  type Folder,
  type Project,
  type ProjectDuration,
  type ProjectFormat,
} from "@/lib/types";
import { StatusBadge, STATUS_COLOR } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { ProjectSummary } from "@/lib/status";

const FORMAT_OPTIONS = PROJECT_FORMATS.map((f) => ({ value: f, label: f }));
const DURATION_OPTIONS = PROJECT_DURATIONS.map((d) => ({ value: d, label: d }));
const NO_FOLDER = "__none__";

export function ProjectHeader({
  initialProject,
  summary,
}: {
  initialProject: Project;
  summary: ProjectSummary;
}) {
  const [project, setProject] = useState(initialProject);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);

  const [name, setName] = useState(project.name);
  const [format, setFormat] = useState<ProjectFormat>(project.format);
  const [duration, setDuration] = useState<ProjectDuration>(project.duration);
  const [idea, setIdea] = useState(project.idea ?? "");
  const [folderId, setFolderId] = useState(project.folder_id ?? NO_FOLDER);

  const nameId = useId();
  const ideaId = useId();

  useEffect(() => {
    supabase
      .from("folder")
      .select("*")
      .then(({ data }: { data: Folder[] | null }) => {
        if (data) setFolders(data as Folder[]);
      });
  }, []);

  const currentFolderName = folders.find((f) => f.id === project.folder_id)?.name;

  function startEdit() {
    setName(project.name);
    setFormat(project.format);
    setDuration(project.duration);
    setIdea(project.idea ?? "");
    setFolderId(project.folder_id ?? NO_FOLDER);
    setError(null);
    setEditing(true);
  }

  async function save() {
    if (!name.trim()) {
      setError("El proyecto necesita un nombre.");
      return;
    }
    setSaving(true);
    const updates = {
      name: name.trim(),
      format,
      duration,
      idea: idea.trim() || null,
      folder_id: folderId === NO_FOLDER ? null : folderId,
    };
    const { error } = await supabase
      .from("project")
      .update(updates)
      .eq("id", project.id);
    setSaving(false);

    if (error) {
      setError("No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    setProject((prev) => ({ ...prev, ...updates }));
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-28 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={summary.status} />
            {currentFolderName && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-base/50 px-2.5 py-1 font-mono text-[10px] tracking-wide text-text-secondary">
                <FolderIcon size={12} /> {currentFolderName}
              </span>
            )}
            <button
              onClick={startEdit}
              className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-base/50 px-3 text-sm text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Pencil size={13} /> Editar
            </button>
          </div>

          <h1 className="max-w-3xl break-words text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {project.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-base/50 px-3 py-2 font-mono text-xs text-text-secondary">
              <Film size={14} className="text-accent-hover" /> {project.format}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-base/50 px-3 py-2 font-mono text-xs text-text-secondary">
              <Clock3 size={14} className="text-accent-hover" /> {project.duration}
            </span>
          </div>

          {project.idea && (
            <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-text-secondary sm:text-base">
              {project.idea}
            </p>
          )}

          <div className="mt-6 rounded-xl border border-border bg-base/55 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-text-secondary">PROGRESO DEL RODAJE</p>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  {summary.totalScenes > 0
                    ? `${summary.recordedScenes} de ${summary.totalScenes} tomas grabadas`
                    : "Aún no hay escenas en el guion"}
                </p>
              </div>
              <span className="font-mono text-xl font-semibold text-text-primary">
                {summary.totalScenes > 0
                  ? `${Math.round((summary.recordedScenes / summary.totalScenes) * 100)}%`
                  : "—"}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Progreso de escenas grabadas"
              aria-valuemin={0}
              aria-valuemax={summary.totalScenes || 1}
              aria-valuenow={summary.recordedScenes}
              className="h-2 overflow-hidden rounded-full bg-surface-2"
            >
              <div
                className={`h-full transition-[width] duration-500 ${STATUS_COLOR[summary.status]}`}
                style={{
                  width: `${summary.totalScenes > 0 ? (summary.recordedScenes / summary.totalScenes) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor={nameId}
            className="mb-1 block font-mono text-xs text-text-secondary"
          >
            NOMBRE
          </label>
          <input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass("md")}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="FORMATO"
            value={format}
            options={FORMAT_OPTIONS}
            onChange={(v) => setFormat(v as ProjectFormat)}
          />
          <Select
            label="DURACIÓN"
            value={duration}
            options={DURATION_OPTIONS}
            onChange={(v) => setDuration(v as ProjectDuration)}
          />
        </div>

        <Select
          label="CARPETA"
          value={folderId}
          options={[
            { value: NO_FOLDER, label: "Sin carpeta" },
            ...folders.map((f) => ({ value: f.id, label: f.name })),
          ]}
          onChange={setFolderId}
        />

        <div>
          <label
            htmlFor={ideaId}
            className="mb-1 block font-mono text-xs text-text-secondary"
          >
            IDEA
          </label>
          <textarea
            id={ideaId}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={3}
            className={fieldClass("md", "resize-none")}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-status-missing">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="primary" onClick={save} disabled={saving}>
            <Check size={15} />
            {saving ? "Guardando…" : "Guardar"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setEditing(false)}
            disabled={saving}
          >
            <X size={15} />
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

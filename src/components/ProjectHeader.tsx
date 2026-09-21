"use client";

import { useId, useState } from "react";
import { Pencil, X, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  PROJECT_DURATIONS,
  PROJECT_FORMATS,
  type Project,
  type ProjectDuration,
  type ProjectFormat,
} from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

const FORMAT_OPTIONS = PROJECT_FORMATS.map((f) => ({ value: f, label: f }));
const DURATION_OPTIONS = PROJECT_DURATIONS.map((d) => ({ value: d, label: d }));

export function ProjectHeader({ initialProject }: { initialProject: Project }) {
  const [project, setProject] = useState(initialProject);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(project.name);
  const [format, setFormat] = useState<ProjectFormat>(project.format);
  const [duration, setDuration] = useState<ProjectDuration>(project.duration);
  const [idea, setIdea] = useState(project.idea ?? "");

  const nameId = useId();
  const ideaId = useId();

  function startEdit() {
    setName(project.name);
    setFormat(project.format);
    setDuration(project.duration);
    setIdea(project.idea ?? "");
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
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-2xl font-medium text-text-primary">
            {project.name}
          </h1>
          <StatusBadge status={project.status} />
          <button
            onClick={startEdit}
            className="ml-auto flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
          >
            <Pencil size={13} />
            Editar
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 font-mono text-sm text-text-secondary">
          <span>{project.format}</span>
          <span className="text-border-strong">·</span>
          <span>{project.duration}</span>
        </div>

        {project.idea && (
          <p className="max-w-xl text-base leading-relaxed text-text-secondary">
            {project.idea}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-10 rounded-lg border border-border bg-surface p-6">
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
            className="w-full rounded-sm border border-border bg-surface-2 px-3 py-2 text-base text-text-primary focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            className="w-full resize-none rounded-sm border border-border bg-surface-2 px-3 py-2 text-base text-text-primary focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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

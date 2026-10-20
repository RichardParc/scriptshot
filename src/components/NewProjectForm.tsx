"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fieldClass } from "@/lib/field";
import {
  PROJECT_DURATIONS,
  PROJECT_FORMATS,
  type Folder,
  type ProjectDuration,
  type ProjectFormat,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

const FORMAT_OPTIONS = PROJECT_FORMATS.map((f) => ({ value: f, label: f }));
const DURATION_OPTIONS = PROJECT_DURATIONS.map((d) => ({ value: d, label: d }));
const NO_FOLDER = "__none__";
const STORY_TEMPLATES = {
  blank: [],
  short: ["Hook", "Contexto", "Desarrollo", "Cierre"],
  complete: ["Hook", "Contexto", "Conflicto", "Desarrollo", "Giro", "Clímax", "Cierre"],
} as const;
type StoryTemplate = keyof typeof STORY_TEMPLATES;
const STORY_TEMPLATE_OPTIONS = [
  { value: "blank", label: "En blanco" },
  { value: "short", label: "Historia breve · 4 bloques" },
  { value: "complete", label: "Historia completa · 7 bloques" },
];

/** The "new project" form, used both in the bottom sheet and on /new. */
export function NewProjectForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [format, setFormat] = useState<ProjectFormat>(PROJECT_FORMATS[0]);
  const [duration, setDuration] = useState<ProjectDuration>(
    PROJECT_DURATIONS[0]
  );
  const [idea, setIdea] = useState("");
  const [storyTemplate, setStoryTemplate] = useState<StoryTemplate>("blank");
  const [folderId, setFolderId] = useState(NO_FOLDER);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("El proyecto necesita un nombre.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase
      .from("project")
      .insert({
        name: name.trim(),
        format,
        duration,
        idea: idea.trim() || null,
        status: "idea",
        folder_id: folderId === NO_FOLDER ? null : folderId,
      })
      .select("id")
      .single();

    if (error) {
      setSubmitting(false);
      setError(error.message);
      return;
    }

    const initialBlocks = STORY_TEMPLATES[storyTemplate];
    if (initialBlocks.length > 0) {
      const { error: blocksError } = await supabase.from("story_block").insert(
        initialBlocks.map((title, order) => ({
          project_id: data.id,
          title,
          order,
        }))
      );

      if (blocksError) {
        const { error: rollbackError } = await supabase
          .from("project")
          .delete()
          .eq("id", data.id);
        setSubmitting(false);
        setError(
          rollbackError
            ? "El proyecto se creó, pero no pudimos guardar sus bloques. Revisa tus proyectos antes de volver a intentarlo."
            : "No se pudo guardar la estructura inicial. Intenta de nuevo."
        );
        return;
      }
    }

    router.push(`/project/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label
          htmlFor={nameId}
          className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-text-secondary"
        >
          NOMBRE
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Entre Gigantes"
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

      {folders.length > 0 && (
        <Select
          label="CARPETA (OPCIONAL)"
          value={folderId}
          options={[
            { value: NO_FOLDER, label: "Sin carpeta" },
            ...folders.map((f) => ({ value: f.id, label: f.name })),
          ]}
          onChange={setFolderId}
        />
      )}

      <div>
        <label
          htmlFor={ideaId}
          className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-text-secondary"
        >
          IDEA
        </label>
        <textarea
          id={ideaId}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="¿Qué quieres contar?"
          rows={4}
          className={fieldClass("md", "resize-none")}
        />
      </div>

      <div>
        <Select
          label="ESTRUCTURA INICIAL (OPCIONAL)"
          value={storyTemplate}
          options={STORY_TEMPLATE_OPTIONS}
          onChange={(value) => setStoryTemplate(value as StoryTemplate)}
        />
        <p className="mt-2 text-sm leading-5 text-text-secondary">
          {storyTemplate === "blank"
            ? "Empieza en blanco y añade los bloques a tu manera."
            : `${STORY_TEMPLATES[storyTemplate].join(" · ")} · podrás cambiar, reordenar o borrar cualquier bloque.`}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-status-missing/30 bg-status-missing/10 px-3 py-2 text-sm text-status-missing">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={submitting}
        >
          {submitting ? "Creando…" : "Crear proyecto"}
        </Button>
      </div>
    </form>
  );
}

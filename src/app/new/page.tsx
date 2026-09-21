"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  PROJECT_DURATIONS,
  PROJECT_FORMATS,
  type ProjectDuration,
  type ProjectFormat,
} from "@/lib/types";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

const FORMAT_OPTIONS = PROJECT_FORMATS.map((f) => ({ value: f, label: f }));
const DURATION_OPTIONS = PROJECT_DURATIONS.map((d) => ({ value: d, label: d }));

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [format, setFormat] = useState<ProjectFormat>(PROJECT_FORMATS[0]);
  const [duration, setDuration] = useState<ProjectDuration>(
    PROJECT_DURATIONS[0]
  );
  const [idea, setIdea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameId = useId();
  const ideaId = useId();

  useEffect(() => {
    document.title = "Nuevo proyecto — Scriptshot";
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
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/project/${data.id}`);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <BackLink href="/" label="Volver" />

      <h1 className="mb-8 mt-6 text-2xl font-medium text-text-primary">
        Nuevo proyecto
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label
            htmlFor={nameId}
            className="mb-2 block font-mono text-sm text-text-secondary"
          >
            NOMBRE
          </label>
          <input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Entre Gigantes"
            className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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
            className="mb-2 block font-mono text-sm text-text-secondary"
          >
            IDEA
          </label>
          <textarea
            id={ideaId}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="¿Qué quieres contar?"
            rows={4}
            className="w-full resize-none rounded-sm border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        {error && <p className="text-base text-status-missing">{error}</p>}

        <Button type="submit" variant="primary" disabled={submitting} className="self-start">
          {submitting ? "Creando…" : "Crear proyecto"}
        </Button>
      </form>
    </main>
  );
}

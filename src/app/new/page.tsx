"use client";

import { useState } from "react";
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

      <h1 className="mb-8 mt-6 text-xl font-medium text-text-primary">
        Nuevo proyecto
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block font-mono text-xs text-text-secondary">
            NOMBRE
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Entre Gigantes"
            className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block font-mono text-xs text-text-secondary">
              FORMATO
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ProjectFormat)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent"
            >
              {PROJECT_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs text-text-secondary">
              DURACIÓN
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as ProjectDuration)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent"
            >
              {PROJECT_DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs text-text-secondary">
            IDEA
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="¿Qué quieres contar?"
            rows={4}
            className="w-full resize-none rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent"
          />
        </div>

        {error && <p className="text-sm text-status-missing">{error}</p>}

        <Button type="submit" variant="primary" disabled={submitting} className="self-start">
          {submitting ? "Creando…" : "Crear proyecto"}
        </Button>
      </form>
    </main>
  );
}

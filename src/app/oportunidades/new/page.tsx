"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { OPPORTUNITY_TYPES } from "@/lib/types";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PresetSelect } from "@/components/editor/PresetSelect";
import { LocationPicker } from "@/components/editor/LocationPicker";

const NO_PROJECT = "__none__";

export default function NewOpportunityPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [projectId, setProjectId] = useState(NO_PROJECT);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>(
    []
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descId = useId();
  const notesId = useId();
  const refId = useId();

  useEffect(() => {
    document.title = "Nueva oportunidad — Scriptshot";
    supabase
      .from("project")
      .select("id, name")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setProjects(data.map((p) => ({ value: p.id, label: p.name })));
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Descríbela, aunque sea en pocas palabras.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("opportunity_shot").insert({
      description: description.trim(),
      type: type || null,
      location_id: locationId,
      reference: reference.trim() || null,
      notes: notes.trim() || null,
      project_id: projectId === NO_PROJECT ? null : projectId,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/oportunidades");
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <BackLink href="/oportunidades" label="Oportunidades" />

      <h1 className="mb-8 mt-6 flex items-center gap-2 text-2xl font-medium text-text-primary">
        <Sparkles size={20} className="text-accent" />
        Nueva toma de oportunidad
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label htmlFor={descId} className="mb-2 block font-mono text-sm text-text-secondary">
            DESCRIPCIÓN
          </label>
          <textarea
            id={descId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Qué encontraste?"
            rows={3}
            autoFocus
            className="w-full resize-none rounded-sm border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PresetSelect
            label="TIPO"
            options={OPPORTUNITY_TYPES}
            value={type}
            onChange={setType}
          />
          <LocationPicker
            initialLocationName={null}
            onChange={setLocationId}
          />
        </div>

        <div>
          <label htmlFor={refId} className="mb-2 block font-mono text-sm text-text-secondary">
            REFERENCIA (URL)
          </label>
          <input
            id={refId}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <div>
          <label htmlFor={notesId} className="mb-2 block font-mono text-sm text-text-secondary">
            NOTAS
          </label>
          <textarea
            id={notesId}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-sm border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <Select
          label="ASOCIAR A PROYECTO (OPCIONAL)"
          value={projectId}
          options={[{ value: NO_PROJECT, label: "Sin asociar" }, ...projects]}
          onChange={setProjectId}
        />

        {error && <p className="text-base text-status-missing">{error}</p>}

        <Button type="submit" variant="primary" disabled={submitting} className="self-start">
          {submitting ? "Guardando…" : "Guardar"}
        </Button>
      </form>
    </main>
  );
}

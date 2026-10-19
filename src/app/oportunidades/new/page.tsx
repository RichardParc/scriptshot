"use client";

import { fieldClass } from "@/lib/field";
import { Suspense, useEffect, useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchPresetLabels } from "@/lib/presets";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PresetSelect } from "@/components/editor/PresetSelect";
import { LocationPicker } from "@/components/editor/LocationPicker";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const NO_PROJECT = "__none__";

export default function NewOpportunityPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <NewOpportunityForm />
    </Suspense>
  );
}

function NewOpportunityForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProject = searchParams.get("project");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [projectId, setProjectId] = useState(preselectedProject ?? NO_PROJECT);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>(
    []
  );
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descId = useId();
  const notesId = useId();
  const refId = useId();

  useEffect(() => {
    document.title = "Nueva oportunidad — Scriptshot";
    fetchPresetLabels("opportunity_type").then(setTypeOptions);
    supabase
      .from("project")
      .select("id, name")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: { id: string; name: string }[] | null }) => {
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
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-12">
      <BackLink href="/oportunidades" label="Oportunidades" />

      <section className="relative mb-6 mt-6 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-6 sm:px-7 sm:py-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-muted/60 px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-accent-hover">
            <Sparkles size={12} /> NOTA DE PRODUCCIÓN
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">Nueva toma de oportunidad</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
            Registra una idea o referencia que quieras tener presente durante el rodaje.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-4 sm:gap-6 sm:p-6">
        <div>
          <label htmlFor={descId} className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-text-secondary">
            DESCRIPCIÓN
          </label>
          <textarea
            id={descId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Qué encontraste?"
            rows={3}
            autoFocus
            className={fieldClass("md", "resize-none")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PresetSelect
            label="TIPO"
            options={typeOptions}
            value={type}
            onChange={setType}
          />
          <LocationPicker
            initialLocationName={null}
            onChange={setLocationId}
          />
        </div>

        <div>
          <label htmlFor={refId} className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-text-secondary">
            REFERENCIA (URL)
          </label>
          <input
            id={refId}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="https://…"
            className={fieldClass("md")}
          />
        </div>

        <div>
          <label htmlFor={notesId} className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-text-secondary">
            NOTAS
          </label>
          <textarea
            id={notesId}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={fieldClass("md", "resize-none")}
          />
        </div>

        <Select
          label="ASOCIAR A PROYECTO (OPCIONAL)"
          value={projectId}
          options={[{ value: NO_PROJECT, label: "Sin asociar" }, ...projects]}
          onChange={setProjectId}
        />

        {error && <p role="alert" className="rounded-lg border border-status-missing/30 bg-status-missing/10 px-3 py-2 text-sm text-status-missing">{error}</p>}

        <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full sm:ml-auto sm:w-auto">
          {submitting ? "Guardando…" : "Guardar oportunidad"}
        </Button>
      </form>
    </main>
  );
}

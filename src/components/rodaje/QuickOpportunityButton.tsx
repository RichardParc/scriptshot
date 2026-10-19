"use client";

import { useEffect, useId, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fieldClass } from "@/lib/field";
import { fetchPresetLabels } from "@/lib/presets";
import { PresetSelect } from "@/components/editor/PresetSelect";
import { LocationPicker } from "@/components/editor/LocationPicker";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { BottomSheet } from "@/components/ui/BottomSheet";

const NO_PROJECT = "__none__";

export function QuickOpportunityButton({
  defaultProjectId,
}: {
  defaultProjectId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState(defaultProjectId ?? NO_PROJECT);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>(
    []
  );
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    fetchPresetLabels("opportunity_type").then(setTypeOptions);
    supabase
      .from("project")
      .select("id, name")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setProjects(data.map((p) => ({ value: p.id, label: p.name })));
        }
      });
  }, [open]);

  function reset() {
    setDescription("");
    setType("");
    setLocationId(null);
    setProjectId(defaultProjectId ?? NO_PROJECT);
    setError(null);
  }

  async function handleSave() {
    if (!description.trim()) {
      setError("Descríbela, aunque sea en pocas palabras.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("opportunity_shot").insert({
      description: description.trim(),
      type: type || null,
      location_id: locationId,
      project_id: projectId === NO_PROJECT ? null : projectId,
    });
    setSaving(false);
    if (error) {
      setError("No se pudo guardar. Intenta de nuevo.");
      return;
    }
    setOpen(false);
    reset();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-accent bg-accent-muted px-4 py-3 text-sm font-medium text-accent-hover shadow-lg shadow-black/40 hover:bg-accent hover:text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:bottom-28"
      >
        <Sparkles size={16} />
        Oportunidad
      </button>

      {savedFlash && (
        <div
          role="status"
          className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-accent bg-surface px-4 py-3 text-sm text-accent-hover shadow-lg sm:bottom-28"
        >
          <Check size={14} />
          Guardada
        </div>
      )}

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent-hover" />
            Toma de oportunidad
          </span>
        }
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor={descId}
              className="mb-2 block font-mono text-sm text-text-secondary"
            >
              DESCRIPCIÓN
            </label>
            <textarea
              id={descId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué encontraste?"
              rows={2}
              autoFocus
              className={fieldClass("md", "resize-none")}
            />
          </div>

          <PresetSelect
            label="TIPO"
            options={typeOptions}
            value={type}
            onChange={setType}
          />
          <LocationPicker initialLocationName={null} onChange={setLocationId} />

          <Select
            label="ASOCIAR A PROYECTO"
            value={projectId}
            options={[{ value: NO_PROJECT, label: "Sin asociar" }, ...projects]}
            onChange={setProjectId}
          />

          {error && (
            <p role="alert" className="text-sm text-status-missing">
              {error}
            </p>
          )}
        </div>
      </BottomSheet>
    </>
  );
}

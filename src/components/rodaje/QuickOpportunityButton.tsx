"use client";

import { useState } from "react";
import { X, Sparkles, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { OPPORTUNITY_TYPES } from "@/lib/types";
import { PresetSelect } from "@/components/editor/PresetSelect";
import { LocationPicker } from "@/components/editor/LocationPicker";
import { Button } from "@/components/ui/Button";

export function QuickOpportunityButton() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  function reset() {
    setDescription("");
    setType("");
    setLocationId(null);
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
        className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-accent bg-accent-muted px-4 py-3 text-sm font-medium text-accent-hover shadow-lg shadow-black/40 hover:bg-accent hover:text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:bottom-28"
      >
        <Sparkles size={16} />
        Oportunidad
      </button>

      {savedFlash && (
        <div className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-accent bg-surface px-4 py-3 text-sm text-accent shadow-lg sm:bottom-28">
          <Check size={14} />
          Guardada
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-lg border border-border bg-surface p-6 sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-medium text-text-primary">
                <Sparkles size={18} className="text-accent" />
                Toma de oportunidad
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="rounded-sm text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block font-mono text-xs text-text-secondary">
                  DESCRIPCIÓN
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="¿Qué encontraste?"
                  rows={2}
                  autoFocus
                  className="w-full resize-none rounded-sm border border-border bg-surface-2 px-3 py-2 text-base text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                />
              </div>

              <PresetSelect
                label="TIPO"
                options={OPPORTUNITY_TYPES}
                value={type}
                onChange={setType}
              />
              <LocationPicker initialLocationName={null} onChange={setLocationId} />

              {error && <p className="text-sm text-status-missing">{error}</p>}

              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

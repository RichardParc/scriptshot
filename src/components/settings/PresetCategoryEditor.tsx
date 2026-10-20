"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useConfirm } from "@/components/ui/useConfirm";
import type { PresetCategory, PresetOption } from "@/lib/types";

export function PresetCategoryEditor({
  category,
  title,
  hint,
}: {
  category: PresetCategory;
  title: string;
  hint?: string;
}) {
  const [options, setOptions] = useState<PresetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmModal } = useConfirm();

  async function load() {
    const { data } = await supabase
      .from("preset_option")
      .select("*")
      .eq("category", category)
      .order("order", { ascending: true });
    setOptions((data ?? []) as PresetOption[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    const label = newLabel.trim();
    if (!label) return;
    if (options.some((o) => o.label.toLowerCase() === label.toLowerCase())) {
      setError("Esa opción ya existe.");
      return;
    }
    const order =
      options.length === 0 ? 0 : Math.max(...options.map((o) => o.order)) + 1;
    const { error } = await supabase
      .from("preset_option")
      .insert({ category, label, order });
    if (error) {
      setError("No se pudo agregar. Intenta de nuevo.");
      return;
    }
    setError(null);
    setNewLabel("");
    setAdding(false);
    load();
  }

  async function handleRename(id: string) {
    const label = editingLabel.trim();
    setEditingId(null);
    const current = options.find((o) => o.id === id);
    if (!label || !current || label === current.label) return;
    const { error } = await supabase
      .from("preset_option")
      .update({ label })
      .eq("id", id);
    if (error) {
      setError("No se pudo renombrar. Intenta de nuevo.");
      return;
    }
    setError(null);
    load();
  }

  async function handleDelete(id: string, label: string) {
    const confirmed = await confirm({
      title: `¿Eliminar "${label}"?`,
      description:
        "Deja de aparecer como opción. Lo que ya está guardado con este valor no cambia.",
      confirmLabel: "Borrar",
    });
    if (!confirmed) return;
    const { error } = await supabase
      .from("preset_option")
      .delete()
      .eq("id", id);
    if (error) {
      setError("No se pudo eliminar. Intenta de nuevo.");
      return;
    }
    setError(null);
    load();
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          {hint && <p className="mt-1 text-sm leading-5 text-text-secondary">{hint}</p>}
        </div>
        {!loading && (
          <span className="rounded-md border border-border bg-canvas/50 px-2 py-1 font-mono text-[10px] text-text-secondary">
            {options.length} {options.length === 1 ? "OPCIÓN" : "OPCIONES"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-9 animate-pulse rounded-lg bg-surface-2" aria-label="Cargando opciones" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.length === 0 && !adding && (
            <p className="w-full rounded-lg border border-dashed border-border px-3 py-3 text-sm text-text-secondary">
              Aún no hay opciones. Agrega la primera para usarla en tus proyectos.
            </p>
          )}
          {options.map((opt) =>
            editingId === opt.id ? (
              <input
                key={opt.id}
                autoFocus
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                onBlur={() => handleRename(opt.id)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(opt.id)}
                aria-label={`Renombrar ${opt.label}`}
                className="rounded-lg border border-accent bg-surface-2 px-3 py-2 text-sm text-text-primary focus:outline-none"
              />
            ) : (
              <span
                key={opt.id}
                className="flex items-center gap-1 rounded-lg border border-border bg-canvas/50 py-1 pl-3 pr-1.5 text-sm text-text-primary"
              >
                {opt.label}
                <button
                  onClick={() => {
                    setEditingId(opt.id);
                    setEditingLabel(opt.label);
                  }}
                  aria-label={`Renombrar ${opt.label}`}
                  className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => handleDelete(opt.id, opt.label)}
                  aria-label={`Eliminar ${opt.label}`}
                  className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-status-missing/10 hover:text-status-missing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <X size={11} />
                </button>
              </span>
            )
          )}

          {adding ? (
            <span className="flex items-center gap-1">
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") {
                    setAdding(false);
                    setNewLabel("");
                  }
                }}
                placeholder="Nueva opción"
                aria-label="Nueva opción"
                className="rounded-lg border border-accent bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
              />
              <button
                onClick={handleAdd}
                aria-label="Guardar opción"
                className="rounded-md p-1.5 text-accent-hover transition-colors hover:bg-accent-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewLabel("");
                }}
                aria-label="Cancelar"
                className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X size={16} />
              </button>
            </span>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex min-h-9 items-center gap-1.5 rounded-lg border border-dashed border-border-strong px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent hover:bg-accent-muted/30 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Plus size={13} />
              Agregar
            </button>
          )}
        </div>
      )}

      {error && <p role="alert" className="mt-3 rounded-lg border border-status-missing/30 bg-status-missing/10 px-3 py-2 text-sm text-status-missing">{error}</p>}
      {ConfirmModal}
    </section>
  );
}

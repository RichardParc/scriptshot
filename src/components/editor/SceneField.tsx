"use client";

import { fieldClass } from "@/lib/field";
import { useId, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Scene, ScenePresets, VoiceOver } from "@/lib/types";
import { PresetSelect } from "./PresetSelect";
import { ChipMultiSelect } from "./ChipMultiSelect";
import { LocationPicker } from "./LocationPicker";
import { SceneStatusPill } from "@/components/SceneStatusPill";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SceneReferencePreview } from "./SceneReferencePreview";
import { useConfirm } from "@/components/ui/useConfirm";

export function SceneField({
  scene,
  isDragging = false,
  index,
  voiceOvers,
  presets,
  onUpdate,
  onDelete,
}: {
  scene: Scene;
  isDragging?: boolean;
  index: number;
  voiceOvers: VoiceOver[];
  presets: ScenePresets;
  onUpdate: (updates: Partial<Scene>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState(scene.description);
  const { confirm, ConfirmModal } = useConfirm();
  const referenceId = useId();
  const notesId = useId();

  async function confirmDelete() {
    const confirmed = await confirm({
      title: `¿Eliminar la escena ${String(index).padStart(2, "0")}?`,
      description: "La escena se quitará de este bloque. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar escena",
    });
    if (confirmed) onDelete();
  }

  const metadataCount = [
    scene.camera,
    scene.angle,
    scene.movement,
    scene.location?.name,
    scene.reference,
    scene.post_production ? "pp" : null,
  ].filter(Boolean).length + (scene.requirements?.length ?? 0);

  return (
    <div className={`flex min-h-[13rem] min-w-0 flex-1 flex-col rounded-lg border border-white/[0.06] bg-canvas/60 px-3 pb-3 pt-1 transition-[border-color,box-shadow] sm:px-4 sm:pb-4 sm:pt-2 ${isDragging ? "border-accent ring-2 ring-accent/60 shadow-lg shadow-accent/20" : ""}`}>
      <div className="mb-2 flex min-h-10 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-accent-muted/60 px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-accent-hover">
            ESCENA {String(index).padStart(2, "0")}
          </span>
          <SceneStatusPill status={scene.status} />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="min-h-10 rounded-md px-2 py-1 text-left font-mono text-[10px] tracking-wide text-text-secondary transition-colors hover:bg-white/[0.04] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {expanded
              ? "OCULTAR DETALLES"
              : metadataCount > 0
                ? `DETALLES (${metadataCount}) ▾`
                : "+ DETALLES ▾"}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void confirmDelete()}
            aria-label={`Borrar escena ${String(index).padStart(2, "0")}`}
            title="Borrar escena"
            className="h-10 w-10 shrink-0 rounded-lg !p-0 text-text-secondary hover:!text-status-missing"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => onUpdate({ description })}
        placeholder="¿Qué necesitas mostrar/grabar?"
        aria-label="Descripción de la escena"
        rows={4}
        className="mt-1 min-h-32 w-full flex-1 resize-none rounded-sm bg-transparent text-base text-text-primary placeholder:text-text-disabled focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 border-t border-white/[0.08] pt-4">
          <Select
            size="sm"
            label="VOZ EN OFF RELACIONADA"
            value={scene.voice_over_id ?? ""}
            options={[
              { value: "", label: "Sin asociar" },
              ...voiceOvers.map((voiceOver, voiceOverIndex) => ({
                value: voiceOver.id,
                label: `VO ${String(voiceOverIndex + 1).padStart(2, "0")} · ${
                  voiceOver.text.trim().slice(0, 56) || "Sin texto todavía"
                }`,
              })),
            ]}
            onChange={(voice_over_id) =>
              onUpdate({ voice_over_id: voice_over_id || null })
            }
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <PresetSelect
              size="sm"
              label="TIPO DE PLANO"
              options={presets.cameraTypes}
              value={scene.camera ?? ""}
              onChange={(camera) => onUpdate({ camera: camera || null })}
            />
            <PresetSelect
              size="sm"
              label="ÁNGULO"
              options={presets.cameraAngles}
              value={scene.angle ?? ""}
              onChange={(angle) => onUpdate({ angle: angle || null })}
            />
            <PresetSelect
              size="sm"
              label="MOVIMIENTO"
              options={presets.cameraMovements}
              value={scene.movement ?? ""}
              onChange={(movement) => onUpdate({ movement: movement || null })}
            />
          </div>

          <LocationPicker
            size="sm"
            initialLocationName={scene.location?.name ?? null}
            onChange={(locationId) => onUpdate({ location_id: locationId })}
          />

          <ChipMultiSelect
            label="NECESIDADES"
            options={presets.sceneRequirements}
            value={scene.requirements ?? []}
            onChange={(requirements) => onUpdate({ requirements })}
          />

          <div>
            <label htmlFor={referenceId} className="mb-1 block font-mono text-xs text-text-secondary">
              REFERENCIA VISUAL
            </label>
            <input
              id={referenceId}
              defaultValue={scene.reference ?? ""}
              onBlur={(e) =>
                onUpdate({ reference: e.target.value.trim() || null })
              }
              placeholder="Pega el enlace de una imagen o video"
              className={fieldClass("sm")}
            />
            <p className="mt-1.5 text-xs leading-5 text-text-disabled">
              Los enlaces directos a imágenes y videos se mostrarán aquí.
            </p>
            <SceneReferencePreview url={scene.reference} />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 font-mono text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={scene.post_production}
                onChange={(e) =>
                  onUpdate({ post_production: e.target.checked })
                }
                className="accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              />
              REQUIERE POSTPRODUCCIÓN
            </label>
            {scene.post_production && (
              <input
                defaultValue={scene.post_production_notes ?? ""}
                onBlur={(e) =>
                  onUpdate({
                    post_production_notes: e.target.value.trim() || null,
                  })
                }
                placeholder="Texto, animación, subtítulos, gráficos…"
                aria-label="Notas de postproducción"
                className={fieldClass("sm")}
              />
            )}
          </div>

          <div>
            <label htmlFor={notesId} className="mb-1 block font-mono text-xs text-text-secondary">
              NOTAS
            </label>
            <textarea
              id={notesId}
              defaultValue={scene.notes ?? ""}
              onBlur={(e) => onUpdate({ notes: e.target.value.trim() || null })}
              rows={2}
              placeholder="Lo que no encaje arriba…"
              className={fieldClass("sm", "resize-none")}
            />
          </div>
        </div>
      )}

      {ConfirmModal}
    </div>
  );
}

"use client";

import { useId, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Scene } from "@/lib/types";
import {
  CAMERA_ANGLES,
  CAMERA_MOVEMENTS,
  CAMERA_TYPES,
  SCENE_REQUIREMENTS,
} from "@/lib/types";
import { PresetSelect } from "./PresetSelect";
import { ChipMultiSelect } from "./ChipMultiSelect";
import { LocationPicker } from "./LocationPicker";
import { SceneStatusPill } from "@/components/SceneStatusPill";
import { Button } from "@/components/ui/Button";

export function SceneField({
  scene,
  index,
  onUpdate,
  onDelete,
}: {
  scene: Scene;
  index: number;
  onUpdate: (updates: Partial<Scene>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState(scene.description);
  const referenceId = useId();
  const notesId = useId();

  const metadataCount = [
    scene.camera,
    scene.angle,
    scene.movement,
    scene.location?.name,
    scene.reference,
    scene.post_production ? "pp" : null,
  ].filter(Boolean).length + (scene.requirements?.length ?? 0);

  return (
    <div className="flex-1 rounded-sm border border-border bg-surface-2 p-3">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-secondary">
            ESCENA {String(index).padStart(2, "0")}
          </span>
          <SceneStatusPill status={scene.status} />
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="rounded-sm font-mono text-xs text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {expanded
            ? "OCULTAR DETALLES"
            : metadataCount > 0
              ? `DETALLES (${metadataCount}) ▾`
              : "+ DETALLES ▾"}
        </button>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => onUpdate({ description })}
        placeholder="¿Qué necesitas mostrar/grabar?"
        aria-label="Descripción de la escena"
        rows={2}
        className="w-full resize-none rounded-sm bg-transparent text-base text-text-primary placeholder:text-text-disabled focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
          <div className="grid grid-cols-3 gap-2">
            <PresetSelect
              label="CÁMARA"
              options={CAMERA_TYPES}
              value={scene.camera ?? ""}
              onChange={(camera) => onUpdate({ camera: camera || null })}
            />
            <PresetSelect
              label="ÁNGULO"
              options={CAMERA_ANGLES}
              value={scene.angle ?? ""}
              onChange={(angle) => onUpdate({ angle: angle || null })}
            />
            <PresetSelect
              label="MOVIMIENTO"
              options={CAMERA_MOVEMENTS}
              value={scene.movement ?? ""}
              onChange={(movement) => onUpdate({ movement: movement || null })}
            />
          </div>

          <LocationPicker
            initialLocationName={scene.location?.name ?? null}
            onChange={(locationId) => onUpdate({ location_id: locationId })}
          />

          <ChipMultiSelect
            label="NECESIDADES"
            options={SCENE_REQUIREMENTS}
            value={scene.requirements ?? []}
            onChange={(requirements) => onUpdate({ requirements })}
          />

          <div>
            <label htmlFor={referenceId} className="mb-1 block font-mono text-xs text-text-secondary">
              REFERENCIA (URL)
            </label>
            <input
              id={referenceId}
              defaultValue={scene.reference ?? ""}
              onBlur={(e) =>
                onUpdate({ reference: e.target.value.trim() || null })
              }
              placeholder="https://…"
              className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
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
                className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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
              className="w-full resize-none rounded-sm border border-border bg-surface px-2 py-1 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </div>
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onDelete} className="px-2 py-1">
          <Trash2 size={13} />
          Eliminar
        </Button>
      </div>
    </div>
  );
}

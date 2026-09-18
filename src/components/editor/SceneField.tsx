"use client";

import { useState } from "react";
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
        <span className="font-mono text-[11px] text-text-secondary">
          ESCENA {String(index).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="font-mono text-[10px] text-text-secondary hover:text-text-primary"
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
        rows={2}
        className="w-full resize-none bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
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
            <label className="mb-1 block font-mono text-[10px] text-text-secondary">
              REFERENCIA (URL)
            </label>
            <input
              defaultValue={scene.reference ?? ""}
              onBlur={(e) =>
                onUpdate({ reference: e.target.value.trim() || null })
              }
              placeholder="https://…"
              className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-xs text-text-primary placeholder:text-text-disabled focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 font-mono text-[10px] text-text-secondary">
              <input
                type="checkbox"
                checked={scene.post_production}
                onChange={(e) =>
                  onUpdate({ post_production: e.target.checked })
                }
                className="accent-accent"
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
                className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-xs text-text-primary placeholder:text-text-disabled focus:border-accent"
              />
            )}
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] text-text-secondary">
              NOTAS
            </label>
            <textarea
              defaultValue={scene.notes ?? ""}
              onBlur={(e) => onUpdate({ notes: e.target.value.trim() || null })}
              rows={2}
              placeholder="Lo que no encaje arriba…"
              className="w-full resize-none rounded-sm border border-border bg-surface px-2 py-1 text-xs text-text-primary placeholder:text-text-disabled focus:border-accent"
            />
          </div>
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <button
          onClick={onDelete}
          className="text-xs text-text-secondary hover:text-status-missing"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

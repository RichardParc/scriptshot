"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Scene, ScenePresets, StoryBlock, VoiceOver } from "@/lib/types";
import { SceneField } from "./SceneField";
import { Button } from "@/components/ui/Button";
import { SortableList } from "./SortableList";
import { SortableItem, type DragHandleProps } from "./SortableItem";
import { DragHandle } from "./DragHandle";

export function StoryBlockSection({
  block,
  presets,
  dragHandleProps,
  onRename,
  onDelete,
  onAddVoiceOver,
  onUpdateVoiceOver,
  onToggleVoiceOverRecorded,
  onDeleteVoiceOver,
  onReorderVoiceOvers,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onReorderScenes,
}: {
  block: StoryBlock;
  presets: ScenePresets;
  dragHandleProps: DragHandleProps;
  onRename: (title: string) => void;
  onDelete: () => void;
  onAddVoiceOver: () => void;
  onUpdateVoiceOver: (id: string, text: string) => void;
  onToggleVoiceOverRecorded: (vo: VoiceOver) => void;
  onDeleteVoiceOver: (id: string) => void;
  onReorderVoiceOvers: (newOrderIds: string[]) => void;
  onAddScene: () => void;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onDeleteScene: (id: string) => void;
  onReorderScenes: (newOrderIds: string[]) => void;
}) {
  const [title, setTitle] = useState(block.title);

  const sortedVO = [...block.voice_over].sort((a, b) => a.order - b.order);
  const sortedScenes = [...block.scene].sort((a, b) => a.order - b.order);
  const voIds = sortedVO.map((vo) => vo.id);
  const sceneIds = sortedScenes.map((s) => s.id);

  return (
    <section className="mb-4 rounded-md border border-border bg-surface p-6">
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <DragHandle dragHandleProps={dragHandleProps} className="mt-1" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && onRename(title.trim())}
          aria-label="Título del bloque"
          className="min-w-0 flex-1 rounded-sm bg-transparent text-lg font-medium text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
        <Button variant="danger" size="sm" onClick={onDelete} className="shrink-0">
          <Trash2 size={13} />
          Borrar
        </Button>
      </div>

      {/* Voice-over */}
      <div className="mb-4 pl-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs text-text-secondary">
            VOZ EN OFF
          </span>
          <button
            onClick={onAddVoiceOver}
            className="rounded-sm text-sm text-accent-hover hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            + Voz en off
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <SortableList items={voIds} onReorder={onReorderVoiceOvers}>
            {sortedVO.map((vo) => (
              <SortableItem key={vo.id} id={vo.id}>
                {({ dragHandleProps: voDragProps }) => (
                  <div className="flex items-start gap-2">
                    <DragHandle dragHandleProps={voDragProps} className="mt-3" />
                    <VoiceOverField
                      vo={vo}
                      onUpdate={(text) => onUpdateVoiceOver(vo.id, text)}
                      onToggleRecorded={() => onToggleVoiceOverRecorded(vo)}
                      onDelete={() => onDeleteVoiceOver(vo.id)}
                    />
                  </div>
                )}
              </SortableItem>
            ))}
          </SortableList>
          {sortedVO.length === 0 && (
            <p className="text-sm text-text-disabled">
              Sin voz en off en este bloque.
            </p>
          )}
        </div>
      </div>

      {/* Scenes */}
      <div className="pl-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs text-text-secondary">
            ESCENAS
          </span>
          <button
            onClick={onAddScene}
            className="rounded-sm text-sm text-accent-hover hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            + Escena
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <SortableList items={sceneIds} onReorder={onReorderScenes}>
            {sortedScenes.map((scene, i) => (
              <SortableItem key={scene.id} id={scene.id}>
                {({ dragHandleProps: sceneDragProps }) => (
                  <div className="flex items-start gap-2">
                    <DragHandle dragHandleProps={sceneDragProps} className="mt-3" />
                    <SceneField
                      scene={scene}
                      index={i + 1}
                      presets={presets}
                      onUpdate={(updates) => onUpdateScene(scene.id, updates)}
                      onDelete={() => onDeleteScene(scene.id)}
                    />
                  </div>
                )}
              </SortableItem>
            ))}
          </SortableList>
          {sortedScenes.length === 0 && (
            <p className="text-sm text-text-disabled">
              Sin escenas en este bloque.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function VoiceOverField({
  vo,
  onUpdate,
  onToggleRecorded,
  onDelete,
}: {
  vo: VoiceOver;
  onUpdate: (text: string) => void;
  onToggleRecorded: () => void;
  onDelete: () => void;
}) {
  const [text, setText] = useState(vo.text);

  return (
    <div className="min-w-0 flex-1 rounded-sm border border-border bg-surface-2 p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onUpdate(text)}
        placeholder="¿Qué necesitas decir?"
        aria-label="Texto de voz en off"
        rows={2}
        className="w-full resize-none rounded-sm bg-transparent text-base text-text-primary placeholder:text-text-disabled focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={onToggleRecorded}
          aria-pressed={vo.recorded}
          className={`rounded-sm font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
            vo.recorded ? "text-accent-hover" : "text-text-secondary"
          }`}
        >
          {vo.recorded ? "✓ GRABADA" : "PENDIENTE DE GRABAR"}
        </button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="px-2 py-1">
          <Trash2 size={13} />
          Borrar
        </Button>
      </div>
    </div>
  );
}

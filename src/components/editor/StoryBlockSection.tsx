"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Scene, ScenePresets, StoryBlock, VoiceOver } from "@/lib/types";
import { SceneField } from "./SceneField";
import { Button } from "@/components/ui/Button";
import { SortableList } from "./SortableList";
import { SortableItem, type DragHandleProps } from "./SortableItem";
import { DragHandle } from "./DragHandle";
import { useConfirm } from "@/components/ui/useConfirm";

export function StoryBlockSection({
  block,
  presets,
  dragHandleProps,
  isDragging = false,
  onRename,
  onDelete,
  onAddVoiceOver,
  onDraftVoiceOver,
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
  isDragging?: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
  onAddVoiceOver: () => void;
  onDraftVoiceOver: (id: string, text: string) => void;
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
    <section className={`relative mb-4 overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-[border-color,box-shadow] sm:p-5 ${isDragging ? "border-accent ring-2 ring-accent/60 shadow-lg shadow-accent/20" : ""}`}>
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-accent via-accent/40 to-transparent" />
      <div className="relative mb-5 flex flex-wrap items-start gap-x-1 gap-y-3 sm:gap-3">
        <DragHandle dragHandleProps={dragHandleProps} compact className="absolute -left-3 top-0 z-10" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && onRename(title.trim())}
          aria-label="Título del bloque"
          className="min-w-0 flex-1 rounded-sm bg-transparent pl-4 text-lg font-semibold tracking-tight text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:text-xl"
        />
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          aria-label={`Borrar bloque: ${title || block.title}`}
          title={`Borrar bloque: ${title || block.title}`}
          className="h-11 w-11 shrink-0 rounded-lg p-0"
        >
          <Trash2 size={18} />
        </Button>
      </div>

      {/* Voice-over */}
      <div className="mb-5 pl-1 sm:pl-2">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-text-secondary">
            VOZ EN OFF
          </span>
          <button
            onClick={onAddVoiceOver}
            className="rounded-md border border-accent/25 bg-accent-muted/50 px-3 py-2 text-xs font-medium text-accent-hover transition-colors hover:bg-accent-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            + Voz en off
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <SortableList items={voIds} onReorder={onReorderVoiceOvers}>
            {sortedVO.map((vo) => (
              <SortableItem key={vo.id} id={vo.id}>
                {({ dragHandleProps: voDragProps, isDragging }) => (
                  <div className="relative flex items-start sm:gap-2">
                    <DragHandle dragHandleProps={voDragProps} className="absolute -left-5 top-2 z-10 sm:static sm:mt-3" />
                    <VoiceOverField
                      vo={vo}
                      isDragging={isDragging}
                      onDraft={(text) => onDraftVoiceOver(vo.id, text)}
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
      <div className="pl-1 sm:pl-2">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-text-secondary">
            ESCENAS
          </span>
          <button
            onClick={onAddScene}
            className="rounded-md border border-accent/25 bg-accent-muted/50 px-3 py-2 text-xs font-medium text-accent-hover transition-colors hover:bg-accent-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            + Escena
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <SortableList items={sceneIds} onReorder={onReorderScenes}>
            {sortedScenes.map((scene, i) => (
              <SortableItem key={scene.id} id={scene.id}>
                {({ dragHandleProps: sceneDragProps, isDragging }) => (
                  <div className="relative flex items-start sm:gap-2">
                    <DragHandle dragHandleProps={sceneDragProps} className="absolute -left-5 top-2 z-10 sm:static sm:mt-3" />
                    <SceneField
                      scene={scene}
                      isDragging={isDragging}
                      index={i + 1}
                      voiceOvers={sortedVO}
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
  isDragging = false,
  onDraft,
  onUpdate,
  onToggleRecorded,
  onDelete,
}: {
  vo: VoiceOver;
  isDragging?: boolean;
  onDraft: (text: string) => void;
  onUpdate: (text: string) => void;
  onToggleRecorded: () => void;
  onDelete: () => void;
}) {
  const [text, setText] = useState(vo.text);
  const { confirm, ConfirmModal } = useConfirm();

  async function confirmDelete() {
    const confirmed = await confirm({
      title: "¿Eliminar esta voz en off?",
      description: "Se quitará de este bloque. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar voz en off",
    });
    if (confirmed) onDelete();
  }

  return (
    <div className={`min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-canvas/60 p-3 transition-[border-color,box-shadow] sm:p-4 ${isDragging ? "border-accent ring-2 ring-accent/60 shadow-lg shadow-accent/20" : ""}`}>
      <div className="mb-2 flex min-h-10 items-center justify-between gap-3">
        <button
          onClick={onToggleRecorded}
          aria-pressed={vo.recorded}
          className={`min-h-8 rounded-sm py-1 text-left font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
            vo.recorded ? "text-accent-hover" : "text-text-secondary"
          }`}
        >
          {vo.recorded ? "✓ GRABADA" : "PENDIENTE DE GRABAR"}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void confirmDelete()}
          aria-label="Borrar voz en off"
          title="Borrar voz en off"
          className="h-10 w-10 shrink-0 rounded-lg !p-0"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onDraft(e.target.value);
        }}
        onBlur={() => onUpdate(text)}
        placeholder="¿Qué necesitas decir?"
        aria-label="Texto de voz en off"
        rows={2}
        className="w-full resize-none rounded-sm bg-transparent text-base text-text-primary placeholder:text-text-disabled focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      {ConfirmModal}
    </div>
  );
}

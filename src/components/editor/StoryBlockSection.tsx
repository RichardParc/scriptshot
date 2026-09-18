"use client";

import { useState } from "react";
import type { Scene, StoryBlock, VoiceOver } from "@/lib/types";
import { ReorderArrows } from "./ReorderArrows";
import { SceneField } from "./SceneField";

export function StoryBlockSection({
  block,
  isFirst,
  isLast,
  onRename,
  onDelete,
  onMove,
  onAddVoiceOver,
  onUpdateVoiceOver,
  onToggleVoiceOverRecorded,
  onDeleteVoiceOver,
  onMoveVoiceOver,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onMoveScene,
}: {
  block: StoryBlock;
  isFirst: boolean;
  isLast: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
  onAddVoiceOver: () => void;
  onUpdateVoiceOver: (id: string, text: string) => void;
  onToggleVoiceOverRecorded: (vo: VoiceOver) => void;
  onDeleteVoiceOver: (id: string) => void;
  onMoveVoiceOver: (id: string, dir: "up" | "down") => void;
  onAddScene: () => void;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onDeleteScene: (id: string) => void;
  onMoveScene: (id: string, dir: "up" | "down") => void;
}) {
  const [title, setTitle] = useState(block.title);

  const sortedVO = [...block.voice_over].sort((a, b) => a.order - b.order);
  const sortedScenes = [...block.scene].sort((a, b) => a.order - b.order);

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <div className="mb-4 flex items-start gap-3">
        <ReorderArrows
          onUp={() => onMove("up")}
          onDown={() => onMove("down")}
          disableUp={isFirst}
          disableDown={isLast}
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && onRename(title.trim())}
          className="flex-1 bg-transparent text-base font-medium text-text-primary focus:outline-none"
        />
        <button
          onClick={onDelete}
          className="text-xs text-text-secondary hover:text-status-missing"
        >
          Eliminar bloque
        </button>
      </div>

      {/* Voice-over */}
      <div className="mb-4 pl-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-text-secondary">
            VOZ EN OFF
          </span>
          <button
            onClick={onAddVoiceOver}
            className="text-xs text-accent hover:text-accent-hover"
          >
            + Voz en off
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {sortedVO.map((vo, i) => (
            <div key={vo.id} className="flex items-start gap-2">
              <ReorderArrows
                onUp={() => onMoveVoiceOver(vo.id, "up")}
                onDown={() => onMoveVoiceOver(vo.id, "down")}
                disableUp={i === 0}
                disableDown={i === sortedVO.length - 1}
              />
              <VoiceOverField
                vo={vo}
                onUpdate={(text) => onUpdateVoiceOver(vo.id, text)}
                onToggleRecorded={() => onToggleVoiceOverRecorded(vo)}
                onDelete={() => onDeleteVoiceOver(vo.id)}
              />
            </div>
          ))}
          {sortedVO.length === 0 && (
            <p className="text-xs text-text-disabled">
              Sin voz en off en este bloque.
            </p>
          )}
        </div>
      </div>

      {/* Scenes */}
      <div className="pl-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-text-secondary">
            ESCENAS
          </span>
          <button
            onClick={onAddScene}
            className="text-xs text-accent hover:text-accent-hover"
          >
            + Escena
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {sortedScenes.map((scene, i) => (
            <div key={scene.id} className="flex items-start gap-2">
              <ReorderArrows
                onUp={() => onMoveScene(scene.id, "up")}
                onDown={() => onMoveScene(scene.id, "down")}
                disableUp={i === 0}
                disableDown={i === sortedScenes.length - 1}
              />
              <SceneField
                scene={scene}
                index={i + 1}
                onUpdate={(updates) => onUpdateScene(scene.id, updates)}
                onDelete={() => onDeleteScene(scene.id)}
              />
            </div>
          ))}
          {sortedScenes.length === 0 && (
            <p className="text-xs text-text-disabled">
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
    <div className="flex-1 rounded-sm border border-border bg-surface-2 p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onUpdate(text)}
        placeholder="¿Qué necesitas decir?"
        rows={2}
        className="w-full resize-none bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={onToggleRecorded}
          className={`font-mono text-[11px] ${
            vo.recorded ? "text-accent" : "text-text-secondary"
          }`}
        >
          {vo.recorded ? "✓ GRABADA" : "PENDIENTE DE GRABAR"}
        </button>
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

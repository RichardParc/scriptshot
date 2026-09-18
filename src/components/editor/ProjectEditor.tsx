"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Scene, StoryBlock, VoiceOver } from "@/lib/types";
import { StoryBlockSection } from "./StoryBlockSection";

function nextOrder(items: { order: number }[]) {
  return items.length === 0 ? 0 : Math.max(...items.map((i) => i.order)) + 1;
}

// Swap `order` between two adjacent items and persist both.
// Returns false if either write failed, so callers can avoid updating the
// screen with a change that didn't actually save.
async function swapOrder(
  table: "story_block" | "voice_over" | "scene",
  a: { id: string; order: number },
  b: { id: string; order: number }
): Promise<boolean> {
  const [ra, rb] = await Promise.all([
    supabase.from(table).update({ order: b.order }).eq("id", a.id),
    supabase.from(table).update({ order: a.order }).eq("id", b.id),
  ]);
  return !ra.error && !rb.error;
}

const GENERIC_ERROR =
  "No se pudo guardar el cambio. Revisa tu conexión e inténtalo de nuevo.";

export function ProjectEditor({
  projectId,
  initialBlocks,
}: {
  projectId: string;
  initialBlocks: StoryBlock[];
}) {
  const [blocks, setBlocks] = useState<StoryBlock[]>(
    [...initialBlocks].sort((a, b) => a.order - b.order)
  );
  const [error, setError] = useState<string | null>(null);

  async function addBlock() {
    const order = nextOrder(blocks);
    const { data, error } = await supabase
      .from("story_block")
      .insert({ project_id: projectId, title: "Nuevo bloque", order })
      .select("*")
      .single();
    if (error || !data) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) => [
      ...prev,
      { ...data, voice_over: [], scene: [] } as StoryBlock,
    ]);
  }

  async function renameBlock(id: string, title: string) {
    const { error } = await supabase
      .from("story_block")
      .update({ title })
      .eq("id", id);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, title } : b)));
  }

  async function deleteBlock(id: string) {
    const confirmed = window.confirm(
      "¿Eliminar este bloque? Se eliminan también su voz en off y sus escenas."
    );
    if (!confirmed) return;

    const { error } = await supabase.from("story_block").delete().eq("id", id);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  async function moveBlock(id: string, dir: "up" | "down") {
    const sorted = [...blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const ok = await swapOrder("story_block", a, b);
    if (!ok) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((blk) => {
        if (blk.id === a.id) return { ...blk, order: b.order };
        if (blk.id === b.id) return { ...blk, order: a.order };
        return blk;
      })
    );
  }

  // --- Voice-over ---

  async function addVoiceOver(blockId: string) {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const order = nextOrder(block.voice_over);
    const { data, error } = await supabase
      .from("voice_over")
      .insert({ story_block_id: blockId, text: "", recorded: false, order })
      .select("*")
      .single();
    if (error || !data) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, voice_over: [...b.voice_over, data as VoiceOver] }
          : b
      )
    );
  }

  async function updateVoiceOver(blockId: string, id: string, text: string) {
    const { error } = await supabase
      .from("voice_over")
      .update({ text })
      .eq("id", id);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              voice_over: b.voice_over.map((vo) =>
                vo.id === id ? { ...vo, text } : vo
              ),
            }
          : b
      )
    );
  }

  async function toggleVoiceOverRecorded(blockId: string, vo: VoiceOver) {
    const recorded = !vo.recorded;
    const { error } = await supabase
      .from("voice_over")
      .update({ recorded })
      .eq("id", vo.id);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              voice_over: b.voice_over.map((v) =>
                v.id === vo.id ? { ...v, recorded } : v
              ),
            }
          : b
      )
    );
  }

  async function deleteVoiceOver(blockId: string, id: string) {
    const { error } = await supabase.from("voice_over").delete().eq("id", id);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, voice_over: b.voice_over.filter((vo) => vo.id !== id) }
          : b
      )
    );
  }

  async function moveVoiceOver(
    blockId: string,
    id: string,
    dir: "up" | "down"
  ) {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const sorted = [...block.voice_over].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((v) => v.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const ok = await swapOrder("voice_over", a, b);
    if (!ok) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((blk) =>
        blk.id === blockId
          ? {
              ...blk,
              voice_over: blk.voice_over.map((vo) => {
                if (vo.id === a.id) return { ...vo, order: b.order };
                if (vo.id === b.id) return { ...vo, order: a.order };
                return vo;
              }),
            }
          : blk
      )
    );
  }

  // --- Scenes ---

  async function addScene(blockId: string) {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const order = nextOrder(block.scene);
    const { data, error } = await supabase
      .from("scene")
      .insert({ story_block_id: blockId, description: "", order })
      .select("*")
      .single();
    if (error || !data) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, scene: [...b.scene, data as Scene] } : b
      )
    );
  }

  async function updateScene(
    blockId: string,
    id: string,
    updates: Partial<Scene>
  ) {
    const { error } = await supabase.from("scene").update(updates).eq("id", id);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              scene: b.scene.map((s) =>
                s.id === id ? { ...s, ...updates } : s
              ),
            }
          : b
      )
    );
  }

  async function deleteScene(blockId: string, id: string) {
    const { error } = await supabase.from("scene").delete().eq("id", id);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, scene: b.scene.filter((s) => s.id !== id) }
          : b
      )
    );
  }

  async function moveScene(blockId: string, id: string, dir: "up" | "down") {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const sorted = [...block.scene].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const ok = await swapOrder("scene", a, b);
    if (!ok) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) =>
      prev.map((blk) =>
        blk.id === blockId
          ? {
              ...blk,
              scene: blk.scene.map((s) => {
                if (s.id === a.id) return { ...s, order: b.order };
                if (s.id === b.id) return { ...s, order: a.order };
                return s;
              }),
            }
          : blk
      )
    );
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-status-missing/40 bg-status-missing/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-status-missing">
            <AlertCircle size={16} />
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-status-missing hover:opacity-70"
            aria-label="Cerrar aviso"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {sortedBlocks.map((block, i) => (
        <StoryBlockSection
          key={block.id}
          block={block}
          isFirst={i === 0}
          isLast={i === sortedBlocks.length - 1}
          onRename={(title) => renameBlock(block.id, title)}
          onDelete={() => deleteBlock(block.id)}
          onMove={(dir) => moveBlock(block.id, dir)}
          onAddVoiceOver={() => addVoiceOver(block.id)}
          onUpdateVoiceOver={(id, text) =>
            updateVoiceOver(block.id, id, text)
          }
          onToggleVoiceOverRecorded={(vo) =>
            toggleVoiceOverRecorded(block.id, vo)
          }
          onDeleteVoiceOver={(id) => deleteVoiceOver(block.id, id)}
          onMoveVoiceOver={(id, dir) => moveVoiceOver(block.id, id, dir)}
          onAddScene={() => addScene(block.id)}
          onUpdateScene={(id, updates) => updateScene(block.id, id, updates)}
          onDeleteScene={(id) => deleteScene(block.id, id)}
          onMoveScene={(id, dir) => moveScene(block.id, id, dir)}
        />
      ))}

      {sortedBlocks.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-text-secondary">
          Sin bloques todavía. Empieza con uno (Hook, Contexto, Desarrollo...
          lo que tenga sentido para esta historia).
        </div>
      )}

      <button
        onClick={addBlock}
        className="self-start rounded-sm border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent hover:text-accent"
      >
        + Agregar bloque
      </button>
    </div>
  );
}

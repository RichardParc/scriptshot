"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Scene, ScenePresets, StoryBlock, VoiceOver } from "@/lib/types";
import { StoryBlockSection } from "./StoryBlockSection";
import { useConfirm } from "@/components/ui/useConfirm";
import { Button } from "@/components/ui/Button";
import { SortableList } from "./SortableList";
import { SortableItem } from "./SortableItem";

function nextOrder(items: { order: number }[]) {
  return items.length === 0 ? 0 : Math.max(...items.map((i) => i.order)) + 1;
}

// Persist a full reordering (every item's new `order`, not just a swap of
// two). Returns false if any write failed, so callers can avoid updating
// the screen with a change that didn't actually save.
async function persistReorder(
  table: "story_block" | "voice_over" | "scene",
  itemsWithNewOrder: { id: string; order: number }[]
): Promise<boolean> {
  const results = await Promise.all(
    itemsWithNewOrder.map(({ id, order }) =>
      supabase.from(table).update({ order }).eq("id", id)
    )
  );
  return results.every((r) => !r.error);
}

const GENERIC_ERROR =
  "No se pudo guardar el cambio. Revisa tu conexión e inténtalo de nuevo.";

export function ProjectEditor({
  projectId,
  initialBlocks,
  presets,
}: {
  projectId: string;
  initialBlocks: StoryBlock[];
  presets: ScenePresets;
}) {
  const [blocks, setBlocks] = useState<StoryBlock[]>(
    [...initialBlocks].sort((a, b) => a.order - b.order)
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();

  async function addBlock() {
    setSaving(true);
    const order = nextOrder(blocks);
    const { data, error } = await supabase
      .from("story_block")
      .insert({ project_id: projectId, title: "Nuevo bloque", order })
      .select("*")
      .single();
    setSaving(false);
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
    setSaving(true);
    const { error } = await supabase
      .from("story_block")
      .update({ title })
      .eq("id", id);
    setSaving(false);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, title } : b)));
  }

  async function deleteBlock(id: string) {
    const confirmed = await confirm({
      title: "¿Eliminar este bloque?",
      description: "Se eliminan también su voz en off y sus escenas.",
      confirmLabel: "Borrar",
    });
    if (!confirmed) return;

    setSaving(true);
    const { error } = await supabase.from("story_block").delete().eq("id", id);
    setSaving(false);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  async function reorderBlocks(newOrderIds: string[]) {
    const itemsWithNewOrder = newOrderIds.map((id, index) => ({ id, order: index }));
    setSaving(true);
    const ok = await persistReorder("story_block", itemsWithNewOrder);
    setSaving(false);
    if (!ok) {
      setError(GENERIC_ERROR);
      return;
    }
    const orderMap = new Map(itemsWithNewOrder.map((i) => [i.id, i.order]));
    setBlocks((prev) =>
      prev.map((b) => (orderMap.has(b.id) ? { ...b, order: orderMap.get(b.id)! } : b))
    );
  }

  // --- Voice-over ---

  async function addVoiceOver(blockId: string) {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const order = nextOrder(block.voice_over);
    setSaving(true);
    const { data, error } = await supabase
      .from("voice_over")
      .insert({ story_block_id: blockId, text: "", recorded: false, order })
      .select("*")
      .single();
    setSaving(false);
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
    setSaving(true);
    const { error } = await supabase
      .from("voice_over")
      .update({ text })
      .eq("id", id);
    setSaving(false);
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
    setSaving(true);
    const { error } = await supabase
      .from("voice_over")
      .update({ recorded })
      .eq("id", vo.id);
    setSaving(false);
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
    setSaving(true);
    const { error } = await supabase.from("voice_over").delete().eq("id", id);
    setSaving(false);
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

  async function reorderVoiceOvers(blockId: string, newOrderIds: string[]) {
    const itemsWithNewOrder = newOrderIds.map((id, index) => ({ id, order: index }));
    setSaving(true);
    const ok = await persistReorder("voice_over", itemsWithNewOrder);
    setSaving(false);
    if (!ok) {
      setError(GENERIC_ERROR);
      return;
    }
    const orderMap = new Map(itemsWithNewOrder.map((i) => [i.id, i.order]));
    setBlocks((prev) =>
      prev.map((blk) =>
        blk.id === blockId
          ? {
              ...blk,
              voice_over: blk.voice_over.map((vo) =>
                orderMap.has(vo.id) ? { ...vo, order: orderMap.get(vo.id)! } : vo
              ),
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
    setSaving(true);
    const { data, error } = await supabase
      .from("scene")
      .insert({ story_block_id: blockId, description: "", order })
      .select("*")
      .single();
    setSaving(false);
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
    setSaving(true);
    const { error } = await supabase.from("scene").update(updates).eq("id", id);
    setSaving(false);
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
    setSaving(true);
    const { error } = await supabase.from("scene").delete().eq("id", id);
    setSaving(false);
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

  async function reorderScenes(blockId: string, newOrderIds: string[]) {
    const itemsWithNewOrder = newOrderIds.map((id, index) => ({ id, order: index }));
    setSaving(true);
    const ok = await persistReorder("scene", itemsWithNewOrder);
    setSaving(false);
    if (!ok) {
      setError(GENERIC_ERROR);
      return;
    }
    const orderMap = new Map(itemsWithNewOrder.map((i) => [i.id, i.order]));
    setBlocks((prev) =>
      prev.map((blk) =>
        blk.id === blockId
          ? {
              ...blk,
              scene: blk.scene.map((s) =>
                orderMap.has(s.id) ? { ...s, order: orderMap.get(s.id)! } : s
              ),
            }
          : blk
      )
    );
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  const blockIds = sortedBlocks.map((b) => b.id);
  const sceneCount = blocks.reduce((count, block) => count + block.scene.length, 0);
  const voiceOverCount = blocks.reduce((count, block) => count + block.voice_over.length, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.16em] text-text-secondary">DESARROLLO DEL PROYECTO</p>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">Guion y escenas</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {sortedBlocks.length} {sortedBlocks.length === 1 ? "bloque" : "bloques"} · {sceneCount} {sceneCount === 1 ? "escena" : "escenas"} · {voiceOverCount} voces en off
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={addBlock} className="shrink-0">
          <Plus size={15} /> Agregar bloque
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-status-missing/40 bg-status-missing/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-status-missing">
            <AlertCircle size={16} />
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="rounded-sm text-status-missing hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Cerrar aviso"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <SortableList items={blockIds} onReorder={reorderBlocks}>
        {sortedBlocks.map((block) => (
          <SortableItem key={block.id} id={block.id}>
            {({ dragHandleProps }) => (
              <StoryBlockSection
                block={block}
                presets={presets}
                dragHandleProps={dragHandleProps}
                onRename={(title) => renameBlock(block.id, title)}
                onDelete={() => deleteBlock(block.id)}
                onAddVoiceOver={() => addVoiceOver(block.id)}
                onUpdateVoiceOver={(id, text) =>
                  updateVoiceOver(block.id, id, text)
                }
                onToggleVoiceOverRecorded={(vo) =>
                  toggleVoiceOverRecorded(block.id, vo)
                }
                onDeleteVoiceOver={(id) => deleteVoiceOver(block.id, id)}
                onReorderVoiceOvers={(newOrderIds) =>
                  reorderVoiceOvers(block.id, newOrderIds)
                }
                onAddScene={() => addScene(block.id)}
                onUpdateScene={(id, updates) => updateScene(block.id, id, updates)}
                onDeleteScene={(id) => deleteScene(block.id, id)}
                onReorderScenes={(newOrderIds) =>
                  reorderScenes(block.id, newOrderIds)
                }
              />
            )}
          </SortableItem>
        ))}
      </SortableList>

      {sortedBlocks.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center sm:px-8">
          <p className="text-base font-medium text-text-primary">Empieza a construir el guion</p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
            Divide la historia en bloques —por ejemplo, Hook, Contexto y Desarrollo— y añade dentro las voces en off y escenas.
          </p>
        </div>
      )}

      {saving && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary shadow-lg">
          <Loader2 size={14} className="animate-spin" />
          Guardando…
        </div>
      )}

      {ConfirmModal}
    </div>
  );
}

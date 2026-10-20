"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Scene, ScenePresets, StoryBlock, VoiceOver } from "@/lib/types";
import type { ProjectReference } from "@/lib/types";
import { StoryBlockSection } from "./StoryBlockSection";
import { ProjectReferences } from "@/components/ProjectReferences";
import { useConfirm } from "@/components/ui/useConfirm";
import { Button } from "@/components/ui/Button";
import { SortableList } from "./SortableList";
import { SortableItem } from "./SortableItem";
import { computeProjectSummary } from "@/lib/status";
import { STATUS_COLOR } from "@/components/StatusBadge";
import Link from "next/link";
import { ArrowUpRight, Clapperboard } from "lucide-react";
import { estimateVoiceOverSeconds, formatEstimatedDuration } from "@/lib/voice-over-duration";

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
  initialReferences,
}: {
  projectId: string;
  initialBlocks: StoryBlock[];
  presets: ScenePresets;
  initialReferences: ProjectReference[];
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<StoryBlock[]>(
    [...initialBlocks].sort((a, b) => a.order - b.order)
  );
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const pendingSaves = useRef(0);
  const batchFailed = useRef(false);
  const saving = saveState === "saving";
  const { confirm, ConfirmModal } = useConfirm();

  function beginSave() {
    if (pendingSaves.current === 0) batchFailed.current = false;
    pendingSaves.current += 1;
    setError(null);
    setSaveState("saving");
  }

  function finishSave(success: boolean) {
    if (!success) batchFailed.current = true;
    pendingSaves.current = Math.max(0, pendingSaves.current - 1);
    if (pendingSaves.current === 0) {
      setSaveState(batchFailed.current ? "error" : "saved");
    }
  }

  async function addBlock() {
    beginSave();
    const order = nextOrder(blocks);
    const { data, error } = await supabase
      .from("story_block")
      .insert({ project_id: projectId, title: "Nuevo bloque", order })
      .select("*")
      .single();
    finishSave(Boolean(data) && !error);
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
    beginSave();
    const { error } = await supabase
      .from("story_block")
      .update({ title })
      .eq("id", id);
    finishSave(!error);
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

    beginSave();
    const { error } = await supabase.from("story_block").delete().eq("id", id);
    finishSave(!error);
    if (error) {
      setError(GENERIC_ERROR);
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  async function reorderBlocks(newOrderIds: string[]) {
    const itemsWithNewOrder = newOrderIds.map((id, index) => ({ id, order: index }));
    beginSave();
    const ok = await persistReorder("story_block", itemsWithNewOrder);
    finishSave(ok);
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
    beginSave();
    const { data, error } = await supabase
      .from("voice_over")
      .insert({ story_block_id: blockId, text: "", recorded: false, order })
      .select("*")
      .single();
    finishSave(Boolean(data) && !error);
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
    router.refresh();
  }

  async function updateVoiceOver(blockId: string, id: string, text: string) {
    beginSave();
    const { error } = await supabase
      .from("voice_over")
      .update({ text })
      .eq("id", id);
    finishSave(!error);
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
    beginSave();
    const { error } = await supabase
      .from("voice_over")
      .update({ recorded })
      .eq("id", vo.id);
    finishSave(!error);
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
    router.refresh();
  }

  async function deleteVoiceOver(blockId: string, id: string) {
    beginSave();
    const { error } = await supabase.from("voice_over").delete().eq("id", id);
    finishSave(!error);
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
    router.refresh();
  }

  async function reorderVoiceOvers(blockId: string, newOrderIds: string[]) {
    const itemsWithNewOrder = newOrderIds.map((id, index) => ({ id, order: index }));
    beginSave();
    const ok = await persistReorder("voice_over", itemsWithNewOrder);
    finishSave(ok);
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
    beginSave();
    const { data, error } = await supabase
      .from("scene")
      .insert({ story_block_id: blockId, description: "", order })
      .select("*")
      .single();
    finishSave(Boolean(data) && !error);
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
    beginSave();
    const { error } = await supabase.from("scene").update(updates).eq("id", id);
    finishSave(!error);
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
    beginSave();
    const { error } = await supabase.from("scene").delete().eq("id", id);
    finishSave(!error);
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
    beginSave();
    const ok = await persistReorder("scene", itemsWithNewOrder);
    finishSave(ok);
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
  const estimatedNarrationSeconds = blocks.reduce(
    (total, block) => total + block.voice_over.reduce(
      (blockTotal, voiceOver) => blockTotal + estimateVoiceOverSeconds(voiceOver.text), 0
    ), 0
  );
  const progress = computeProjectSummary(blocks);
  const sceneProgress = progress.totalScenes > 0
    ? Math.round((progress.recordedScenes / progress.totalScenes) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.16em] text-text-secondary">DESARROLLO DEL PROYECTO</p>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">Guion y escenas</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {sortedBlocks.length} {sortedBlocks.length === 1 ? "bloque" : "bloques"} · {sceneCount} {sceneCount === 1 ? "escena" : "escenas"} · {voiceOverCount} voces en off
            {estimatedNarrationSeconds > 0 && <> · Voz estimada {formatEstimatedDuration(estimatedNarrationSeconds)}</>}
          </p>
        </div>
        {saveState !== "idle" && (
            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={`inline-flex items-center gap-1.5 text-xs ${
                saveState === "error" ? "text-status-missing" : "text-text-secondary"
              }`}
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              ) : saveState === "saved" ? (
                <Check size={13} aria-hidden="true" />
              ) : (
                <AlertCircle size={13} aria-hidden="true" />
              )}
              {saving
                ? "Guardando cambios…"
                : saveState === "saved"
                  ? "Cambios guardados"
                  : "No se pudo guardar"}
            </p>
          )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-surface/50 px-3 py-3 sm:px-4">
        <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-text-secondary">
          RODAJE
        </span>
        <div
          role="progressbar"
          aria-label="Progreso de escenas grabadas"
          aria-valuemin={0}
          aria-valuemax={progress.totalScenes || 1}
          aria-valuenow={progress.recordedScenes}
          className="h-1.5 min-w-20 flex-1 overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className={`h-full transition-[width] duration-500 ${STATUS_COLOR[progress.status]}`}
            style={{ width: `${sceneProgress}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-text-secondary">
          {progress.totalScenes > 0
            ? `${progress.recordedScenes}/${progress.totalScenes} grabadas · ${sceneProgress}%`
            : "Sin tomas todavía"}
        </span>
        {progress.totalVoiceOvers > 0 && (
          <span className="w-full text-xs text-text-secondary sm:w-auto sm:border-l sm:border-border sm:pl-3">
            Voz en off {progress.recordedVoiceOvers}/{progress.totalVoiceOvers} grabadas
          </span>
        )}
      </div>

      <Link
        href={`/project/${projectId}/rodaje`}
        className="group flex items-center justify-between gap-4 overflow-hidden rounded-xl border border-accent/35 bg-gradient-to-r from-accent-muted/70 via-surface to-surface p-4 transition-colors hover:border-accent/70 sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink shadow-lg shadow-accent/20 sm:h-12 sm:w-12">
            <Clapperboard size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.16em] text-accent-hover">MODO DE PRODUCCIÓN</p>
            <p className="mt-1 text-base font-semibold text-text-primary sm:text-lg">Ir al modo rodaje</p>
            <p className="mt-0.5 hidden text-sm text-text-secondary sm:block">Revisa tus tomas y actualiza su estado mientras grabas.</p>
          </div>
        </div>
        <ArrowUpRight size={20} className="shrink-0 text-accent-hover transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>

      <ProjectReferences projectId={projectId} initialReferences={initialReferences} />

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-status-missing/40 bg-status-missing/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-status-missing">
            <AlertCircle size={16} />
            {error}
          </div>
          <button
            onClick={() => {
              setError(null);
              setSaveState("idle");
            }}
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
            {({ dragHandleProps, isDragging }) => (
              <StoryBlockSection
                block={block}
                presets={presets}
                dragHandleProps={dragHandleProps}
                isDragging={isDragging}
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

      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={addBlock}
          className="min-h-11 rounded-lg px-5"
        >
          <Plus size={16} /> Agregar bloque
        </Button>
      </div>

      {ConfirmModal}
    </div>
  );
}

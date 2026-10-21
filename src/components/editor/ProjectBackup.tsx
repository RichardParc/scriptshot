"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/useConfirm";
import { supabase } from "@/lib/supabase";
import type { Project, ProjectReference, StoryBlock } from "@/lib/types";

const BACKUP_VERSION = 1;
const MAX_BACKUP_SIZE = 10 * 1024 * 1024;

type BackupFile = {
  app: "Scriptshot";
  version: number;
  exportedAt: string;
  project: Pick<Project, "name" | "format" | "duration" | "idea">;
  blocks: StoryBlock[];
  references: Pick<ProjectReference, "kind" | "title" | "url">[];
  omittedImageCount: number;
};

function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== "object") return false;
  const backup = value as Partial<BackupFile>;
  return backup.app === "Scriptshot" && backup.version === BACKUP_VERSION &&
    Boolean(backup.project && typeof backup.project.name === "string") &&
    Array.isArray(backup.blocks) && Array.isArray(backup.references);
}

export function ProjectBackup({
  project,
  blocks,
  references,
}: {
  project: Project;
  blocks: StoryBlock[];
  references: ProjectReference[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmModal } = useConfirm();

  function exportBackup() {
    const backup: BackupFile = {
      app: "Scriptshot",
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      project: { name: project.name, format: project.format, duration: project.duration, idea: project.idea },
      blocks: blocks.map((block) => ({
        ...block,
        voice_over: [...block.voice_over].sort((a, b) => a.order - b.order),
        scene: [...block.scene].sort((a, b) => a.order - b.order).map(({ location, ...scene }) => scene),
      })),
      // Image files live in private Supabase storage and cannot be embedded as metadata.
      references: references.filter((reference) => reference.kind === "link").map(({ kind, title, url }) => ({ kind, title, url })),
      omittedImageCount: references.filter((reference) => reference.kind === "image").length,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${project.name.trim().replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-|-$/g, "") || "proyecto"}-scriptshot.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Archivo JSON exportado.");
    setError(null);
  }

  async function importBackup(file?: File) {
    if (!file) return;
    setError(null);
    setMessage(null);
    if (file.size > MAX_BACKUP_SIZE) {
      setError("El archivo supera el límite de 10 MB.");
      return;
    }

    let backup: BackupFile;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBackupFile(parsed)) throw new Error("invalid");
      backup = parsed;
    } catch {
      setError("El archivo no es un respaldo de Scriptshot válido o no es compatible.");
      return;
    }

    const confirmed = await confirm({
      title: `¿Importar “${backup.project.name}” como proyecto nuevo?`,
      description: "Se creará una copia independiente. No se reemplazará ningún proyecto existente.",
      confirmLabel: "Crear copia",
    });
    if (!confirmed) return;

    setWorking(true);
    const { data: projectRow, error: projectError } = await supabase
      .from("project")
      .insert({
        name: `${backup.project.name} (copia)`,
        format: backup.project.format,
        duration: backup.project.duration,
        idea: backup.project.idea,
        status: "idea",
        folder_id: null,
      })
      .select("id")
      .single();

    if (projectError || !projectRow) {
      setWorking(false);
      setError("No se pudo crear la copia. Revisa tu sesión y vuelve a intentarlo.");
      return;
    }

    let failure: string | null = null;
    for (const [blockIndex, block] of backup.blocks.entries()) {
      const { data: newBlock, error: blockError } = await supabase
        .from("story_block")
        .insert({ project_id: projectRow.id, title: block.title, order: blockIndex })
        .select("id")
        .single();
      if (blockError || !newBlock) { failure = "No se pudieron importar todos los bloques."; break; }

      const voiceIds = new Map<string, string>();
      for (const [voiceIndex, voice] of (block.voice_over ?? []).entries()) {
        const { data: newVoice, error: voiceError } = await supabase
          .from("voice_over")
          .insert({ story_block_id: newBlock.id, text: voice.text, recorded: voice.recorded, order: voiceIndex })
          .select("id")
          .single();
        if (voiceError || !newVoice) { failure = "No se pudieron importar todas las voces en off."; break; }
        voiceIds.set(voice.id, newVoice.id);
      }
      if (failure) break;

      for (const [sceneIndex, scene] of (block.scene ?? []).entries()) {
        const { error: sceneError } = await supabase.from("scene").insert({
          story_block_id: newBlock.id,
          voice_over_id: scene.voice_over_id ? voiceIds.get(scene.voice_over_id) ?? null : null,
          description: scene.description,
          order: sceneIndex,
          camera: scene.camera,
          angle: scene.angle,
          movement: scene.movement,
          location_id: scene.location_id,
          requirements: scene.requirements,
          reference: scene.reference,
          post_production: scene.post_production,
          post_production_notes: scene.post_production_notes,
          notes: scene.notes,
          status: scene.status,
        });
        if (sceneError) { failure = "No se pudieron importar todas las escenas."; break; }
      }
      if (failure) break;
    }

    if (!failure) {
      const links = backup.references.filter((reference) => reference.kind === "link" && reference.url);
      if (links.length) {
        const { error: refsError } = await supabase.from("project_reference").insert(
          links.map((reference) => ({ project_id: projectRow.id, kind: "link", title: reference.title, url: reference.url }))
        );
        if (refsError) failure = "El proyecto se importó parcialmente: no se pudieron añadir todos los enlaces referentes.";
      }
    }

    if (failure) {
      // Project deletion cascades to any child rows already inserted.
      await supabase.from("project").delete().eq("id", projectRow.id);
      setWorking(false);
      setError(`${failure} La copia incompleta se limpió; tus proyectos existentes no cambiaron.`);
      return;
    }

    const hadImages = backup.omittedImageCount > 0;
    setWorking(false);
    setMessage(hadImages
      ? "Copia importada. Los enlaces y el guion se restauraron; los archivos de imagen deben subirse de nuevo."
      : "Copia importada correctamente.");
    router.push(`/project/${projectRow.id}`);
    router.refresh();
  }

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <Button type="button" variant="secondary" size="sm" onClick={exportBackup} title="Exportar proyecto como JSON" className="min-h-11 flex-1 rounded-lg px-3 text-xs sm:flex-none">
        <Download size={14} /> Exportar
      </Button>
      <Button type="button" variant="primary" size="sm" onClick={() => inputRef.current?.click()} disabled={working} title="Importar un proyecto desde JSON" className="min-h-11 flex-1 rounded-lg px-3 text-xs sm:flex-none">
        {working ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {working ? "Importando…" : "Importar JSON"}
      </Button>
      <input ref={inputRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Seleccionar respaldo de Scriptshot" onChange={(event) => { void importBackup(event.target.files?.[0]); event.currentTarget.value = ""; }} />
      {(message || error) && <p role={error ? "alert" : "status"} className={`w-full text-xs ${error ? "text-status-missing" : "text-text-secondary"}`}>{error ?? message}</p>}
      {ConfirmModal}
    </div>
  );
}

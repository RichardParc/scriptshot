"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, X, Trash2, FolderPlus, FolderInput } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Folder, Project } from "@/lib/types";
import type { ProjectSummary } from "@/lib/status";
import { FolderSection } from "./FolderSection";
import { ProjectCardGrid } from "./ProjectCardGrid";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useConfirm } from "@/components/ui/useConfirm";

const NO_FOLDER = "__none__";

type ProjectEntry = { project: Project; summary: ProjectSummary };

export function FoldersView({
  folders,
  projects,
}: {
  folders: Folder[];
  projects: ProjectEntry[];
}) {
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [movingOpen, setMovingOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState(NO_FOLDER);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function cancelSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setError(null);
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    const confirmed = await confirm({
      title: `¿Eliminar ${count} ${count === 1 ? "proyecto" : "proyectos"}?`,
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Borrar",
    });
    if (!confirmed) return;

    setBusy(true);
    const { error } = await supabase
      .from("project")
      .delete()
      .in("id", [...selectedIds]);
    setBusy(false);
    if (error) {
      setError("No se pudo eliminar. Intenta de nuevo.");
      return;
    }
    cancelSelection();
    router.refresh();
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    setBusy(true);
    const { error } = await supabase
      .from("folder")
      .insert({ name: newFolderName.trim() });
    setBusy(false);
    if (!error) {
      setNewFolderName("");
      setCreatingFolder(false);
      router.refresh();
    }
  }

  async function handleMove() {
    setBusy(true);
    const { error } = await supabase
      .from("project")
      .update({ folder_id: moveTarget === NO_FOLDER ? null : moveTarget })
      .in("id", [...selectedIds]);
    setBusy(false);
    if (error) {
      setError("No se pudo mover. Intenta de nuevo.");
      return;
    }
    setMovingOpen(false);
    cancelSelection();
    router.refresh();
  }

  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));
  const byFolder = new Map<string, ProjectEntry[]>();
  for (const f of sortedFolders) byFolder.set(f.id, []);
  const unfiled: ProjectEntry[] = [];
  for (const p of projects) {
    if (p.project.folder_id && byFolder.has(p.project.folder_id)) {
      byFolder.get(p.project.folder_id)!.push(p);
    } else {
      unfiled.push(p);
    }
  }

  const folderOptions = [
    { value: NO_FOLDER, label: "Sin carpeta" },
    ...sortedFolders.map((f) => ({ value: f.id, label: f.name })),
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {selectionMode ? (
          <>
            <span className="text-sm text-text-secondary">
              {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "seleccionado" : "seleccionados"}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={cancelSelection}>
                <X size={14} />
                Cancelar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMovingOpen(true)}
                disabled={selectedIds.size === 0}
              >
                <FolderInput size={14} />
                Mover a carpeta
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0 || busy}
              >
                <Trash2 size={14} />
                {busy ? "Borrando…" : "Borrar"}
              </Button>
            </div>
          </>
        ) : (
          <>
            {creatingFolder ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  placeholder="Nombre de la carpeta"
                  className="rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateFolder}
                  disabled={busy}
                >
                  Crear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCreatingFolder(false);
                    setNewFolderName("");
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreatingFolder(true)}
              >
                <FolderPlus size={14} />
                Nueva carpeta
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectionMode(true)}
              className="ml-auto"
            >
              <CheckSquare size={14} />
              Seleccionar
            </Button>
          </>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-status-missing">{error}</p>}

      {sortedFolders.length === 0 ? (
        <ProjectCardGrid
          projects={projects}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggle}
        />
      ) : (
        <>
          {sortedFolders.map((folder) => (
            <FolderSection
              key={folder.id}
              id={folder.id}
              name={folder.name}
              count={byFolder.get(folder.id)?.length ?? 0}
              editable
            >
              <ProjectCardGrid
                projects={byFolder.get(folder.id) ?? []}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={toggle}
              />
            </FolderSection>
          ))}
          <FolderSection
            id={null}
            name="Sin carpeta"
            count={unfiled.length}
            editable={false}
          >
            <ProjectCardGrid
              projects={unfiled}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelect={toggle}
            />
          </FolderSection>
        </>
      )}

      {movingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setMovingOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-border bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-medium text-text-primary">
              Mover {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "proyecto" : "proyectos"}
            </h2>
            <Select
              label="CARPETA"
              value={moveTarget}
              options={folderOptions}
              onChange={setMoveTarget}
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setMovingOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleMove} disabled={busy}>
                {busy ? "Moviendo…" : "Mover"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {ConfirmModal}
    </div>
  );
}

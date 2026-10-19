"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, X, Trash2, FolderPlus, FolderInput } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Folder } from "@/lib/types";
import {
  filterProjects,
  sortProjects,
  type ProjectEntry,
  type SortKey,
} from "@/lib/projectList";
import { FolderSection } from "./FolderSection";
import { ProjectCardGrid } from "./ProjectCardGrid";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { OptionList } from "@/components/ui/OptionList";
import { useConfirm } from "@/components/ui/useConfirm";

const NO_FOLDER = "__none__";

export function FoldersView({
  folders,
  projects,
  query,
  sort,
}: {
  folders: Folder[];
  projects: ProjectEntry[];
  query: string;
  sort: SortKey;
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

  const filtering = query.trim().length > 0;
  const visible = sortProjects(filterProjects(projects, query), sort);

  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));
  const byFolder = new Map<string, ProjectEntry[]>();
  for (const f of sortedFolders) byFolder.set(f.id, []);
  const unfiled: ProjectEntry[] = [];
  for (const p of visible) {
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
                  className="rounded-full border border-border-strong bg-surface-2 px-4 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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

      {filtering && (
        <p className="mb-4 font-mono text-xs text-text-secondary" aria-live="polite">
          {visible.length} {visible.length === 1 ? "resultado" : "resultados"}
        </p>
      )}

      {filtering && visible.length === 0 ? (
        <p className="py-16 text-center text-base text-text-secondary">
          Sin resultados para «{query.trim()}».
        </p>
      ) : sortedFolders.length === 0 ? (
        <ProjectCardGrid
          projects={visible}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggle}
        />
      ) : (
        <>
          {sortedFolders
            .filter((f) => !filtering || (byFolder.get(f.id)?.length ?? 0) > 0)
            .map((folder) => (
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
          {(!filtering || unfiled.length > 0) && (
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
          )}
        </>
      )}

      <BottomSheet
        open={movingOpen}
        onClose={() => setMovingOpen(false)}
        title={`Mover ${selectedIds.size} ${
          selectedIds.size === 1 ? "proyecto" : "proyectos"
        }`}
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => setMovingOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleMove}
              disabled={busy}
            >
              {busy ? "Moviendo…" : "Mover"}
            </Button>
          </div>
        }
      >
        <OptionList
          options={folderOptions}
          value={moveTarget}
          onChange={setMoveTarget}
          ariaLabel="Carpeta de destino"
        />
      </BottomSheet>

      {ConfirmModal}
    </div>
  );
}

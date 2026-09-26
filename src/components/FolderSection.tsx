"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Folder as FolderIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useConfirm } from "@/components/ui/useConfirm";
import type { ReactNode } from "react";

export function FolderSection({
  id,
  name,
  count,
  editable,
  children,
}: {
  id: string | null;
  name: string;
  count: number;
  editable: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [busy, setBusy] = useState(false);

  async function saveRename() {
    if (!id || !newName.trim() || newName.trim() === name) {
      setRenaming(false);
      setNewName(name);
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("folder")
      .update({ name: newName.trim() })
      .eq("id", id);
    setBusy(false);
    setRenaming(false);
    if (!error) router.refresh();
  }

  async function handleDelete() {
    if (!id) return;
    setMenuOpen(false);
    const confirmed = await confirm({
      title: `¿Eliminar la carpeta "${name}"?`,
      description: "Los proyectos dentro no se borran, solo quedan sin carpeta.",
      confirmLabel: "Borrar",
    });
    if (!confirmed) return;

    setBusy(true);
    const { error } = await supabase.from("folder").delete().eq("id", id);
    setBusy(false);
    if (!error) router.refresh();
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 rounded-sm text-text-primary hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          <FolderIcon size={15} className="text-text-secondary" />
          {renaming ? (
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={saveRename}
              onKeyDown={(e) => e.key === "Enter" && saveRename()}
              onClick={(e) => e.stopPropagation()}
              className="rounded-sm border border-accent bg-surface px-1 text-base font-medium text-text-primary focus:outline-none"
            />
          ) : (
            <span className="text-base font-medium">{name}</span>
          )}
          <span className="font-mono text-xs text-text-secondary">
            {count}
          </span>
        </button>

        {editable && !renaming && (
          <div className="relative ml-auto">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Opciones de la carpeta"
              disabled={busy}
              className="rounded-sm p-1 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-border bg-surface-2 py-1 shadow-xl shadow-black/40"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setRenaming(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface"
                >
                  <Pencil size={13} />
                  Renombrar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-status-missing hover:bg-surface"
                >
                  <Trash2 size={13} />
                  Eliminar carpeta
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!collapsed && children}

      {ConfirmModal}
    </div>
  );
}

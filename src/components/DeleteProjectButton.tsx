"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar "${projectName}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    const { error } = await supabase
      .from("project")
      .delete()
      .eq("id", projectId);

    if (error) {
      setDeleting(false);
      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-sm border border-border px-3 py-1.5 text-xs text-status-missing transition-colors hover:border-status-missing disabled:opacity-50"
      >
        {deleting ? "Eliminando…" : "Eliminar proyecto"}
      </button>
      {error && <p className="text-xs text-status-missing">{error}</p>}
    </div>
  );
}

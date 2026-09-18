"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

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
      <Button variant="danger" onClick={handleDelete} disabled={deleting}>
        <Trash2 size={15} />
        {deleting ? "Eliminando…" : "Eliminar proyecto"}
      </Button>
      {error && <p className="text-xs text-status-missing">{error}</p>}
    </div>
  );
}

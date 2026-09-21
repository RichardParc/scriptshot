"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/useConfirm";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = await confirm({
      title: `¿Eliminar "${projectName}"?`,
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar proyecto",
    });
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
      {error && <p className="text-sm text-status-missing">{error}</p>}
      {ConfirmModal}
    </div>
  );
}

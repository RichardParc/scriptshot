"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import type { StoryBlock } from "@/lib/types";

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("No se pudo leer el logo."));
    reader.onerror = () => reject(new Error("No se pudo leer el logo."));
    reader.readAsDataURL(blob);
  });
}

function fileName(projectName: string) {
  const slug = projectName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `guion-${slug || "scriptshot"}.pdf`;
}

export function ProjectPdfDownloadButton({
  projectName,
  blocks,
}: {
  projectName: string;
  blocks: StoryBlock[];
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadPdf() {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const logoResponse = await fetch("/logo-print.png");
      if (!logoResponse.ok) throw new Error("No se pudo cargar el logo.");
      const logoDataUrl = await readBlobAsDataUrl(await logoResponse.blob());
      const { createProjectPdf } = await import("./ProjectPdfDocument");
      const blob = await createProjectPdf(projectName, blocks, logoDataUrl);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName(projectName);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      setError("No se pudo generar el PDF. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={downloadPdf}
        disabled={busy}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-500 hover:bg-neutral-100 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/40"
      >
        {busy ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Download size={15} aria-hidden="true" />}
        {busy ? "Preparando PDF…" : "Descargar PDF"}
      </button>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

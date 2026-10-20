"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

type ReferenceMedia = "image" | "video" | null;

function getReferenceDetails(value: string): { href: string; media: ReferenceMedia } | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const path = url.pathname.toLowerCase();
    const media: ReferenceMedia =
      /\.(png|jpe?g|gif|webp|avif)$/.test(path)
        ? "image"
        : /\.(mp4|webm|ogv)$/.test(path)
          ? "video"
          : null;

    return { href: url.toString(), media };
  } catch {
    return null;
  }
}

export function SceneReferencePreview({ url }: { url: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const reference = url ? getReferenceDetails(url) : null;

  if (!url?.trim() || !reference) return null;

  const previewFailed = failedUrl === reference.href;
  const canPreview = reference.media && !previewFailed;

  return (
    <div className="mt-3 max-w-xl">
      {canPreview && (
        <div className="overflow-hidden rounded-lg bg-base/70">
          {reference.media === "image" ? (
            <img
              src={reference.href}
              alt="Vista previa de la referencia visual"
              loading="lazy"
              onError={() => setFailedUrl(reference.href)}
              className="max-h-80 w-full object-contain"
            />
          ) : (
            <video
              src={reference.href}
              controls
              playsInline
              preload="metadata"
              onError={() => setFailedUrl(reference.href)}
              className="max-h-80 w-full"
            >
              Tu navegador no puede reproducir este video.
            </video>
          )}
        </div>
      )}

      {previewFailed && (
        <p className="mb-1 text-xs text-text-secondary">
          No se pudo cargar la vista previa. Puedes abrir el enlace directamente.
        </p>
      )}

      <a
        href={reference.href}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-accent-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <ExternalLink size={14} aria-hidden="true" />
        Abrir referencia
      </a>
    </div>
  );
}

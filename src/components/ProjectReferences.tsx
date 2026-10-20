"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  ImagePlus,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ProjectReference } from "@/lib/types";

const BUCKET = "project-references";
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProjectReferences({
  projectId,
  initialReferences,
}: {
  projectId: string;
  initialReferences: ProjectReference[];
}) {
  const [references, setReferences] = useState(initialReferences);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [link, setLink] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [addingLink, setAddingLink] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    const imageReferences = references.filter(
      (reference) => reference.kind === "image" && reference.storage_path
    );

    Promise.all(
      imageReferences.map(async (reference) => {
        const { data, error: signedUrlError } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(reference.storage_path!, 60 * 60);
        if (signedUrlError) throw signedUrlError;
        return [reference.id, data.signedUrl] as const;
      })
    )
      .then((entries) => {
        if (active) setSignedUrls(Object.fromEntries(entries));
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar algunas imágenes de referencia.");
      });

    return () => {
      active = false;
    };
  }, [references]);

  async function addLink() {
    setError(null);
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(link.trim());
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("protocol");
      }
    } catch {
      setError("Añade un enlace válido que empiece por https:// o http://.");
      return;
    }

    setAddingLink(true);
    const { data, error: insertError } = await supabase
      .from("project_reference")
      .insert({
        project_id: projectId,
        kind: "link",
        title: linkTitle.trim() || parsedUrl.hostname.replace(/^www\./, ""),
        url: parsedUrl.toString(),
      })
      .select("*")
      .single();
    setAddingLink(false);

    if (insertError || !data) {
      setError("No se pudo guardar el enlace. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    setReferences((current) => [...current, data as ProjectReference]);
    setLink("");
    setLinkTitle("");
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    setError(null);
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Elige una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("La imagen debe pesar 8 MB o menos.");
      return;
    }

    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `${projectId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setUploading(false);
      setError("No se pudo subir la imagen. Inténtalo de nuevo.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("project_reference")
      .insert({
        project_id: projectId,
        kind: "image",
        title: file.name.replace(/\.[^.]+$/, ""),
        storage_path: storagePath,
      })
      .select("*")
      .single();

    if (insertError || !data) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      setUploading(false);
      setError("La imagen se subió, pero no se pudo asociar al proyecto.");
      return;
    }

    setReferences((current) => [...current, data as ProjectReference]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function deleteReference(reference: ProjectReference) {
    setError(null);
    setDeletingId(reference.id);
    const { error: deleteError } = await supabase
      .from("project_reference")
      .delete()
      .eq("id", reference.id);

    if (deleteError) {
      setDeletingId(null);
      setError("No se pudo eliminar el referente. Inténtalo de nuevo.");
      return;
    }

    setReferences((current) => current.filter((item) => item.id !== reference.id));
    setDeletingId(null);
    if (reference.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([reference.storage_path]);
      if (storageError) {
        setError("El referente se quitó del proyecto, pero no se pudo borrar su archivo almacenado.");
      }
    }
  }

  return (
    <section className="mb-7 border-b border-border/70 pb-6" aria-labelledby="project-references-title">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.16em] text-text-secondary">
            INSPIRACIÓN DEL PROYECTO
          </p>
          <h2 id="project-references-title" className="text-base font-semibold text-text-primary">
            Referentes
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Guarda enlaces e imágenes para tenerlos a mano mientras desarrollas el guion.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-xs text-text-secondary">
          Enlace
          <input
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void addLink();
              }
            }}
            placeholder="https://…"
            className="mt-1 min-h-10 w-full rounded-lg border border-border bg-base/60 px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <label className="min-w-0 flex-1 text-xs text-text-secondary">
          Nombre (opcional)
          <input
            type="text"
            value={linkTitle}
            onChange={(event) => setLinkTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void addLink();
              }
            }}
            placeholder="Ej. Referencia de color"
            className="mt-1 min-h-10 w-full rounded-lg border border-border bg-base/60 px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <button
          type="button"
          onClick={() => void addLink()}
          disabled={addingLink || !link.trim()}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-pressed disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {addingLink ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Añadir enlace
        </button>
      </div>

      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Subir captura o imagen de referencia"
          disabled={uploading}
          onChange={(event) => void uploadImage(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-text-primary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {uploading ? "Subiendo imagen…" : "Subir captura o imagen"}
          <span className="text-xs text-text-disabled">JPG, PNG o WebP · máx. 8 MB</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-status-missing">
          {error}
        </p>
      )}

      {references.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {references.map((reference) => (
            <li
              key={reference.id}
              className="group flex min-w-0 items-center gap-3 rounded-lg border border-border/70 bg-surface/40 p-2.5"
            >
              {reference.kind === "image" ? (
                <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md bg-surface-2">
                  {signedUrls[reference.id] ? (
                    <Image
                      src={signedUrls[reference.id]}
                      alt={reference.title}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-disabled">
                      <ImagePlus size={18} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-muted/50 text-accent-hover">
                  <Link2 size={17} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {reference.kind === "link" && reference.url ? (
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1 text-sm font-medium text-text-primary hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    <span className="truncate">{reference.title}</span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                ) : (
                  <p className="truncate text-sm font-medium text-text-primary">{reference.title}</p>
                )}
                <p className="truncate text-xs text-text-secondary">
                  {reference.kind === "link" ? reference.url : "Imagen de referencia"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void deleteReference(reference)}
                disabled={deletingId === reference.id}
                aria-label={`Quitar referente: ${reference.title}`}
                title="Quitar referente"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-disabled transition-colors hover:bg-status-missing/10 hover:text-status-missing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
              >
                {deletingId === reference.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 text-sm text-text-disabled">
          <Link2 size={15} />
          Todavía no has guardado referentes para este proyecto.
        </p>
      )}
    </section>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  ChevronDown,
  ImagePlus,
  Link2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ProjectReference } from "@/lib/types";
import { useConfirm } from "@/components/ui/useConfirm";

const BUCKET = "project-references";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProjectReferences({
  projectId,
  initialReferences,
}: {
  projectId: string;
  initialReferences: ProjectReference[];
}) {
  const [references, setReferences] = useState(initialReferences);
  const [expanded, setExpanded] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [link, setLink] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [addingLink, setAddingLink] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewReference, setPreviewReference] = useState<ProjectReference | null>(null);
  const { confirm, ConfirmModal } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCloseRef = useRef<HTMLButtonElement>(null);

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
      .catch((signedUrlError: unknown) => {
        if (active) {
          const detail = signedUrlError instanceof Error ? signedUrlError.message : String(signedUrlError);
          setError(`No se pudieron cargar algunas imágenes: ${detail}`);
        }
      });

    return () => {
      active = false;
    };
  }, [references]);

  useEffect(() => {
    if (!previewReference) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previewCloseRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPreviewReference(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewReference]);

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
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError("Elige una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError("La imagen debe pesar 2 MB o menos.");
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError("Tu sesión no está activa en el navegador. Cierra sesión, vuelve a entrar e inténtalo de nuevo.");
      return;
    }

    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `${authData.user.id}/${projectId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setUploading(false);
      setError(`No se pudo subir la imagen: ${uploadError.message}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      setError(`La imagen se subió, pero no se pudo asociar al proyecto: ${insertError?.message ?? "respuesta vacía"}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setReferences((current) => [...current, data as ProjectReference]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function deleteReference(reference: ProjectReference) {
    const confirmed = await confirm({
      title: `¿Quitar "${reference.title}" de los referentes?`,
      description: reference.kind === "image"
        ? "También se eliminará la imagen guardada. Esta acción no se puede deshacer."
        : "El enlace se quitará de este proyecto.",
      confirmLabel: "Quitar referente",
    });
    if (!confirmed) return;

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
    <section className="mb-7 border-b border-border/70 pb-6">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls="project-references-content"
        className="flex w-full items-center justify-between gap-3 rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <span>
          <span className="block text-sm font-semibold text-text-primary">Referentes</span>
          <span className="mt-1 block text-xs text-text-secondary">
            {references.length
              ? `${references.length} ${references.length === 1 ? "referente" : "referentes"} · Enlaces e imágenes del proyecto`
              : "Enlaces e imágenes que orientan este proyecto."}
          </span>
        </span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className={`shrink-0 text-text-secondary transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div id="project-references-content" hidden={!expanded}>
      <div className="mb-2 mt-4 grid grid-cols-2 items-end gap-2 sm:flex">
        <label className="col-span-2 min-w-0 text-xs text-text-secondary sm:col-span-1 sm:flex-[1.5]">
          Añadir referente web
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
            className="mt-1 min-h-9 w-full rounded-lg border border-border bg-base/60 px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <label className="col-span-2 min-w-0 text-xs text-text-secondary sm:col-span-1 sm:flex-1">
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
            className="mt-1 min-h-9 w-full rounded-lg border border-border bg-base/60 px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Subir captura o imagen de referencia"
          disabled={uploading}
          onChange={(event) => void uploadImage(event.target.files?.[0])}
        />
        <div className="col-span-2 flex shrink-0 items-center gap-2 sm:col-span-1 sm:pt-4">
          <button
            type="button"
            onClick={() => void addLink()}
            disabled={addingLink || !link.trim()}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-2.5 text-xs font-medium text-accent-ink transition-colors hover:bg-accent-pressed disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {addingLink ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Añadir enlace
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-text-primary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            {uploading ? "Subiendo…" : "Subir imagen"}
          </button>
        </div>
      </div>
      <p className="mb-3 text-[11px] text-text-disabled">JPG, PNG o WebP · máx. 2 MB por imagen</p>

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
                <button
                  type="button"
                  onClick={() => setPreviewReference(reference)}
                  disabled={!signedUrls[reference.id]}
                  aria-label={`Abrir imagen de referencia: ${reference.title}`}
                  title="Ver imagen en grande"
                  className="group/image relative h-14 w-16 shrink-0 overflow-hidden rounded-md bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-wait"
                >
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
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover/image:bg-black/35 group-hover/image:opacity-100 group-focus-visible/image:opacity-100">
                    <ImagePlus size={18} />
                  </span>
                </button>
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-status-missing/10 hover:text-status-missing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
              >
                {deletingId === reference.id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
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
      </div>
      {ConfirmModal}
      {previewReference && signedUrls[previewReference.id] && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setPreviewReference(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Imagen de referencia: ${previewReference.title}`}
            className="w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-surface shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="min-w-0 truncate text-sm font-medium text-text-primary">
                {previewReference.title}
              </p>
              <button
                ref={previewCloseRef}
                type="button"
                onClick={() => setPreviewReference(null)}
                aria-label="Cerrar imagen"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative h-[75vh] max-h-[calc(100dvh-6rem)] w-full bg-black/40">
              <Image
                src={signedUrls[previewReference.id]}
                alt={previewReference.title}
                fill
                unoptimized
                sizes="90vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

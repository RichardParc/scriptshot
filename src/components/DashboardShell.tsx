"use client";

import { useState } from "react";
import Image from "next/image";
import { Clapperboard, Plus, Sparkles } from "lucide-react";
import { NavDrawer } from "@/components/nav/NavDrawer";
import { SearchBar } from "@/components/nav/SearchBar";
import { FoldersView } from "@/components/FoldersView";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { NewProjectForm } from "@/components/NewProjectForm";
import type { Folder } from "@/lib/types";
import type { ProjectEntry, SortKey } from "@/lib/projectList";

export function DashboardShell({
  folders,
  projects,
  errorMessage,
}: {
  folders: Folder[];
  projects: ProjectEntry[];
  errorMessage: string | null;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [creating, setCreating] = useState(false);
  const hasProjects = projects.length > 0;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-28 pt-6 sm:pt-10">
      <header className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border pb-6">
        <NavDrawer />
        <h1 className="mr-auto">
          <Image
            src="/logo.png"
            alt="Scriptshot"
            width={616}
            height={139}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </h1>
        {hasProjects && (
          <div className="w-full sm:w-80">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              sort={sort}
              onSortChange={setSort}
            />
          </div>
        )}
      </header>

      {errorMessage && (
        <p className="rounded-md border border-status-missing/40 bg-surface p-4 text-base text-status-missing">
          No se pudieron cargar los proyectos: {errorMessage}
        </p>
      )}

      {!errorMessage && (
        <section className="mb-8 border-b border-border/70 px-1 pb-7 pt-3 sm:pb-8 sm:pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-accent-hover">
                <Sparkles size={13} />
                TU ESTUDIO CREATIVO
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                {hasProjects ? "Tus proyectos, listos para rodar." : "De una idea a un plan de rodaje."}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                Organiza guiones, escenas y oportunidades en un solo lugar.
              </p>
            </div>
            {hasProjects && (
              <p className="shrink-0 pb-1 font-mono text-xs tracking-wide text-text-secondary sm:text-right">
                {projects.length} {projects.length === 1 ? "proyecto" : "proyectos"}
              </p>
            )}
          </div>
        </section>
      )}

      {!errorMessage && !hasProjects && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center sm:py-20">
          <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent-muted/50 text-accent-hover">
            <Clapperboard size={25} />
          </div>
          <p className="text-lg font-medium text-text-primary">Tu próximo proyecto empieza aquí</p>
          <p className="max-w-sm text-sm leading-6 text-text-secondary">
            Crea un espacio para ordenar tu guion, planear escenas y preparar el rodaje.
          </p>
          <Button
            variant="primary"
            onClick={() => setCreating(true)}
            className="mt-1"
          >
            <Plus size={16} />
            Crea el primero
          </Button>
        </div>
      )}

      {!errorMessage && hasProjects && (
        <FoldersView
          folders={folders}
          projects={projects}
          query={query}
          sort={sort}
        />
      )}

      <button
        type="button"
        onClick={() => setCreating(true)}
        aria-label="Nuevo proyecto"
        aria-haspopup="dialog"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-accent text-accent-ink shadow-lg shadow-black/50 transition-colors hover:bg-accent-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:w-auto sm:px-6"
      >
        <Plus size={22} />
        <span className="hidden text-base font-medium sm:inline">
          Nuevo proyecto
        </span>
      </button>

      <BottomSheet
        open={creating}
        onClose={() => setCreating(false)}
        title="Nuevo proyecto"
      >
        <NewProjectForm onCancel={() => setCreating(false)} />
      </BottomSheet>
    </main>
  );
}

import Image from "next/image";
import { Plus, MapPin, Clapperboard, Sparkles, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FoldersView } from "@/components/FoldersView";
import { LinkButton } from "@/components/ui/Button";
import { computeProjectSummary } from "@/lib/status";
import type { Folder, Project, SceneStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProjectWithBlocks extends Project {
  story_block: {
    scene: { status: SceneStatus }[];
    voice_over: { recorded: boolean }[];
  }[];
}

export default async function DashboardPage() {
  const [{ data, error }, { data: foldersData }] = await Promise.all([
    supabase
      .from("project")
      .select("*, story_block(scene(status), voice_over(recorded))")
      .order("created_at", { ascending: false }),
    supabase.from("folder").select("*"),
  ]);

  const projects = (data ?? []) as unknown as ProjectWithBlocks[];
  const folders = (foldersData ?? []) as Folder[];
  const count = projects.length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>
            <Image
              src="/logo.png"
              alt="Scriptshot"
              width={616}
              height={139}
              priority
              className="h-8 w-auto sm:h-10"
            />
          </h1>
          <p className="mt-2 font-mono text-xs text-text-secondary">
            {count === 0
              ? "De la idea al rodaje"
              : `${count} ${count === 1 ? "proyecto" : "proyectos"}`}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
          <LinkButton href="/oportunidades" variant="secondary" className="justify-center sm:justify-start">
            <Sparkles size={16} />
            Oportunidades
          </LinkButton>
          <LinkButton href="/locaciones" variant="secondary" className="justify-center sm:justify-start">
            <MapPin size={16} />
            Locaciones
          </LinkButton>
          <LinkButton href="/configuracion" variant="secondary" className="justify-center sm:justify-start">
            <Settings size={16} />
            Configuración
          </LinkButton>
          <LinkButton href="/new" variant="primary" className="justify-center sm:justify-start">
            <Plus size={16} />
            Nuevo proyecto
          </LinkButton>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-status-missing/40 bg-surface p-4 text-base text-status-missing">
          No se pudieron cargar los proyectos: {error.message}
        </p>
      )}

      {!error && count === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
          <Clapperboard size={28} className="text-text-disabled" />
          <p className="text-base text-text-secondary">
            Todavía no tienes proyectos.
          </p>
          <LinkButton href="/new" variant="primary" className="mt-1">
            <Plus size={16} />
            Crea el primero
          </LinkButton>
        </div>
      )}

      {!error && count > 0 && (
        <FoldersView
          folders={folders}
          projects={projects.map((project) => ({
            project,
            summary: computeProjectSummary(project.story_block ?? []),
          }))}
        />
      )}
    </main>
  );
}

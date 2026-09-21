import { Plus, MapPin, Clapperboard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProjectCard } from "@/components/ProjectCard";
import { LinkButton } from "@/components/ui/Button";
import { computeProjectSummary } from "@/lib/status";
import type { Project, SceneStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProjectWithBlocks extends Project {
  story_block: {
    scene: { status: SceneStatus }[];
    voice_over: { recorded: boolean }[];
  }[];
}

export default async function DashboardPage() {
  const { data, error } = await supabase
    .from("project")
    .select("*, story_block(scene(status), voice_over(recorded))")
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as unknown as ProjectWithBlocks[];
  const count = projects.length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-accent/30 bg-accent-muted text-accent">
            <Clapperboard size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-text-primary">
              Scriptshot
            </h1>
            <p className="font-mono text-xs text-text-secondary">
              {count === 0
                ? "De la idea al rodaje"
                : `${count} ${count === 1 ? "proyecto" : "proyectos"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LinkButton href="/locaciones" variant="secondary">
            <MapPin size={16} />
            Locaciones
          </LinkButton>
          <LinkButton href="/new" variant="primary">
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              summary={computeProjectSummary(project.story_block ?? [])}
            />
          ))}
        </div>
      )}
    </main>
  );
}

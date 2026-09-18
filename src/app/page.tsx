import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProjectCard } from "@/components/ProjectCard";
import { LinkButton } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: projects, error } = await supabase
    .from("project")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-xl font-medium text-text-primary">Scriptshot</h1>
        <LinkButton href="/new" variant="primary">
          <Plus size={16} />
          Nuevo proyecto
        </LinkButton>
      </div>

      {error && (
        <p className="rounded-md border border-status-missing/40 bg-surface p-4 text-sm text-status-missing">
          No se pudieron cargar los proyectos: {error.message}
        </p>
      )}

      {!error && projects && projects.length === 0 && (
        <div className="rounded-lg border border-dashed border-border py-20 text-center">
          <p className="text-sm text-text-secondary">
            Todavía no tienes proyectos.
          </p>
          <LinkButton href="/new" variant="primary" className="mt-4">
            <Plus size={16} />
            Crea el primero
          </LinkButton>
        </div>
      )}

      {!error && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  );
}

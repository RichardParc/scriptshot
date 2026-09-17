import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ProjectCard } from "@/components/ProjectCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: projects, error } = await supabase
    .from("project")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-xl font-medium text-text-primary">Scriptshot</h1>
        <Link
          href="/new"
          className="rounded-sm border border-accent bg-accent-muted px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-base"
        >
          + Nuevo proyecto
        </Link>
      </div>

      {error && (
        <p className="rounded-sm border border-status-missing/40 bg-surface p-4 text-sm text-status-missing">
          No se pudieron cargar los proyectos: {error.message}
        </p>
      )}

      {!error && projects && projects.length === 0 && (
        <div className="rounded-md border border-dashed border-border py-16 text-center">
          <p className="text-sm text-text-secondary">
            Todavía no tienes proyectos.
          </p>
          <Link
            href="/new"
            className="mt-3 inline-block text-sm text-accent hover:text-accent-hover"
          >
            Crea el primero →
          </Link>
        </div>
      )}

      {!error && projects && projects.length > 0 && (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  );
}

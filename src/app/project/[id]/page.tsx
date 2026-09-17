import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: project, error } = await supabase
    .from("project")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !project) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-text-secondary hover:text-text-primary"
      >
        ← Todos los proyectos
      </Link>

      <div className="mb-2 flex items-center gap-3">
        <h1 className="text-xl font-medium text-text-primary">
          {project.name}
        </h1>
        <StatusBadge status={project.status} />
      </div>

      <div className="mb-8 flex items-center gap-2 font-mono text-xs text-text-secondary">
        <span>{project.format}</span>
        <span className="text-border-strong">·</span>
        <span>{project.duration}</span>
      </div>

      {project.idea && (
        <p className="mb-10 max-w-xl text-sm leading-relaxed text-text-secondary">
          {project.idea}
        </p>
      )}

      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-text-secondary">
        Historia, voz en off y escenas llegan en la Fase 2.
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";
import { Clapperboard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteProjectButton } from "@/components/DeleteProjectButton";
import { ProjectEditor } from "@/components/editor/ProjectEditor";
import { BackLink } from "@/components/ui/BackLink";
import { LinkButton } from "@/components/ui/Button";
import type { StoryBlock } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: project, error } = await supabase
    .from("project")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  const { data: blocks } = await supabase
    .from("story_block")
    .select("*, voice_over(*), scene(*)")
    .eq("project_id", id)
    .order("order", { ascending: true })
    .order("order", { ascending: true, referencedTable: "voice_over" })
    .order("order", { ascending: true, referencedTable: "scene" });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <BackLink href="/" label="Todos los proyectos" />
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </div>

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
        <p className="mb-6 max-w-xl text-sm leading-relaxed text-text-secondary">
          {project.idea}
        </p>
      )}

      <LinkButton
        href={`/project/${project.id}/rodaje`}
        variant="primary"
        className="mb-10"
      >
        <Clapperboard size={16} />
        Ir a RODAJE
      </LinkButton>

      <ProjectEditor
        projectId={project.id}
        initialBlocks={(blocks ?? []) as StoryBlock[]}
      />
    </main>
  );
}

import { notFound } from "next/navigation";
import { Clapperboard } from "lucide-react";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { DeleteProjectButton } from "@/components/DeleteProjectButton";
import { ProjectEditor } from "@/components/editor/ProjectEditor";
import { ProjectHeader } from "@/components/ProjectHeader";
import { BackLink } from "@/components/ui/BackLink";
import { LinkButton } from "@/components/ui/Button";
import { computeProjectSummary } from "@/lib/status";
import type { StoryBlock } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("project")
    .select("name")
    .eq("id", id)
    .single();
  return { title: data ? `${data.name} — Scriptshot` : "Scriptshot" };
}

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
    .select("*, voice_over(*), scene(*, location(id, name))")
    .eq("project_id", id)
    .order("order", { ascending: true })
    .order("order", { ascending: true, referencedTable: "voice_over" })
    .order("order", { ascending: true, referencedTable: "scene" });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <BackLink href="/" label="Todos los proyectos" />
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </div>

      <ProjectHeader
        initialProject={project}
        summary={computeProjectSummary((blocks ?? []) as StoryBlock[])}
      />

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

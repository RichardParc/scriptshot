import { notFound } from "next/navigation";
import { Sparkles, Plus } from "lucide-react";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { DeleteProjectButton } from "@/components/DeleteProjectButton";
import { PrintProjectButton } from "@/components/PrintProjectButton";
import { ProjectEditor } from "@/components/editor/ProjectEditor";
import { ProjectBackup } from "@/components/editor/ProjectBackup";
import { ProjectHeader } from "@/components/ProjectHeader";
import { OpportunityShotCard } from "@/components/OpportunityShotCard";
import { BackLink } from "@/components/ui/BackLink";
import { LinkButton } from "@/components/ui/Button";
import { computeProjectSummary } from "@/lib/status";
import type { OpportunityShot, PresetOption, Project, ProjectReference, ScenePresets, StoryBlock } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
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
  const supabase = await createServerSupabaseClient();
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

  const { data: projectReferences } = await supabase
    .from("project_reference")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  const { data: presetRows } = await supabase
    .from("preset_option")
    .select("category, label, order")
    .in("category", [
      "camera_type",
      "camera_angle",
      "camera_movement",
      "scene_requirement",
    ])
    .order("order", { ascending: true });

  const labelsFor = (category: string) =>
    ((presetRows ?? []) as Pick<PresetOption, "category" | "label" | "order">[])
      .filter((r) => r.category === category)
      .map((r) => r.label);

  const presets: ScenePresets = {
    cameraTypes: labelsFor("camera_type"),
    cameraAngles: labelsFor("camera_angle"),
    cameraMovements: labelsFor("camera_movement"),
    sceneRequirements: labelsFor("scene_requirement"),
  };

  const { data: opportunityShots } = await supabase
    .from("opportunity_shot")
    .select("*, location(id, name)")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <BackLink href="/" label="Todos los proyectos" />
        <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <PrintProjectButton href={`/project/${project.id}/imprimir`} />
          <ProjectBackup
            project={project as Project}
            blocks={(blocks ?? []) as StoryBlock[]}
            references={(projectReferences ?? []) as ProjectReference[]}
          />
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
        </div>
      </div>

      <ProjectHeader
        initialProject={project}
        summary={computeProjectSummary((blocks ?? []) as StoryBlock[])}
      />

      <ProjectEditor
        projectId={project.id}
        initialBlocks={(blocks ?? []) as StoryBlock[]}
        presets={presets}
        initialReferences={(projectReferences ?? []) as ProjectReference[]}
      />

      <section className="mt-10 border-t border-border pt-7 sm:pt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 font-mono text-[10px] tracking-[0.16em] text-text-secondary">IDEAS PARA ESTE PROYECTO</p>
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-text-primary">
              <Sparkles size={17} className="text-accent-hover" />
              Tomas de oportunidad
            </h2>
          </div>
          <LinkButton
            href={`/oportunidades/new?project=${project.id}`}
            variant="ghost"
            size="sm"
          >
            <Plus size={14} />
            Agregar
          </LinkButton>
        </div>

        {opportunityShots && opportunityShots.length > 0 ? (
          <div className="flex flex-col gap-3">
            {(opportunityShots as unknown as OpportunityShot[]).map((shot) => (
              <OpportunityShotCard key={shot.id} shot={shot} showProject={false} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-surface/40 px-4 py-6 text-sm text-text-secondary">
            Sin tomas de oportunidad asociadas todavía. Guarda ideas de tomas para tenerlas a mano durante la producción.
          </p>
        )}
      </section>
    </main>
  );
}

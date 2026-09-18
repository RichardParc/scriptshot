import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RodajeMode } from "@/components/rodaje/RodajeMode";
import type { FlatScene, Scene, StoryBlock } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RodajePage({
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
    .select("*, scene(*)")
    .eq("project_id", id)
    .order("order", { ascending: true })
    .order("order", { ascending: true, referencedTable: "scene" });

  const typedBlocks = (blocks ?? []) as (StoryBlock & { scene: Scene[] })[];

  const flatScenes: FlatScene[] = typedBlocks.flatMap((block) =>
    [...block.scene]
      .sort((a, b) => a.order - b.order)
      .map((scene) => ({ ...scene, blockTitle: block.title }))
  );

  return (
    <RodajeMode
      projectId={project.id}
      projectName={project.name}
      initialScenes={flatScenes}
    />
  );
}

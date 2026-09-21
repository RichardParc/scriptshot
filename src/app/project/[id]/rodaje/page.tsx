import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { RodajeMode } from "@/components/rodaje/RodajeMode";
import type { FlatScene, Scene, StoryBlock } from "@/lib/types";

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
  return {
    title: data ? `RODAJE · ${data.name} — Scriptshot` : "Scriptshot",
  };
}

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
    .select("*, scene(*, location(id, name))")
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
      backHref={`/project/${project.id}`}
      backLabel={project.name}
      initialScenes={flatScenes}
    />
  );
}

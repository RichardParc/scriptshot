import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { RodajeMode } from "@/components/rodaje/RodajeMode";
import type { FlatScene, Scene } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const { id } = await params;
  const { data } = await supabase
    .from("location")
    .select("name")
    .eq("id", id)
    .single();
  return {
    title: data ? `RODAJE · ${data.name} — Scriptshot` : "Scriptshot",
  };
}

interface SceneWithContext extends Scene {
  story_block: {
    title: string;
    order: number;
    voice_over: { id: string; text: string; recorded: boolean }[];
    project: { id: string; name: string } | null;
  } | null;
}

export default async function LocationRodajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const { data: location, error } = await supabase
    .from("location")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !location) {
    notFound();
  }

  const { data } = await supabase
    .from("scene")
    .select("*, story_block(title, order, voice_over(*), project(id, name))")
    .eq("location_id", id);

  const rows = (data ?? []) as unknown as SceneWithContext[];

  const flatScenes: FlatScene[] = rows
    .map((row) => ({
      ...row,
      blockTitle: row.story_block?.title ?? "",
      projectId: row.story_block?.project?.id ?? undefined,
      projectName: row.story_block?.project?.name ?? "",
      voiceOver:
        row.story_block?.voice_over.find(
          (voiceOver) => voiceOver.id === row.voice_over_id
        ) ?? null,
    }))
    .sort((a, b) => {
      const projectCmp = (a.projectName ?? "").localeCompare(
        b.projectName ?? ""
      );
      if (projectCmp !== 0) return projectCmp;
      const blockCmp = (a.story_block?.order ?? 0) - (b.story_block?.order ?? 0);
      if (blockCmp !== 0) return blockCmp;
      return a.order - b.order;
    });

  return (
    <RodajeMode
      backHref="/locaciones"
      backLabel={location.name}
      initialScenes={flatScenes}
    />
  );
}

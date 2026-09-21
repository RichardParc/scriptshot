import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { RodajeMode } from "@/components/rodaje/RodajeMode";
import type { FlatScene, Scene } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
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
    project: { id: string; name: string } | null;
  } | null;
}

export default async function LocationRodajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    .select("*, story_block(title, order, project(id, name))")
    .eq("location_id", id);

  const rows = (data ?? []) as unknown as SceneWithContext[];

  const flatScenes: FlatScene[] = rows
    .map((row) => ({
      ...row,
      blockTitle: row.story_block?.title ?? "",
      projectName: row.story_block?.project?.name ?? "",
    }))
    .sort((a, b) => {
      const projectCmp = (a.projectName ?? "").localeCompare(
        b.projectName ?? ""
      );
      if (projectCmp !== 0) return projectCmp;
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

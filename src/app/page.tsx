import { supabase } from "@/lib/supabase";
import { DashboardShell } from "@/components/DashboardShell";
import { computeProjectSummary } from "@/lib/status";
import type { ProjectEntry } from "@/lib/projectList";
import type { Folder, Project, SceneStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProjectWithBlocks extends Project {
  story_block: {
    scene: { status: SceneStatus }[];
    voice_over: { recorded: boolean }[];
  }[];
}

export default async function DashboardPage() {
  const [{ data, error }, { data: foldersData }] = await Promise.all([
    supabase
      .from("project")
      .select("*, story_block(scene(status), voice_over(recorded))")
      .order("created_at", { ascending: false }),
    supabase.from("folder").select("*"),
  ]);

  const rows = (data ?? []) as unknown as ProjectWithBlocks[];
  const folders = (foldersData ?? []) as Folder[];

  // Don't ship the nested scene/voice-over rows to the browser, only the
  // computed summary.
  const projects: ProjectEntry[] = rows.map(({ story_block, ...project }) => ({
    project,
    summary: computeProjectSummary(story_block ?? []),
  }));

  return (
    <DashboardShell
      folders={folders}
      projects={projects}
      errorMessage={error ? error.message : null}
    />
  );
}

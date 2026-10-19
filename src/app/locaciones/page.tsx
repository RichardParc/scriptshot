import Link from "next/link";
import { MapPin, Clapperboard } from "lucide-react";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { SectionBar } from "@/components/nav/SectionBar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Locaciones — Scriptshot" };

interface PendingSceneRow {
  status: string;
  location: { id: string; name: string } | null;
  story_block: { project: { id: string; name: string } | null } | null;
}

export default async function LocationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("scene")
    .select("status, location(id, name), story_block(project(id, name))")
    .neq("status", "grabada")
    .not("location_id", "is", null);

  const rows = (data ?? []) as unknown as PendingSceneRow[];

  const byLocation = new Map<
    string,
    { name: string; projectIds: Set<string>; pending: number }
  >();

  for (const row of rows) {
    if (!row.location) continue;
    const projectId = row.story_block?.project?.id;
    const entry = byLocation.get(row.location.id) ?? {
      name: row.location.name,
      projectIds: new Set<string>(),
      pending: 0,
    };
    entry.pending += 1;
    if (projectId) entry.projectIds.add(projectId);
    byLocation.set(row.location.id, entry);
  }

  const locations = [...byLocation.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.pending - a.pending);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <SectionBar />

      <h1 className="mb-8 mt-6 text-2xl font-medium text-text-primary">
        Locaciones
      </h1>

      {error && (
        <p className="rounded-md border border-status-missing/40 bg-surface p-4 text-base text-status-missing">
          No se pudieron cargar las locaciones: {error.message}
        </p>
      )}

      {!error && locations.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <p className="max-w-md text-base leading-relaxed text-text-secondary">
            Todavía no hay tomas pendientes con locación. Asigna una locación en
            los detalles de una escena y aparecerá aquí.
          </p>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface-2 px-5 py-3 text-base text-text-primary transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Ir a proyectos
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {locations.map((loc) => (
          <Link
            key={loc.id}
            href={`/locaciones/${loc.id}`}
            className="flex items-center justify-between rounded-md border border-border bg-surface p-6 transition-colors hover:border-border-strong"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <MapPin size={15} className="shrink-0 text-accent-hover" />
                <span className="truncate text-lg font-medium text-text-primary">
                  {loc.name}
                </span>
              </div>
              <p className="truncate font-mono text-xs text-text-secondary">
                {loc.projectIds.size}{" "}
                {loc.projectIds.size === 1 ? "proyecto" : "proyectos"} ·{" "}
                {loc.pending} {loc.pending === 1 ? "toma pendiente" : "tomas pendientes"}
              </p>
            </div>
            <Clapperboard size={18} className="ml-3 shrink-0 text-text-secondary" />
          </Link>
        ))}
      </div>
    </main>
  );
}

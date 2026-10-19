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
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
      <SectionBar />

      <section className="relative mb-7 mt-7 overflow-hidden border-b border-border/70 px-1 pb-7 sm:pb-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-accent-hover">
              <MapPin size={12} /> PLAN DE RODAJE
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">Locaciones</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              Revisa dónde se concentran las escenas pendientes y qué proyectos las necesitan.
            </p>
          </div>
          <p className="shrink-0 pb-1 font-mono text-xs tracking-wide text-white/50 sm:text-right">
            {locations.length} {locations.length === 1 ? "locación" : "locaciones"}
          </p>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-status-missing/40 bg-surface p-4 text-base text-status-missing">
          No se pudieron cargar las locaciones: {error.message}
        </p>
      )}

      {!error && locations.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent-muted/50 text-accent-hover">
            <MapPin size={24} />
          </div>
          <p className="text-lg font-medium text-text-primary">Aún no hay locaciones por revisar</p>
          <p className="max-w-md text-sm leading-6 text-text-secondary">
            Todavía no hay tomas pendientes con locación. Asigna una locación en
            los detalles de una escena y aparecerá aquí.
          </p>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface-2 px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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
            className="group flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg hover:shadow-black/20 sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <MapPin size={15} className="shrink-0 text-accent-hover transition-transform group-hover:-translate-y-0.5" />
                <span className="truncate text-lg font-medium text-text-primary">
                  {loc.name}
                </span>
              </div>
              <p className="truncate font-mono text-[10px] tracking-wide text-text-secondary sm:text-xs">
                {loc.projectIds.size}{" "}
                {loc.projectIds.size === 1 ? "proyecto" : "proyectos"} ·{" "}
                {loc.pending} {loc.pending === 1 ? "toma pendiente" : "tomas pendientes"}
              </p>
            </div>
            <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-base/60 text-text-secondary transition-colors group-hover:border-accent/30 group-hover:text-accent-hover">
              <Clapperboard size={17} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

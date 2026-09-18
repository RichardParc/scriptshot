import Link from "next/link";
import { MapPin, Clapperboard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BackLink } from "@/components/ui/BackLink";

export const dynamic = "force-dynamic";

interface PendingSceneRow {
  status: string;
  location: { id: string; name: string } | null;
  story_block: { project: { id: string; name: string } | null } | null;
}

export default async function LocationsPage() {
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
      <BackLink href="/" label="Todos los proyectos" />

      <h1 className="mb-8 mt-6 text-xl font-medium text-text-primary">
        Locaciones
      </h1>

      {error && (
        <p className="rounded-md border border-status-missing/40 bg-surface p-4 text-sm text-status-missing">
          No se pudieron cargar las locaciones: {error.message}
        </p>
      )}

      {!error && locations.length === 0 && (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-text-secondary">
          No hay tomas pendientes con locación asignada todavía.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {locations.map((loc) => (
          <Link
            key={loc.id}
            href={`/locaciones/${loc.id}`}
            className="flex items-center justify-between rounded-md border border-border bg-surface p-5 transition-colors hover:border-border-strong"
          >
            <div>
              <div className="mb-1 flex items-center gap-2">
                <MapPin size={15} className="text-accent" />
                <span className="text-base font-medium text-text-primary">
                  {loc.name}
                </span>
              </div>
              <p className="font-mono text-[11px] text-text-secondary">
                {loc.projectIds.size}{" "}
                {loc.projectIds.size === 1 ? "proyecto" : "proyectos"} ·{" "}
                {loc.pending} {loc.pending === 1 ? "toma pendiente" : "tomas pendientes"}
              </p>
            </div>
            <Clapperboard size={18} className="text-text-secondary" />
          </Link>
        ))}
      </div>
    </main>
  );
}

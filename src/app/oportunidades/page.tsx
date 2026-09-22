import Link from "next/link";
import { Sparkles, Plus, MapPin, Link as LinkIcon } from "lucide-react";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { BackLink } from "@/components/ui/BackLink";
import { LinkButton } from "@/components/ui/Button";
import type { OpportunityShot } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Oportunidades — Scriptshot" };

export default async function OpportunitiesPage() {
  const { data, error } = await supabase
    .from("opportunity_shot")
    .select("*, location(id, name), project(id, name)")
    .order("created_at", { ascending: false });

  const shots = (data ?? []) as unknown as OpportunityShot[];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackLink href="/" label="Todos los proyectos" />
        <LinkButton href="/oportunidades/new" variant="primary">
          <Plus size={16} />
          Nueva toma de oportunidad
        </LinkButton>
      </div>

      <h1 className="mb-8 flex items-center gap-2 text-2xl font-medium text-text-primary">
        <Sparkles size={22} className="text-accent" />
        Oportunidades
      </h1>

      {error && (
        <p className="rounded-md border border-status-missing/40 bg-surface p-4 text-base text-status-missing">
          No se pudieron cargar: {error.message}
        </p>
      )}

      {!error && shots.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
          <Sparkles size={26} className="text-text-disabled" />
          <p className="text-base text-text-secondary">
            Sin tomas de oportunidad todavía.
          </p>
          <LinkButton href="/oportunidades/new" variant="primary" className="mt-1">
            <Plus size={16} />
            Agrega la primera
          </LinkButton>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {shots.map((shot) => (
          <div
            key={shot.id}
            className="rounded-md border border-border bg-surface p-5"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {shot.type && (
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-text-secondary">
                  {shot.type}
                </span>
              )}
              {shot.location && (
                <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 font-mono text-xs text-text-secondary">
                  <MapPin size={11} />
                  {shot.location.name}
                </span>
              )}
              {shot.project && (
                <Link
                  href={`/project/${shot.project.id}`}
                  className="rounded-full border border-accent/40 bg-accent-muted px-2 py-0.5 font-mono text-xs text-accent hover:border-accent"
                >
                  {shot.project.name}
                </Link>
              )}
            </div>

            <p className="mb-2 text-base text-text-primary">
              {shot.description || "Sin descripción."}
            </p>

            {shot.reference && (
              <a
                href={shot.reference}
                target="_blank"
                rel="noreferrer"
                className="mb-2 flex items-center gap-1.5 text-sm text-accent-hover hover:text-accent"
              >
                <LinkIcon size={13} />
                Ver referencia
              </a>
            )}

            {shot.notes && (
              <p className="text-sm text-text-secondary">{shot.notes}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

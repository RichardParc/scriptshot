import { Sparkles, Plus } from "lucide-react";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { BackLink } from "@/components/ui/BackLink";
import { LinkButton } from "@/components/ui/Button";
import { OpportunityShotCard } from "@/components/OpportunityShotCard";
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
          <OpportunityShotCard key={shot.id} shot={shot} />
        ))}
      </div>
    </main>
  );
}

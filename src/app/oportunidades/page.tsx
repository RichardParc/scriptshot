import { Sparkles, Plus } from "lucide-react";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { SectionBar } from "@/components/nav/SectionBar";
import { LinkButton } from "@/components/ui/Button";
import { OpportunityShotCard } from "@/components/OpportunityShotCard";
import type { OpportunityShot } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Oportunidades — Scriptshot" };

export default async function OpportunitiesPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("opportunity_shot")
    .select("*, location(id, name), project(id, name)")
    .order("created_at", { ascending: false });

  const shots = (data ?? []) as unknown as OpportunityShot[];

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionBar />
        <LinkButton href="/oportunidades/new" variant="primary">
          <Plus size={16} />
          Nueva toma de oportunidad
        </LinkButton>
      </div>

      <section className="relative mb-7 overflow-hidden border-b border-border/70 px-1 pb-7 sm:pb-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-accent-hover">
              <Sparkles size={12} /> CAPTURA EL MOMENTO
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">Oportunidades</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              Guarda ideas espontáneas de tomas y referencias para incorporarlas a tus proyectos.
            </p>
          </div>
          <p className="shrink-0 pb-1 font-mono text-xs tracking-wide text-white/50 sm:text-right">
            {shots.length} {shots.length === 1 ? "toma guardada" : "tomas guardadas"}
          </p>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-status-missing/40 bg-surface p-4 text-base text-status-missing">
          No se pudieron cargar: {error.message}
        </p>
      )}

      {!error && shots.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent-muted/50 text-accent-hover">
            <Sparkles size={24} />
          </div>
          <p className="text-lg font-medium text-text-primary">Las buenas ideas aparecen de repente</p>
          <p className="max-w-sm text-sm leading-6 text-text-secondary">
            Guarda aquí una toma, una referencia o una imagen que quieras recordar para después.
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

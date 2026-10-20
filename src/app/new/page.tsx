"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Sparkles } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";
import { NewProjectForm } from "@/components/NewProjectForm";

export default function NewProjectPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Nuevo proyecto — Scriptshot";
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-12">
      <BackLink href="/" label="Todos los proyectos" />

      <section className="mb-6 mt-6 border-b border-border/70 px-1 pb-6 sm:pb-7">
        <div className="flex items-start gap-4">
          <div className="hidden shrink-0 pt-1 text-accent-hover sm:flex">
            <Clapperboard size={22} />
          </div>
          <div>
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-accent-hover sm:hidden">
              <Sparkles size={12} /> NUEVA PRODUCCIÓN
            </div>
            <p className="mb-2 hidden font-mono text-[10px] tracking-[0.16em] text-accent-hover sm:block">NUEVA PRODUCCIÓN</p>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">Crea un proyecto</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary sm:text-base">
              Define la idea y el formato. Luego podrás desarrollar el guion y preparar las escenas.
            </p>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <NewProjectForm onCancel={() => router.push("/")} />
      </div>
    </main>
  );
}

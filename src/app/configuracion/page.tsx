import type { Metadata } from "next";
import { SectionBar } from "@/components/nav/SectionBar";
import { PresetCategoryEditor } from "@/components/settings/PresetCategoryEditor";
import { SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = { title: "Configuración — Scriptshot" };

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
      <SectionBar />

      <section className="relative mb-7 mt-7 overflow-hidden border-b border-border/70 px-1 pb-7 sm:pb-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="hidden shrink-0 pt-1 text-accent-hover sm:flex">
            <SlidersHorizontal size={21} />
          </div>
          <div>
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-accent-hover sm:hidden">
              <SlidersHorizontal size={12} /> PREFERENCIAS DE PRODUCCIÓN
            </div>
            <p className="mb-2 hidden font-mono text-[10px] tracking-[0.16em] text-accent-hover sm:block">PREFERENCIAS DE PRODUCCIÓN</p>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">Configuración</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Personaliza las opciones que aparecen al planear escenas y guardar tomas de oportunidad.
            </p>
          </div>
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[10px] tracking-[0.16em] text-text-secondary">LISTAS PERSONALIZABLES</h2>
        <span className="font-mono text-[10px] text-text-disabled">5 CATEGORÍAS</span>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        <PresetCategoryEditor category="camera_type" title="Tipo de plano" />
        <PresetCategoryEditor category="camera_angle" title="Ángulo" />
        <PresetCategoryEditor category="camera_movement" title="Movimiento" />
        <PresetCategoryEditor
          category="scene_requirement"
          title="Necesidades de producción"
          hint="Equipo o condiciones que una escena puede requerir."
        />
        <PresetCategoryEditor
          category="opportunity_type"
          title="Tipos de toma de oportunidad"
        />
      </div>
    </main>
  );
}

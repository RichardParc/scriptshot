import type { Metadata } from "next";
import { SectionBar } from "@/components/nav/SectionBar";
import { PresetCategoryEditor } from "@/components/settings/PresetCategoryEditor";

export const metadata: Metadata = { title: "Configuración — Scriptshot" };

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <SectionBar />

      <h1 className="mb-2 mt-6 text-2xl font-medium text-text-primary">
        Configuración
      </h1>
      <p className="mb-8 text-base text-text-secondary">
        Las opciones que aparecen en los selectores de escenas y tomas de
        oportunidad. Agrega, renombra o quita lo que necesites.
      </p>

      <div className="flex flex-col gap-4">
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

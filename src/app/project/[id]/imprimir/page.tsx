import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { PrintProjectButton } from "@/components/PrintProjectButton";
import type { StoryBlock } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("project").select("name").eq("id", id).single();
  return { title: data ? `Guion · ${data.name} — Scriptshot` : "Guion — Scriptshot" };
}

export default async function PrintableProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const [{ data: project }, { data: blocks }] = await Promise.all([
    supabase.from("project").select("*").eq("id", id).single(),
    supabase
      .from("story_block")
      .select("*, voice_over(*), scene(*, location(name))")
      .eq("project_id", id)
      .order("order", { ascending: true })
      .order("order", { ascending: true, referencedTable: "voice_over" })
      .order("order", { ascending: true, referencedTable: "scene" }),
  ]);

  if (!project) notFound();

  const sortedBlocks = ((blocks ?? []) as StoryBlock[]).map((block) => ({
    ...block,
    voice_over: [...(block.voice_over ?? [])].sort((a, b) => a.order - b.order),
    scene: [...(block.scene ?? [])].sort((a, b) => a.order - b.order),
  }));
  const sceneNumbers = new Map<string, string>();
  let sceneNumber = 0;
  for (const block of sortedBlocks) {
    for (const scene of block.scene) {
      sceneNumber += 1;
      sceneNumbers.set(scene.id, String(sceneNumber).padStart(2, "0"));
    }
  }

  return (
    <main className="print-page min-h-screen bg-white text-neutral-950">
      <div className="print-toolbar mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
        <a
          href={`/project/${id}`}
          className="text-sm font-medium text-neutral-600 underline-offset-4 hover:text-neutral-950 hover:underline"
        >
          Volver al proyecto
        </a>
        <PrintProjectButton />
      </div>

      <article className="print-document mx-auto max-w-5xl px-5 pb-12 sm:px-10">
        <header className="print-cover mb-5 border-b-2 border-neutral-900 pb-3">
          <h1 className="print-project-title text-2xl font-bold leading-tight tracking-tight">{project.name}</h1>
        </header>

        {sortedBlocks.length ? (
          <div className="print-blocks">
            {sortedBlocks.map((block, blockIndex) => (
              <section className="print-block" key={block.id}>
                <h2 className="print-block-heading mb-3 border-b-2 border-neutral-900 pb-2">
                  <span className="mb-0.5 block font-mono text-[8pt] font-bold tracking-[0.12em] text-neutral-600">
                    BLOQUE {String(blockIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="block text-[14pt] font-bold leading-tight">{block.title}</span>
                </h2>

                <div className="print-columns grid grid-cols-2 gap-5">
                  <div className="min-w-0">
                    <h3 className="print-column-heading mb-2 text-[8pt] font-bold uppercase tracking-[0.14em] text-neutral-600">
                      Escenas
                    </h3>
                    {block.scene.length ? (
                      <ol className="space-y-3">
                        {block.scene.map((scene) => (
                          <li className="print-scene flex gap-2.5" key={scene.id}>
                            <span className="print-checkbox mt-0.5" aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                              <p className="mb-1 font-mono text-[8pt] font-semibold text-neutral-500">
                                TOMA {sceneNumbers.get(scene.id)}
                              </p>
                              <p className="whitespace-pre-wrap text-[10pt] font-medium leading-snug">
                                {scene.description || "Descripción pendiente"}
                              </p>
                              <div className="mt-1.5 space-y-0.5 text-[8.5pt] leading-snug text-neutral-700">
                                {scene.location?.name && <p><b>Locación:</b> {scene.location.name}</p>}
                                {scene.camera && <p><b>Plano:</b> {scene.camera}</p>}
                                {scene.angle && <p><b>Ángulo:</b> {scene.angle}</p>}
                                {scene.movement && <p><b>Movimiento:</b> {scene.movement}</p>}
                                {!!scene.requirements?.length && <p><b>Necesitas:</b> {scene.requirements.join(", ")}</p>}
                                {scene.notes && <p className="whitespace-pre-wrap"><b>Notas:</b> {scene.notes}</p>}
                                {scene.post_production && (
                                  <p className="whitespace-pre-wrap"><b>Post:</b> {scene.post_production_notes || "Requiere postproducción"}</p>
                                )}
                                {scene.reference && <p className="break-all"><b>Referencia:</b> {scene.reference}</p>}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-[9pt] italic text-neutral-500">Sin escenas en este bloque.</p>
                    )}
                  </div>

                  <div className="print-voiceovers min-w-0 border-l border-neutral-300 pl-4">
                    <h3 className="print-column-heading mb-2 text-[8pt] font-bold uppercase tracking-[0.14em] text-neutral-600">
                      Voz en off
                    </h3>
                    {block.voice_over.length ? (
                      <ol className="space-y-3">
                        {block.voice_over.map((voiceOver, voiceIndex) => (
                          <li className="print-voiceover flex gap-2.5" key={voiceOver.id}>
                            <span className="print-checkbox mt-0.5" aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                              <p className="mb-1 font-mono text-[8pt] font-semibold text-neutral-500">
                                VOZ {String(voiceIndex + 1).padStart(2, "0")}
                              </p>
                              {block.scene.some((scene) => scene.voice_over_id === voiceOver.id) && (
                                <p className="mb-1 font-mono text-[7.5pt] font-semibold text-neutral-600">
                                  TOMAS {block.scene
                                    .filter((scene) => scene.voice_over_id === voiceOver.id)
                                    .map((scene) => sceneNumbers.get(scene.id))
                                    .join(", ")}
                                </p>
                              )}
                              <p className="whitespace-pre-wrap text-[10pt] leading-relaxed">
                                {voiceOver.text || "Texto pendiente"}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-[9pt] italic text-neutral-500">Sin voz en off en este bloque.</p>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-600">Este proyecto aún no tiene bloques para imprimir.</p>
        )}
      </article>
    </main>
  );
}

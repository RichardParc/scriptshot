import { supabase } from "./supabase";
import type { PresetCategory } from "./types";

export async function fetchPresetLabels(
  category: PresetCategory
): Promise<string[]> {
  const { data } = await supabase
    .from("preset_option")
    .select("label")
    .eq("category", category)
    .order("order", { ascending: true });
  return (data ?? []).map((d) => d.label as string);
}

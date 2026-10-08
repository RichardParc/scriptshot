/**
 * Shared look for text inputs and textareas, so every form field in the app
 * has the same stronger outline and rounded shape.
 *
 * - "md": standalone form fields (new project, edit project, opportunities…)
 * - "sm": compact fields inside cards (scene details, location picker…)
 */
export function fieldClass(size: "md" | "sm" = "md", extra = ""): string {
  const base =
    "w-full border border-border-strong text-text-primary placeholder:text-text-disabled transition-colors hover:border-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  const sizes = {
    md: "rounded-xl bg-surface-2 px-4 py-3 text-base",
    sm: "rounded-lg bg-surface px-3 py-1.5 text-sm",
  };
  return `${base} ${sizes[size]}${extra ? ` ${extra}` : ""}`;
}

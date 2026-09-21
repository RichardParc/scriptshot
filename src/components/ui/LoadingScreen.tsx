import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3">
      <Loader2 size={22} className="animate-spin text-accent" />
      <p className="text-sm text-text-secondary">Cargando…</p>
    </main>
  );
}

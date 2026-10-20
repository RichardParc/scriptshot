"use client";

import { Printer } from "lucide-react";
import Link from "next/link";

export function PrintProjectButton({ href }: { href?: string }) {
  const className = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  if (href) {
    return (
      <Link href={href} className={className}>
        <Printer size={15} aria-hidden="true" />
        Imprimir guion
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
    >
      <Printer size={15} aria-hidden="true" />
      Imprimir guion
    </button>
  );
}

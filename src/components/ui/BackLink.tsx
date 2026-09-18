import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
    >
      <ChevronLeft size={16} />
      {label}
    </Link>
  );
}

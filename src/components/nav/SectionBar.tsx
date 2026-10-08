import Image from "next/image";
import Link from "next/link";
import { NavDrawer } from "./NavDrawer";

/** Menu button + logo, used at the top of the main sections. */
export function SectionBar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <NavDrawer />
      <Link
        href="/"
        className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Image
          src="/logo.png"
          alt="Scriptshot"
          width={616}
          height={139}
          className="h-7 w-auto"
        />
      </Link>
    </div>
  );
}

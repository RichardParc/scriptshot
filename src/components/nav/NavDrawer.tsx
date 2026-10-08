"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  MapPin,
  Menu,
  Settings,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

function isActive(href: string, pathname: string) {
  if (href === "/") {
    return (
      pathname === "/" ||
      pathname.startsWith("/project") ||
      pathname.startsWith("/new")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Close whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While open: lock page scroll, move focus in, trap Tab, close on Escape,
  // and give focus back to the menu button when it closes.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open]);

  function navItem(href: string, label: string, Icon: LucideIcon) {
    const active = isActive(href, pathname);
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-full px-4 py-3 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
          active
            ? "bg-accent font-medium text-accent-ink"
            : "text-text-primary hover:bg-surface-2"
        }`}
      >
        <Icon size={20} />
        {label}
      </Link>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-text-primary transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 motion-safe:animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-surface px-3 py-5 motion-safe:animate-slide-in-left"
          >
            <div className="mb-6 flex items-center justify-between px-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Image
                  src="/logo.png"
                  alt="Scriptshot"
                  width={616}
                  height={139}
                  className="h-8 w-auto"
                />
              </Link>
              <span id={titleId} className="sr-only">
                Menú de navegación
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X size={18} />
              </button>
            </div>

            <nav aria-label="Principal" className="flex flex-col gap-1">
              {navItem("/", "Proyectos", LayoutGrid)}

              <p className="px-4 pb-1 pt-5 font-mono text-xs text-text-secondary">
                PRODUCCIÓN
              </p>
              {navItem("/oportunidades", "Oportunidades", Sparkles)}
              {navItem("/locaciones", "Locaciones", MapPin)}

              <div className="my-3 border-t border-border" />
              {navItem("/configuracion", "Configuración", Settings)}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

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
  LogOut,
  Sparkles,
  X,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import packageInfo from "../../../package.json";

const appVersion = packageInfo.version;

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
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    let active = true;
    supabase.auth
      .getUser()
      .then((result: { data: { user: { email?: string | null } | null } }) => {
        const user = result.data.user;
        if (active) setAccountEmail(user?.email ?? null);
      })
      .catch(() => {
        if (active) setAccountEmail(null);
      });

    return () => {
      active = false;
    };
  }, []);

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
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
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
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent-hover transition-colors hover:border-accent/50 hover:bg-accent-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Menu size={20} strokeWidth={2.5} />
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

            <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
              {accountEmail && (
                <div className="mb-3 flex min-w-0 items-center gap-3 rounded-xl border border-accent/25 bg-accent-muted/35 px-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent-muted text-accent-hover">
                    <UserRound size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] tracking-[0.14em] text-accent-hover">
                      SESIÓN INICIADA
                    </p>
                    <p
                      className="mt-1 break-all text-xs leading-5 text-text-primary"
                      title={accountEmail}
                    >
                      {accountEmail}
                    </p>
                  </div>
                </div>
              )}
              {navItem("/", "Proyectos", LayoutGrid)}

              <p className="px-4 pb-1 pt-5 font-mono text-xs text-text-secondary">
                PRODUCCIÓN
              </p>
              {navItem("/oportunidades", "Oportunidades", Sparkles)}
              {navItem("/locaciones", "Locaciones", MapPin)}

              <div className="my-3 border-t border-border" />
              {navItem("/configuracion", "Configuración", Settings)}
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.assign("/login");
                }}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-base text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <LogOut size={20} />
                Cerrar sesión
              </button>
            </nav>

            <footer className="mt-8 border-t border-border px-4 pt-4">
              <p className="text-xs text-text-secondary">
                Hecho por{" "}
                <a
                  href="https://www.instagram.com/richardparc/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="RichardParc en Instagram, abre en una pestaña nueva"
                  className="font-medium text-text-primary underline decoration-accent/60 underline-offset-4 transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  RichardParc
                </a>
              </p>
              <a
                href="https://www.instagram.com/richardparc/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram de RichardParc, abre en una pestaña nueva"
                className="mt-2 inline-flex items-center gap-2 text-xs text-text-secondary transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-3.5 w-3.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="17.5" cy="6.8" r="1" fill="currentColor" />
                </svg>
                @richardparc
              </a>
              <p className="mt-4 font-mono text-[10px] tracking-[0.12em] text-text-disabled">
                SCRIPTSHOT · VERSIÓN {appVersion}
              </p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

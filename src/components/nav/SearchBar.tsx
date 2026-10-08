"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, Search, X } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@/lib/projectList";

export function SearchBar({
  query,
  onQueryChange,
  sort,
  onSortChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="flex h-11 w-full items-center gap-2 rounded-full border border-border-strong bg-surface-2 pl-4 pr-1.5 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40">
      <Search size={16} className="shrink-0 text-text-secondary" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar proyectos…"
        aria-label="Buscar proyectos"
        className="min-w-0 flex-1 bg-transparent text-base text-text-primary placeholder:text-text-disabled focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          aria-label="Borrar búsqueda"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <X size={16} />
        </button>
      )}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Ordenar proyectos"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <ArrowUpDown size={16} />
        </button>
        {menuOpen && (
          <div
            role="menu"
            aria-label="Ordenar por"
            className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-border-strong bg-surface-2 py-1 shadow-xl shadow-black/40"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={sort === opt.value}
                onClick={() => {
                  onSortChange(opt.value);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
              >
                {opt.label}
                {sort === opt.value && (
                  <Check size={14} className="text-accent-hover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

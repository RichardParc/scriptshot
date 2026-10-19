"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { fieldClass } from "@/lib/field";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { OptionList } from "@/components/ui/OptionList";

export interface SelectOption {
  value: string;
  label: string;
}

// "FORMATO" -> "Formato" (labels are shown in caps on the field itself).
function sentenceCase(s: string) {
  const t = s.trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecciona…",
  size = "md",
}: {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "md" | "sm";
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const labelId = `${baseId}-label`;

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  function openList() {
    // On phones the choices open as a bottom sheet with big tap targets;
    // on larger screens they stay a compact dropdown.
    if (window.matchMedia("(max-width: 639px)").matches) {
      setSheetOpen(true);
      return;
    }
    const idx = options.findIndex((o) => o.value === value);
    setHighlighted(idx >= 0 ? idx : 0);
    setOpen(true);
  }

  function commit(index: number) {
    const opt = options[index];
    if (opt) onChange(opt.value);
    setOpen(false);
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList();
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(highlighted);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {label && (
        <label id={labelId} className="mb-1 block font-mono text-xs text-text-secondary">
          {label}
        </label>
      )}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open || sheetOpen}
        aria-labelledby={label ? `${labelId} ${baseId}-value` : undefined}
        id={`${baseId}-value`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={fieldClass(size, "flex items-center justify-between text-left")}
      >
        <span className={selected ? "" : "text-text-disabled"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="shrink-0 text-text-secondary" />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={label ? labelId : undefined}
          aria-activedescendant={`${baseId}-opt-${highlighted}`}
          onKeyDown={handleListKeyDown}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border-strong bg-surface-2 py-1 shadow-xl shadow-black/40 focus:outline-none"
        >
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${baseId}-opt-${i}`}
              role="option"
              aria-selected={opt.value === value}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => commit(i)}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 text-base transition-colors ${
                opt.value === value
                  ? "bg-accent-muted text-accent-hover"
                  : i === highlighted
                    ? "bg-white/10 text-text-primary"
                    : "text-text-primary"
              }`}
            >
              {opt.label}
              {opt.value === value && <Check size={14} />}
            </li>
          ))}
        </ul>
      )}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={label ? sentenceCase(label) : "Selecciona una opción"}
      >
        <OptionList
          options={options}
          value={value}
          ariaLabel={label ? sentenceCase(label) : "Opciones"}
          onChange={(v) => {
            onChange(v);
            setSheetOpen(false);
          }}
        />
      </BottomSheet>
    </div>
  );
}

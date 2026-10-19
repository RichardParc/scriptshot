"use client";

import { Check } from "lucide-react";

export interface OptionItem {
  value: string;
  label: string;
}

/**
 * Big, easy-to-tap list of options. The chosen one is filled with the
 * accent color and shows a check. Meant to live inside a BottomSheet.
 */
export function OptionList({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: OptionItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const selectedIndex = options.findIndex((o) => o.value === value);
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-col gap-3">
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            data-autofocus={i === focusIndex ? "" : undefined}
            onClick={() => onChange(opt.value)}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              selected
                ? "border-accent bg-accent font-medium text-accent-ink"
                : "border-border-strong bg-surface-2 text-text-primary hover:border-text-disabled"
            }`}
          >
            <span className="min-w-0 break-words">{opt.label}</span>
            {selected && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check size={16} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useId } from "react";

export function ChipMultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const groupId = useId();

  function toggle(opt: string) {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
    );
  }

  return (
    <div>
      <span id={groupId} className="mb-1 block font-mono text-xs text-text-secondary">
        {label}
      </span>
      <div role="group" aria-labelledby={groupId} className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(opt)}
              className={`rounded-sm border px-2 py-0.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                active
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border text-text-secondary hover:border-border-strong"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

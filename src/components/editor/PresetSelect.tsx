"use client";

import { useId, useState } from "react";
import { Select } from "@/components/ui/Select";

const OTHER = "__otro__";
const EMPTY = "__empty__";

export function PresetSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const isKnown = value === "" || (options as readonly string[]).includes(value);
  const [customMode, setCustomMode] = useState(!isKnown);
  const inputId = useId();

  const selectOptions = [
    { value: EMPTY, label: "—" },
    ...options.map((o) => ({ value: o, label: o })),
    { value: OTHER, label: "Otro…" },
  ];

  if (customMode) {
    return (
      <div>
        <label
          htmlFor={inputId}
          className="mb-1 block font-mono text-xs text-text-secondary"
        >
          {label}
        </label>
        <div className="flex gap-1">
          <input
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Personalizado"
            className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange("");
            }}
            className="px-1 text-sm text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Volver a la lista"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <Select
      label={label}
      value={value === "" ? EMPTY : value}
      options={selectOptions}
      onChange={(v) => {
        if (v === OTHER) {
          setCustomMode(true);
          onChange("");
        } else if (v === EMPTY) {
          onChange("");
        } else {
          onChange(v);
        }
      }}
    />
  );
}

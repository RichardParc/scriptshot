"use client";

import { useState } from "react";

const OTHER = "__otro__";

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

  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] text-text-secondary">
        {label}
      </label>
      {customMode ? (
        <div className="flex gap-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Personalizado"
            className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-xs text-text-primary placeholder:text-text-disabled focus:border-accent"
          />
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange("");
            }}
            className="px-1 text-xs text-text-secondary hover:text-text-primary"
            aria-label="Volver a la lista"
          >
            ✕
          </button>
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === OTHER) {
              setCustomMode(true);
              onChange("");
            } else {
              onChange(e.target.value);
            }
          }}
          className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-xs text-text-primary focus:border-accent"
        >
          <option value="">—</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value={OTHER}>Otro…</option>
        </select>
      )}
    </div>
  );
}

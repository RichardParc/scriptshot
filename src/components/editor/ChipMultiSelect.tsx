"use client";

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
  function toggle(opt: string) {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
    );
  }

  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] text-text-secondary">
        {label}
      </label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`rounded-sm border px-2 py-0.5 text-[11px] transition-colors ${
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

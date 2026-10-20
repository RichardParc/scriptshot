"use client";

import { fieldClass } from "@/lib/field";
import { useEffect, useId, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Location } from "@/lib/types";

export function LocationPicker({
  initialLocationName,
  onChange,
  size = "md",
  label = "LOCACIÓN",
  placeholder = "¿Dónde se graba?",
}: {
  initialLocationName: string | null;
  onChange: (locationId: string | null) => void;
  size?: "md" | "sm";
  label?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(initialLocationName ?? "");
  const [options, setOptions] = useState<Location[]>([]);
  const inputId = useId();
  const listId = `${inputId}-options`;

  useEffect(() => {
    supabase
      .from("location")
      .select("id, name")
      .order("name")
      .then(({ data }: { data: Location[] | null }) => {
        if (data) setOptions(data);
      });
  }, []);

  async function commit() {
    const trimmed = query.trim();
    if (!trimmed) {
      onChange(null);
      return;
    }

    const existing = options.find(
      (o) => o.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      onChange(existing.id);
      setQuery(existing.name);
      return;
    }

    const { data } = await supabase
      .from("location")
      .insert({ name: trimmed })
      .select("id, name")
      .single();

    if (data) {
      onChange(data.id);
      setOptions((prev) => [...prev, data]);
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block font-mono text-[10px] tracking-[0.14em] text-text-secondary">
        {label}
      </label>
      <input
        id={inputId}
        list={listId}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={commit}
        placeholder={placeholder}
        className={fieldClass(size)}
      />
      {size === "md" && (
        <p className="mt-1.5 text-xs leading-5 text-text-disabled">
          Elige una locación existente o escribe una nueva.
        </p>
      )}
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o.id} value={o.name} />
        ))}
      </datalist>
    </div>
  );
}

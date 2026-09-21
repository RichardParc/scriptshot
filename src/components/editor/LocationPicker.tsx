"use client";

import { useEffect, useId, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Location } from "@/lib/types";

export function LocationPicker({
  initialLocationName,
  onChange,
}: {
  initialLocationName: string | null;
  onChange: (locationId: string | null) => void;
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
      .then(({ data }) => {
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
      <label htmlFor={inputId} className="mb-1 block font-mono text-xs text-text-secondary">
        LOCACIÓN
      </label>
      <input
        id={inputId}
        list={listId}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={commit}
        placeholder="¿Dónde se graba?"
        className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-sm text-text-primary placeholder:text-text-disabled focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o.id} value={o.name} />
        ))}
      </datalist>
    </div>
  );
}

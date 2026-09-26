"use client";

import { GripVertical } from "lucide-react";
import type { DragHandleProps } from "./SortableItem";

export function DragHandle({
  dragHandleProps,
  className = "",
}: {
  dragHandleProps: DragHandleProps;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Reordenar (mantén presionado y arrastra, o usa las flechas del teclado)"
      className={`flex cursor-grab touch-none items-center justify-center text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:cursor-grabbing ${className}`}
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
    >
      <GripVertical size={16} />
    </button>
  );
}

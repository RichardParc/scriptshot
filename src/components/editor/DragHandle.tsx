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
      className={`flex h-9 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-text-disabled transition-colors hover:bg-white/[0.04] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:cursor-grabbing sm:h-8 sm:w-8 sm:text-text-secondary ${className}`}
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
    >
      <GripVertical size={14} className="sm:h-4 sm:w-4" />
    </button>
  );
}

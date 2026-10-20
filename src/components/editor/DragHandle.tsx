"use client";

import { GripVertical } from "lucide-react";
import type { DragHandleProps } from "./SortableItem";

export function DragHandle({
  dragHandleProps,
  className = "",
  compact = false,
}: {
  dragHandleProps: DragHandleProps;
  className?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label="Reordenar (mantén presionado y arrastra, o usa las flechas del teclado)"
      className={`flex shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-text-disabled transition-colors hover:bg-white/[0.04] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:cursor-grabbing sm:text-text-secondary ${compact ? "h-6 w-5" : "h-8 w-7 sm:w-8"} ${className}`}
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
    >
      <GripVertical size={compact ? 10 : 12} />
    </button>
  );
}

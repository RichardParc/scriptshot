"use client";

import type { ReactNode } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
}

export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (props: {
    dragHandleProps: DragHandleProps;
    isDragging: boolean;
  }) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? "relative z-20 opacity-90 drop-shadow-[0_12px_24px_rgba(226,55,55,0.22)]"
          : ""
      }
    >
      {children({ dragHandleProps: { attributes, listeners }, isDragging })}
    </div>
  );
}

"use client";

export function ReorderArrows({
  onUp,
  onDown,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex flex-col">
      <button
        onClick={onUp}
        disabled={disableUp}
        aria-label="Mover arriba"
        className="px-1 text-text-secondary hover:text-text-primary disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
      >
        ▲
      </button>
      <button
        onClick={onDown}
        disabled={disableDown}
        aria-label="Mover abajo"
        className="px-1 text-text-secondary hover:text-text-primary disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
      >
        ▼
      </button>
    </div>
  );
}

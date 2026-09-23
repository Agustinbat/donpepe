"use client";

import { useRef } from "react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function QuantityControl({
  value,
  onChange,
  min = 0,
  max = 99,
}: Props) {
  const valueRef = useRef(value);
  valueRef.current = value;

  function step(delta: number) {
    const next = Math.min(max, Math.max(min, valueRef.current + delta));
    valueRef.current = next;
    onChange(next);
  }

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-background">
      <button
        type="button"
        aria-label="Restar"
        disabled={value <= min}
        onClick={() => step(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-foreground transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Sumar"
        disabled={value >= max}
        onClick={() => step(1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-foreground transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

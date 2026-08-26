"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ChartBox({
  height = 220,
  className,
  children,
}: {
  height?: number;
  className?: string;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      setWidth((prev) => (prev === next ? prev : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("w-full min-w-0", className)}
      style={{ height }}
    >
      {width > 0 ? children({ width, height }) : null}
    </div>
  );
}

export function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { title: string; rate: number } }>;
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return (
    <div className="grid gap-0.5 rounded-md border border-ink/9 bg-paper-white px-2.5 py-2 shadow-paper-sm dark:border-ink/12 dark:bg-paper-raised">
      <span className="font-mono text-[0.62rem] font-semibold tracking-[0.06em] text-ink-50 uppercase">
        {point.title}
      </span>
      <span className="font-mono text-[0.9rem] font-bold text-blue-deep">
        {point.rate}%
      </span>
    </div>
  );
}

export const chartTick = {
  fill: "var(--ink-50)",
  fontSize: 11,
  fontFamily: "var(--mono)",
} as const;

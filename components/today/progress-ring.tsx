"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { mono } from "@/lib/ui";
import { cn } from "@/lib/utils";

const R = 46;
const C = 2 * Math.PI * R;

export function ProgressRing({
  percent,
  animate = true,
}: {
  percent: number;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const [ready, setReady] = useState(!animate || Boolean(reduce));

  useEffect(() => {
    if (!animate || reduce) {
      setReady(true);
      return;
    }
    setReady(false);
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [animate, reduce, clamped]);

  const offset = ready ? C * (1 - clamped / 100) : C;

  return (
    <div
      className="relative mt-0.5 size-[116px] shrink-0 border-0 shadow-none"
      role="img"
      aria-label={`${clamped} percent of due habits marked`}
    >
      <svg
        viewBox="0 0 116 116"
        aria-hidden
        className="size-full origin-center -rotate-90"
      >
        <circle
          className="fill-none stroke-rule [stroke-linecap:round] [stroke-width:11]"
          cx="58"
          cy="58"
          r={R}
        />
        <circle
          className="fill-none stroke-blue [stroke-linecap:round] [stroke-width:11] transition-[stroke-dashoffset] duration-normal ease-out-expo"
          cx="58"
          cy="58"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={reduce ? { transition: "none" } : undefined}
        />
      </svg>
      <b
        className={cn(
          mono,
          "absolute inset-0 grid place-items-center text-[1.5rem] font-bold tracking-[-0.05em]",
        )}
      >
        {clamped}%
      </b>
    </div>
  );
}

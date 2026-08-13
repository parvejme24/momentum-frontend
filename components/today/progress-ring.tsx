"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

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
      className="ring"
      role="img"
      aria-label={`${clamped} percent of due habits marked`}
    >
      <svg viewBox="0 0 116 116" aria-hidden>
        <circle className="track" cx="58" cy="58" r={R} />
        <circle
          className="value"
          cx="58"
          cy="58"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={
            reduce
              ? { transition: "none" }
              : undefined
          }
        />
      </svg>
      <b className="mono">{clamped}%</b>
    </div>
  );
}

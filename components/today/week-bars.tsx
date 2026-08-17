"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { easeOut } from "@/components/home/motion";

export function WeekBars({ rates }: { rates: number[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [grown, setGrown] = useState(Boolean(reduce));

  useEffect(() => {
    if (reduce) {
      setGrown(true);
      return;
    }
    if (inView) setGrown(true);
  }, [inView, reduce]);

  if (rates.length === 0) {
    return <p className="hint">Weekly completion appears after you log days.</p>;
  }

  return (
    <div ref={ref} className="bars" aria-label="Last 12 weeks completion">
      {rates.map((rate, i) => {
        const hot = rate >= 0.75;
        const label =
          i === 0 ? "12w" : i === rates.length - 1 ? "Now" : "";
        return (
          <div key={i} className="bar-col">
            <div className="bar-track">
              <motion.div
                className={hot ? "bar hot" : "bar"}
                initial={false}
                animate={{
                  height: grown ? `${Math.round(rate * 100)}%` : "0%",
                }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        duration: 0.8,
                        ease: easeOut,
                        delay: 0.04 * i,
                      }
                }
              />
            </div>
            <span className="bar-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

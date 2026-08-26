"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { easeOut } from "@/components/home/motion";
import { cn } from "@/lib/utils";

export function RateBars({
  rates,
  labels,
  ariaLabel,
  hotThreshold = 0.75,
  animateKey,
}: {
  rates: number[];
  labels: string[];
  ariaLabel: string;
  hotThreshold?: number;
  animateKey?: string | number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    if (reduce) {
      setGrown(true);
      return;
    }
    if (!inView) return;
    const id = window.requestAnimationFrame(() => setGrown(true));
    return () => window.cancelAnimationFrame(id);
  }, [animateKey, inView, reduce]);

  return (
    <div
      ref={ref}
      className="flex h-[170px] items-stretch gap-[clamp(6px,1.4vw,14px)]"
      aria-label={ariaLabel}
    >
      {rates.map((rate, i) => {
        const hot = rate >= hotThreshold;
        return (
          <div
            key={`${animateKey ?? "bars"}-${i}`}
            className="grid min-w-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-2"
          >
            <div className="flex min-h-0 w-full items-end">
              <motion.div
                className={cn(
                  "min-h-0 w-full self-end rounded-t-[4px] border border-b-0 border-ink/9 bg-blue-soft",
                  hot && "bg-blue",
                )}
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
            <span className="flex min-h-[1.1rem] items-start justify-center text-center font-mono text-[0.68rem] text-ink-50">
              {labels[i] ?? ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

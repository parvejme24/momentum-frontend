"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { easeOut } from "@/components/home/motion";

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
    <div ref={ref} className="bars" aria-label={ariaLabel}>
      {rates.map((rate, i) => {
        const hot = rate >= hotThreshold;
        return (
          <div key={`${animateKey ?? "bars"}-${i}`} className="bar-col">
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
            <span className="bar-label">{labels[i] ?? ""}</span>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { WEEK_RATES } from "@/components/today/sample-data";
import { easeOut } from "@/components/home/motion";

export function WeekBars() {
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

  return (
    <div ref={ref} className="bars" aria-label="Last 12 weeks completion">
      {WEEK_RATES.map((rate, i) => {
        const hot = rate >= 0.75;
        const label =
          i === 0 ? "12w" : i === WEEK_RATES.length - 1 ? "Now" : "";
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

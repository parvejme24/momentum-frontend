"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const DAYS = 7;

type CellLevel = 0 | 1 | 2 | 3 | 4;

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCells(
  seed: number,
  fillRate: number,
  weeks: number,
  activeWeekdays?: number[],
): { level: CellLevel; off: boolean }[] {
  const total = weeks * DAYS;
  const rand = mulberry32(seed);
  return Array.from({ length: total }, (_, i) => {
    const weekday = i % DAYS;
    const off = Boolean(activeWeekdays && !activeWeekdays.includes(weekday));
    if (off) return { level: 0 as CellLevel, off: true };

    const roll = rand();
    if (roll > fillRate) return { level: 0 as CellLevel, off: false };
    if (roll > fillRate * 0.72) return { level: 1 as CellLevel, off: false };
    if (roll > fillRate * 0.45) return { level: 2 as CellLevel, off: false };
    if (roll > fillRate * 0.2) return { level: 3 as CellLevel, off: false };
    return { level: 4 as CellLevel, off: false };
  });
}

function cellClass(level: CellLevel, off: boolean) {
  if (off) return "cell off";
  if (level === 0) return "cell";
  return `cell l${level}`;
}

export function MiniHeatmap({
  seed,
  fillRate,
  activeWeekdays,
  label,
  weeks = 13,
}: {
  seed: number;
  fillRate: number;
  activeWeekdays?: number[];
  label: string;
  weeks?: number;
}) {
  const reduce = useReducedMotion();
  const cells = useMemo(
    () => buildCells(seed, fillRate, weeks, activeWeekdays),
    [seed, fillRate, weeks, activeWeekdays],
  );
  const columns = useMemo(() => {
    const cols: { level: CellLevel; off: boolean }[][] = [];
    for (let w = 0; w < weeks; w++) {
      cols.push(cells.slice(w * DAYS, w * DAYS + DAYS));
    }
    return cols;
  }, [cells, weeks]);

  return (
    <div className="heat-scroll habit-mini-heat">
      <div
        className="heat heat-motion"
        role="img"
        aria-label={`Last ${weeks * DAYS} days for ${label}`}
      >
        {columns.map((col, wi) => (
          <motion.div
            key={wi}
            className="heat-col"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  delayChildren: reduce ? 0 : wi * 0.012,
                  staggerChildren: reduce ? 0 : 0.01,
                },
              },
            }}
          >
            {col.map((cell, di) => (
              <motion.i
                key={`${wi}-${di}`}
                className={cellClass(cell.level, cell.off)}
                variants={{
                  hidden: { opacity: 0, scale: 0.35 },
                  show: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 520,
                      damping: 24,
                      mass: 0.3,
                    },
                  },
                }}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

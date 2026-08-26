"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  buildHeatmapCells,
  type HeatmapCell,
  type HeatmapEntry,
} from "@/lib/habits/heatmap";
import { cn } from "@/lib/utils";

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

function buildDemoCells(
  seed: number,
  fillRate: number,
  weeks: number,
  activeWeekdays?: number[],
): HeatmapCell[] {
  const total = weeks * DAYS;
  const rand = mulberry32(seed);
  return Array.from({ length: total }, (_, i) => {
    const weekday = i % DAYS;
    const off = Boolean(activeWeekdays && !activeWeekdays.includes(weekday));
    if (off) return { level: 0 as CellLevel, off: true, skip: false };

    const roll = rand();
    if (roll > fillRate) return { level: 0 as CellLevel, off: false, skip: false };
    if (roll > fillRate * 0.72) return { level: 1 as CellLevel, off: false, skip: false };
    if (roll > fillRate * 0.45) return { level: 2 as CellLevel, off: false, skip: false };
    if (roll > fillRate * 0.2) return { level: 3 as CellLevel, off: false, skip: false };
    return { level: 4 as CellLevel, off: false, skip: false };
  });
}

const HEAT_CELL =
  "size-[13px] rounded-[2px] border border-[rgba(20,26,46,0.07)] bg-l0 transition-transform duration-instant ease-smooth hover:scale-[1.45] hover:border-ink";

function cellClass(cell: HeatmapCell) {
  return cn(
    HEAT_CELL,
    cell.off && "opacity-25",
    cell.skip &&
      "bg-[repeating-linear-gradient(45deg,var(--rule)_0_2px,transparent_2px_4px)]",
    !cell.off && !cell.skip && cell.level === 1 && "bg-l1",
    !cell.off && !cell.skip && cell.level === 2 && "bg-l2",
    !cell.off && !cell.skip && cell.level === 3 && "bg-l3",
    !cell.off && !cell.skip && cell.level === 4 && "bg-l4",
  );
}

export function MiniHeatmap({
  seed,
  fillRate,
  activeWeekdays,
  label,
  weeks = 13,
  heatmap,
}: {
  seed: number;
  fillRate: number;
  activeWeekdays?: number[];
  label: string;
  weeks?: number;
  /** Real log data. `null` = loading; omit for demo/fallback cells. */
  heatmap?: HeatmapEntry[] | null;
}) {
  const reduce = useReducedMotion();
  const cells = useMemo(() => {
    if (heatmap === null) {
      return buildHeatmapCells(weeks * DAYS, [], activeWeekdays);
    }
    if (heatmap !== undefined) {
      return buildHeatmapCells(weeks * DAYS, heatmap, activeWeekdays);
    }
    return buildDemoCells(seed, fillRate, weeks, activeWeekdays);
  }, [heatmap, seed, fillRate, weeks, activeWeekdays]);
  const columns = useMemo(() => {
    const cols: HeatmapCell[][] = [];
    for (let w = 0; w < weeks; w++) {
      cols.push(cells.slice(w * DAYS, w * DAYS + DAYS));
    }
    return cols;
  }, [cells, weeks]);

  return (
    <div className="mx-[-2px] h-full min-h-0 overflow-x-auto overflow-y-hidden pb-2 [-webkit-overflow-scrolling:touch]">
      <div
        className="flex w-max flex-row gap-[3px]"
        role="img"
        aria-label={`Last ${weeks * DAYS} days for ${label}`}
      >
        {columns.map((col, wi) => (
          <motion.div
            key={wi}
            className="flex flex-col gap-[3px]"
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
                className={cellClass(cell)}
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

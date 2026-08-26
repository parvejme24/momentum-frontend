"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type CellLevel = 0 | 1 | 2 | 3 | 4;

const WEEKS = 9;
const DAYS = 7;

const LEVEL_BG = ["bg-l0", "bg-l1", "bg-l2", "bg-l3", "bg-l4"] as const;

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function isGap(week: number, day: number) {
  return week === 4 || (week === 3 && day >= 5) || (week === 5 && day <= 1);
}

function buildBlankDayChain(): CellLevel[] {
  const rand = mulberry32(404);
  const cells: CellLevel[] = [];

  for (let week = 0; week < WEEKS; week++) {
    for (let day = 0; day < DAYS; day++) {
      if (isGap(week, day)) {
        cells.push(0);
        continue;
      }

      const roll = rand();
      if (roll > 0.9) cells.push(1);
      else if (roll > 0.52) cells.push(2);
      else if (roll > 0.2) cells.push(3);
      else cells.push(4);
    }
  }

  return cells;
}

function levelClass(level: CellLevel, gap: boolean): string {
  return cn(
    "relative size-[18px] rounded-[2px] border border-[rgba(20,26,46,0.07)] transition-[transform,border-color,box-shadow] duration-fast ease-smooth max-[640px]:size-4 hover:z-[2] hover:scale-[1.35] hover:border-[color-mix(in_srgb,var(--blue)_35%,transparent)] hover:shadow-paper-sm dark:hover:border-[#8ba4c9]/55 dark:hover:shadow-[2px_2px_0_rgba(139,164,201,0.35)]",
    gap || level === 0
      ? "border-dashed border-ink-30 bg-paper-white shadow-none"
      : LEVEL_BG[level],
  );
}

export function BlankChain() {
  const reduce = useReducedMotion();
  const cells = useMemo(() => buildBlankDayChain(), []);
  const columns = useMemo(() => {
    const cols: { level: CellLevel; gap: boolean }[][] = [];
    for (let week = 0; week < WEEKS; week++) {
      cols.push(
        cells.slice(week * DAYS, week * DAYS + DAYS).map((level, day) => ({
          level,
          gap: isGap(week, day),
        })),
      );
    }
    return cols;
  }, [cells]);

  return (
    <div className="flex justify-center overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
      <div
        className="flex w-max flex-row gap-1"
        role="img"
        aria-label="A short habit chain with a blank gap in the middle — this page was never logged"
      >
        {columns.map((col, week) => (
          <motion.div
            key={week}
            className="flex flex-col gap-1"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  delayChildren: reduce ? 0 : 0.28 + week * 0.05,
                  staggerChildren: reduce ? 0 : 0.016,
                },
              },
            }}
          >
            {col.map((cell, day) => (
              <motion.i
                key={`${week}-${day}`}
                className={levelClass(cell.level, cell.gap)}
                variants={{
                  hidden: { opacity: 0, scale: cell.gap ? 0.85 : 0.28 },
                  show: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: cell.gap ? 280 : 480,
                      damping: cell.gap ? 28 : 22,
                      mass: 0.35,
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

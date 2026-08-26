"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const WEEKS = 52;
const DAYS = 7;
const TOTAL = WEEKS * DAYS;

type CellLevel = 0 | 1 | 2 | 3 | 4;

type ChainCell = {
  level: CellLevel;
  skip: boolean;
  off: boolean;
  today: boolean;
  date: Date;
  title: string;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isoLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type ChainHeatmapEntry = {
  date: string;
  level: number;
  status?: string;
};

function buildYearChainFromHeatmap(
  heatmap: ChainHeatmapEntry[],
  activeWeekdays?: number[],
): ChainCell[] {
  const byDate = new Map(heatmap.map((entry) => [entry.date, entry]));
  const today = startOfDay(new Date());
  const first = new Date(today);
  first.setDate(first.getDate() - (TOTAL - 1));

  return Array.from({ length: TOTAL }, (_, i) => {
    const date = new Date(first);
    date.setDate(first.getDate() + i);
    const weekday = date.getDay();
    const off = Boolean(activeWeekdays && !activeWeekdays.includes(weekday));
    const iso = isoLocal(date);
    const entry = byDate.get(iso);
    const skip = entry?.status === "SKIPPED";
    const rawLevel = skip ? 0 : Math.max(0, Math.min(4, entry?.level ?? 0));
    const level = rawLevel as CellLevel;
    const isToday = i === TOTAL - 1;
    const status = off
      ? "not scheduled"
      : skip
        ? "skipped"
        : level === 0
          ? "empty"
          : level >= 3
            ? "strong"
            : "logged";

    return {
      level,
      skip,
      off,
      today: isToday,
      date,
      title: `${formatCellDate(date)} · ${isToday ? "today" : status}`,
    };
  });
}

function formatCellDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildYearChain(
  seed: number,
  fillRate: number,
  activeWeekdays?: number[],
): ChainCell[] {
  const rand = mulberry32(seed);
  const today = startOfDay(new Date());
  const first = new Date(today);
  first.setDate(first.getDate() - (TOTAL - 1));

  const cells: ChainCell[] = Array.from({ length: TOTAL }, (_, i) => {
    const date = new Date(first);
    date.setDate(first.getDate() + i);
    const weekday = date.getDay();
    const off = Boolean(activeWeekdays && !activeWeekdays.includes(weekday));

    if (off) {
      return {
        level: 0,
        skip: false,
        off: true,
        today: i === TOTAL - 1,
        date,
        title: `${formatCellDate(date)} · not scheduled`,
      };
    }

    const roll = rand();
    let level: CellLevel = 0;
    let skip = false;

    if (roll > fillRate) {
      skip = roll > fillRate + (1 - fillRate) * 0.45;
      level = 0;
    } else if (roll > fillRate * 0.72) {
      level = 1;
    } else if (roll > fillRate * 0.45) {
      level = 2;
    } else if (roll > fillRate * 0.2) {
      level = 3;
    } else {
      level = 4;
    }

    const isToday = i === TOTAL - 1;
    if (isToday && level === 0 && !skip) level = 3;

    const status = skip
      ? "skipped"
      : level === 0
        ? "empty"
        : level >= 3
          ? "strong"
          : "logged";

    return {
      level,
      skip,
      off: false,
      today: isToday,
      date,
      title: `${formatCellDate(date)} · ${status}`,
    };
  });

  for (let i = TOTAL - 47; i < TOTAL; i++) {
    if (cells[i].off) continue;
    cells[i].skip = false;
    cells[i].level = (2 + Math.floor(rand() * 3)) as CellLevel;
    cells[i].title = `${formatCellDate(cells[i].date)} · strong`;
  }

  const breakIdx = TOTAL - 48;
  if (!cells[breakIdx].off) {
    cells[breakIdx].skip = true;
    cells[breakIdx].level = 0;
    cells[breakIdx].title = `${formatCellDate(cells[breakIdx].date)} · skipped`;
  }

  const longestStart = 120;
  for (let i = longestStart; i < longestStart + 61; i++) {
    if (cells[i]?.off) continue;
    cells[i].skip = false;
    cells[i].level = (2 + Math.floor(rand() * 3)) as CellLevel;
    cells[i].title = `${formatCellDate(cells[i].date)} · strong`;
  }

  cells[TOTAL - 1].today = true;
  cells[TOTAL - 1].title = `${formatCellDate(cells[TOTAL - 1].date)} · today`;

  return cells;
}

const CHAIN_CELL =
  "relative size-[15px] rounded-[2px] border border-[rgba(20,26,46,0.07)] bg-l0 transition-[transform,border-color,box-shadow] duration-fast ease-smooth hover:z-[2] hover:scale-[1.35] hover:border-[color-mix(in_srgb,var(--blue)_35%,transparent)] hover:shadow-paper-sm dark:hover:border-[#8ba4c9]/55 dark:hover:shadow-[2px_2px_0_rgba(139,164,201,0.35)]";

function cellClass(cell: ChainCell) {
  return cn(
    CHAIN_CELL,
    cell.off && "opacity-25",
    cell.skip &&
      "bg-[repeating-linear-gradient(45deg,var(--rule)_0_2px,transparent_2px_4px)]",
    !cell.off && !cell.skip && cell.level === 1 && "bg-l1",
    !cell.off && !cell.skip && cell.level === 2 && "bg-l2",
    !cell.off && !cell.skip && cell.level === 3 && "bg-l3",
    !cell.off && !cell.skip && cell.level === 4 && "bg-l4",
    cell.today && "border-2 border-flame",
  );
}

export function YearChain({
  seed,
  fillRate,
  activeWeekdays,
  label,
  heatmap,
}: {
  seed?: number;
  fillRate?: number;
  activeWeekdays?: number[];
  label: string;
  heatmap?: ChainHeatmapEntry[];
}) {
  const reduce = useReducedMotion();
  const cells = useMemo(
    () =>
      heatmap
        ? buildYearChainFromHeatmap(heatmap, activeWeekdays)
        : buildYearChain(seed ?? 1, fillRate ?? 0, activeWeekdays),
    [heatmap, seed, fillRate, activeWeekdays],
  );

  const columns = useMemo(() => {
    const cols: ChainCell[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      cols.push(cells.slice(w * DAYS, w * DAYS + DAYS));
    }
    return cols;
  }, [cells]);

  return (
    <div className="mt-1 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
      <div
        className="flex w-max flex-row gap-1"
        role="img"
        aria-label={`Year heatmap for ${label}, last 364 days`}
      >
        {columns.map((col, wi) => (
          <motion.div
            key={wi}
            className="flex flex-col gap-1"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  delayChildren: reduce ? 0 : 0.08 + wi * 0.014,
                  staggerChildren: reduce ? 0 : 0.012,
                },
              },
            }}
          >
            {col.map((cell, di) => (
              <motion.i
                key={`${wi}-${di}`}
                className={cellClass(cell)}
                title={cell.title}
                variants={{
                  hidden: { opacity: 0, scale: 0.25 },
                  show: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 480,
                      damping: 22,
                      mass: 0.35,
                    },
                  },
                }}
                whileHover={
                  reduce
                    ? undefined
                    : {
                        scale: 1.45,
                        zIndex: 2,
                        transition: { duration: 0.12 },
                      }
                }
              />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

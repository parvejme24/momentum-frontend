"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
      // Empty days: some are intentional skips (hatched), rest are blank.
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

  // Current streak of ~47 solid days ending today.
  for (let i = TOTAL - 47; i < TOTAL; i++) {
    if (cells[i].off) continue;
    cells[i].skip = false;
    cells[i].level = (2 + Math.floor(rand() * 3)) as CellLevel;
    cells[i].title = `${formatCellDate(cells[i].date)} · strong`;
  }

  // A break just before the current streak.
  const breakIdx = TOTAL - 48;
  if (!cells[breakIdx].off) {
    cells[breakIdx].skip = true;
    cells[breakIdx].level = 0;
    cells[breakIdx].title = `${formatCellDate(cells[breakIdx].date)} · skipped`;
  }

  // Longest streak stretch (~61 days) earlier in the year.
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

function cellClass(cell: ChainCell) {
  const parts = ["cell"];
  if (cell.off) parts.push("off");
  else if (cell.skip) parts.push("skip");
  else if (cell.level > 0) parts.push(`l${cell.level}`);
  if (cell.today) parts.push("today");
  return parts.join(" ");
}

export function YearChain({
  seed,
  fillRate,
  activeWeekdays,
  label,
}: {
  seed: number;
  fillRate: number;
  activeWeekdays?: number[];
  label: string;
}) {
  const reduce = useReducedMotion();
  const cells = useMemo(
    () => buildYearChain(seed, fillRate, activeWeekdays),
    [seed, fillRate, activeWeekdays],
  );

  const columns = useMemo(() => {
    const cols: ChainCell[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      cols.push(cells.slice(w * DAYS, w * DAYS + DAYS));
    }
    return cols;
  }, [cells]);

  return (
    <div className="heat-scroll habit-year-scroll">
      <div
        className="chain chain-motion"
        role="img"
        aria-label={`Year heatmap for ${label}, last 364 days`}
      >
        {columns.map((col, wi) => (
          <motion.div
            key={wi}
            className="chain-col"
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

"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";

import { easeOut } from "@/components/home/motion";
import { customer } from "@/lib/data/customer";
import { cn } from "@/lib/utils";
import { chip, chipBlue, mono, muted, num, row, statK } from "@/lib/ui";

const WEEKS = 52;
const DAYS = 7;
const TOTAL = WEEKS * DAYS;

const featuredHabit = customer.habits.active[0];
const featuredDetail =
  customer.habitDetails[featuredHabit.id as keyof typeof customer.habitDetails];

type CellLevel = 0 | 1 | 2 | 3 | 4;

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

function buildYearChain(seed: number, currentStreak: number, longestStreak: number): CellLevel[] {
  const rand = mulberry32(seed);
  const cells: CellLevel[] = Array.from({ length: TOTAL }, () => 0);

  for (let i = 0; i < TOTAL; i++) {
    const roll = rand();
    if (roll > 0.86) cells[i] = 0;
    else if (roll > 0.62) cells[i] = 1;
    else if (roll > 0.38) cells[i] = 2;
    else if (roll > 0.18) cells[i] = 3;
    else cells[i] = 4;
  }

  const current = Math.min(currentStreak, TOTAL - 1);
  for (let i = TOTAL - current; i < TOTAL; i++) {
    cells[i] = (2 + Math.floor(rand() * 3)) as CellLevel;
  }
  if (TOTAL - current - 1 >= 0) cells[TOTAL - current - 1] = 0;

  const longestStart = 120;
  const longest = Math.min(longestStreak, TOTAL - longestStart);
  for (let i = longestStart; i < longestStart + longest; i++) {
    cells[i] = (2 + Math.floor(rand() * 3)) as CellLevel;
  }

  return cells;
}

function levelClass(level: CellLevel): string {
  return cn(
    "relative size-[15px] rounded-[2px] border border-[rgba(20,26,46,0.07)] transition-[transform,border-color,box-shadow] duration-fast ease-smooth hover:z-[2] hover:scale-[1.35] hover:border-[color-mix(in_srgb,var(--blue)_35%,transparent)] hover:shadow-paper-sm dark:hover:border-[#8ba4c9]/55 dark:hover:shadow-[2px_2px_0_rgba(139,164,201,0.35)]",
    LEVEL_BG[level],
  );
}

const legendSwatch =
  "block size-3 rounded-[2px] border border-[rgba(20,26,46,0.07)]";

export function YearHeatmap() {
  const reduce = useReducedMotion();
  const cells = useMemo(
    () =>
      buildYearChain(
        featuredHabit.heatSeed,
        featuredHabit.streakDays,
        featuredDetail?.longestStreak ?? featuredHabit.streakDays,
      ),
    [],
  );

  const columns = useMemo(() => {
    const cols: CellLevel[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      cols.push(cells.slice(w * DAYS, w * DAYS + DAYS));
    }
    return cols;
  }, [cells]);

  return (
    <motion.div
      id="demo"
      className={cn(
        "relative mt-0 overflow-hidden rounded-lg border border-[var(--stroke)] bg-paper-white p-[clamp(16px,2.5vw,22px)] shadow-lift scroll-mt-[90px] transition-[transform,box-shadow] duration-normal ease-smooth",
        "after:pointer-events-none after:absolute after:right-3 after:bottom-3 after:h-0 after:w-0 after:rounded-br-md after:border-r after:border-b after:border-[rgba(20,26,46,0.14)] after:opacity-0 after:transition-[width,height,opacity] after:duration-normal after:ease-smooth after:content-['']",
        "hover:-translate-y-[3px] hover:after:h-[calc(100%-24px)] hover:after:w-[calc(100%-24px)] hover:after:opacity-100",
        "dark:hover:shadow-lift dark:hover:shadow-glow dark:after:border-r-[#8ba4c9]/65 dark:after:border-b-[#8ba4c9]/65",
      )}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: easeOut }}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 max-[640px]:items-start">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="m-0">{featuredHabit.title}</h3>
            <span className={cn(chip, chipBlue)}>{featuredHabit.schedule}</span>
          </div>
          <p className={cn(mono, muted, "m-0 text-[0.75rem]")}>Last 364 days</p>
        </div>

        <div className="flex flex-wrap items-end gap-[clamp(16px,3vw,28px)] max-[640px]:w-full max-[640px]:justify-between">
          <Stat label="Current" value={String(featuredHabit.streakDays)} flame />
          <Stat
            label="Longest"
            value={String(featuredDetail?.longestStreak ?? featuredHabit.streakDays)}
          />
          <Stat label="Rate" value={`${featuredHabit.rate}%`} />
        </div>
      </div>

      <div className="overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
        <div
          className="flex w-max flex-row gap-1"
          role="img"
          aria-label={`Year heatmap for ${featuredHabit.title}, last 364 days`}
        >
          {columns.map((col, wi) => (
            <motion.div
              key={wi}
              className="flex flex-col gap-1"
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                show: {
                  transition: {
                    delayChildren: reduce ? 0 : 0.12 + wi * 0.016,
                    staggerChildren: reduce ? 0 : 0.014,
                  },
                },
              }}
            >
              {col.map((level, di) => (
                <motion.i
                  key={`${wi}-${di}`}
                  className={levelClass(level)}
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
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-end gap-1.5 font-mono text-[0.68rem] text-ink-50">
        <span>Less</span>
        <i className={cn(legendSwatch, "bg-l0")} />
        <i className={cn(legendSwatch, "bg-l1")} />
        <i className={cn(legendSwatch, "bg-l2")} />
        <i className={cn(legendSwatch, "bg-l3")} />
        <i className={cn(legendSwatch, "bg-l4")} />
        <span>More</span>
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  flame = false,
}: {
  label: string;
  value: string;
  flame?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <div className={statK}>{label}</div>
      <div
        className={cn(
          num,
          "mt-0.5 text-[1.5rem] leading-none",
          flame && "inline-flex items-center gap-[5px] text-flame",
        )}
      >
        {flame ? (
          <span className={cn(row, "gap-[5px]")}>
            {value}
            <motion.span
              animate={
                reduce
                  ? undefined
                  : { scale: [1, 1.12, 1], rotate: [0, -6, 0] }
              }
              transition={
                reduce
                  ? undefined
                  : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              }
              className="inline-flex"
            >
              <Flame size={16} aria-hidden />
            </motion.span>
          </span>
        ) : (
          value
        )}
      </div>
    </motion.div>
  );
}

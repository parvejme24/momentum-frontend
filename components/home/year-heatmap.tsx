"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";

import { easeOut } from "@/components/home/motion";
import { customer } from "@/lib/data/customer";

const WEEKS = 52;
const DAYS = 7;
const TOTAL = WEEKS * DAYS;

const featuredHabit = customer.habits.active[0];
const featuredDetail =
  customer.habitDetails[featuredHabit.id as keyof typeof customer.habitDetails];

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
  if (level === 0) return "cell";
  return `cell l${level}`;
}

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
      className="chain-frame"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: easeOut }}
      whileHover={
        reduce
          ? undefined
          : {
              y: -4,
              boxShadow: "10px 10px 0 var(--ink)",
              transition: { duration: 0.2, ease: easeOut },
            }
      }
    >
      <div className="chain-cap">
        <div className="chain-cap-meta">
          <div className="chain-cap-title">
            <h3>{featuredHabit.title}</h3>
            <span className="chip chip-blue">{featuredHabit.schedule}</span>
          </div>
          <p className="chain-cap-sub mono muted">Last 364 days</p>
        </div>

        <div className="chain-stats">
          <Stat label="Current" value={String(featuredHabit.streakDays)} flame />
          <Stat
            label="Longest"
            value={String(featuredDetail?.longestStreak ?? featuredHabit.streakDays)}
          />
          <Stat label="Rate" value={`${featuredHabit.rate}%`} />
        </div>
      </div>

      <div className="heat-scroll">
        <div
          className="chain chain-motion"
          role="img"
          aria-label={`Year heatmap for ${featuredHabit.title}, last 364 days`}
        >
          {columns.map((col, wi) => (
            <motion.div
              key={wi}
              className="chain-col"
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

      <div className="heat-legend chain-legend">
        <span>Less</span>
        <i style={{ background: "var(--l0)" }} />
        <i style={{ background: "var(--l1)" }} />
        <i style={{ background: "var(--l2)" }} />
        <i style={{ background: "var(--l3)" }} />
        <i style={{ background: "var(--l4)" }} />
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
      className="chain-stat"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <div className="stat-k">{label}</div>
      <div className={flame ? "stat-v streak" : "stat-v"}>
        {flame ? (
          <span className="row" style={{ gap: 5 }}>
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
              style={{ display: "inline-flex" }}
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

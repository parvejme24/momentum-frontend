"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { BrandLink } from "@/components/home/brand-mark";
import { easeOut } from "@/components/home/motion";
import { cn } from "@/lib/utils";

const WEEKS = 28;
const DAYS = 7;

const CELL_LEVEL = [
  "bg-[var(--auth-cell-0)]",
  "bg-[var(--auth-cell-1)]",
  "bg-[var(--auth-cell-2)]",
  "bg-[var(--auth-cell-3)]",
  "bg-[var(--auth-cell-4)]",
] as const;

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

function buildChain(seed: number): CellLevel[] {
  const rand = mulberry32(seed);
  return Array.from({ length: WEEKS * DAYS }, () => {
    const roll = rand();
    if (roll > 0.78) return 0;
    if (roll > 0.55) return 1;
    if (roll > 0.32) return 2;
    if (roll > 0.14) return 3;
    return 4;
  });
}

function levelClass(level: CellLevel): string {
  return cn(
    "relative size-[15px] rounded-[2px] border border-[var(--auth-cell-border)] transition-[transform,border-color,box-shadow] duration-fast ease-smooth hover:z-[2] hover:scale-[1.35] hover:border-[color-mix(in_srgb,var(--blue)_35%,transparent)] hover:shadow-paper-sm dark:hover:border-[#8ba4c9]/55 dark:hover:shadow-[2px_2px_0_rgba(139,164,201,0.35)]",
    CELL_LEVEL[level],
  );
}

export function AuthChain({ seed = 42 }: { seed?: number }) {
  const cells = useMemo(() => buildChain(seed), [seed]);
  const columns = useMemo(() => {
    const cols: CellLevel[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      cols.push(cells.slice(w * DAYS, w * DAYS + DAYS));
    }
    return cols;
  }, [cells]);

  return (
    <div className="my-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
      <div
        className="flex w-max flex-row gap-1"
        role="img"
        aria-label="Habit chain preview"
      >
        {columns.map((col, wi) => (
          <motion.div
            key={wi}
            className="flex flex-col gap-1"
            initial={false}
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  delayChildren: wi * 0.012,
                  staggerChildren: 0.01,
                },
              },
            }}
          >
            {col.map((level, di) => (
              <motion.i
                key={`${wi}-${di}`}
                className={levelClass(level)}
                initial={false}
                variants={{
                  hidden: { opacity: 0, scale: 0.3 },
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

export function AuthArtPanel({
  headline,
  body,
  footer,
}: {
  headline: string;
  body: string;
  footer: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        "flex flex-col justify-between gap-[var(--space-5)] overflow-hidden border-r-[var(--auth-split)] bg-auth-art p-[var(--space-6)] text-[var(--auth-art-fg)] transition-[background-color,color] duration-normal ease-smooth max-nav:hidden",
        "dark:border-r-[rgba(221,216,207,0.08)] dark:bg-[linear-gradient(165deg,color-mix(in_srgb,var(--blue-soft)_50%,var(--auth-art-bg))_0%,var(--auth-art-bg)_48%,color-mix(in_srgb,var(--flame-soft)_75%,var(--auth-art-bg))_100%)]",
      )}
    >
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <BrandLink size="md" className="text-[var(--auth-art-fg)]" />
        <h1 className="mt-7 font-heading text-[clamp(2rem,3.4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--auth-art-fg)]">
          {headline}
        </h1>
        <p className="mt-3.5 max-w-[34ch] text-[1.02rem] leading-[1.55] text-[var(--auth-art-muted)]">
          {body}
        </p>
      </motion.div>

      <AuthChain />

      <div className="font-mono text-[0.72rem] tracking-[0.06em] text-[var(--auth-art-faint)] uppercase tabular-nums">
        {footer}
      </div>
    </aside>
  );
}

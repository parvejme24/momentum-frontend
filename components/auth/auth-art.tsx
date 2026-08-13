"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { BrandLockup } from "@/components/home/brand-mark";
import { easeOut } from "@/components/home/motion";

const WEEKS = 28;
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
  if (level === 0) return "cell";
  return `cell l${level}`;
}

export function AuthChain({ seed = 42 }: { seed?: number }) {
  const reduce = useReducedMotion();
  const cells = useMemo(() => buildChain(seed), [seed]);
  const columns = useMemo(() => {
    const cols: CellLevel[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      cols.push(cells.slice(w * DAYS, w * DAYS + DAYS));
    }
    return cols;
  }, [cells]);

  return (
    <div className="heat-scroll auth-chain-scroll">
      <div
        className="chain chain-motion auth-chain"
        role="img"
        aria-label="Habit chain preview"
      >
        {columns.map((col, wi) => (
          <motion.div
            key={wi}
            className="chain-col"
            initial={reduce ? false : "hidden"}
            animate="show"
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
            {col.map((level, di) => (
              <motion.i
                key={`${wi}-${di}`}
                className={levelClass(level)}
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
  const reduce = useReducedMotion();

  return (
    <aside className="auth-art">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <BrandLockup size="md" className="auth-brand" />
        <h1 className="auth-art-title">{headline}</h1>
        <p className="auth-art-body">{body}</p>
      </motion.div>

      <AuthChain />

      <div className="auth-art-foot mono">{footer}</div>
    </aside>
  );
}

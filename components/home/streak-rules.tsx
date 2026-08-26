"use client";

import { motion, useReducedMotion } from "framer-motion";

import { MotionItem, MotionSection } from "@/components/home/motion";
import { cn } from "@/lib/utils";
import { eyebrow, muted, row, section, wrap } from "@/lib/ui";

type Cell = "on" | "na" | "miss" | "empty";

const RULES: {
  title: string;
  body: string;
  strip: Cell[];
}[] = [
  {
    title: "Show up → the square fills",
    body: "A completed day stamps the cell. Intensity deepens when you keep stacking — the chain is the proof.",
    strip: ["on", "on", "on", "on"],
  },
  {
    title: "Rest days keep the chain",
    body: "Scheduled rest is part of the plan. Those cells sit quiet so recovery never looks like failure.",
    strip: ["on", "na", "on", "on"],
  },
  {
    title: "A miss leaves a gap",
    body: "Empty is honest. One miss ends the current streak — then the next filled square starts a new one.",
    strip: ["on", "on", "miss", "on"],
  },
  {
    title: "Skip is intentional",
    body: "Mark a skip when you choose not to. It’s recorded without pretending you were there.",
    strip: ["on", "empty", "on", "on"],
  },
];

function cellClass(cell: Cell): string {
  return cn(
    "block aspect-square rounded-[2px] border border-[rgba(20,26,46,0.08)] bg-l0",
    cell === "on" && "bg-l4",
    cell === "na" &&
      "bg-[repeating-linear-gradient(45deg,var(--rule)_0_2px,transparent_2px_4px)]",
    cell === "miss" && "border-flame bg-flame-soft",
  );
}

const legendSwatch =
  "block size-3 rounded-[2px] border border-[rgba(20,26,46,0.07)]";

export function StreakRules() {
  const reduce = useReducedMotion();

  return (
    <MotionSection id="rules" className={section}>
      <div className={wrap}>
        <MotionItem>
          <p className={cn(eyebrow, "text-overprint")}>
            Streak rules
          </p>
          <h2 className="mt-[var(--space-2)]">Clear rules. No soft counting.</h2>
        </MotionItem>

        <div className="mt-[var(--space-5)] grid gap-3">
          {RULES.map((rule) => (
            <MotionItem
              key={rule.title}
              as="article"
              className="grid grid-cols-[78px_1fr] items-start gap-[18px] rounded-lg border border-[var(--stroke)] bg-paper-raised p-5 shadow-paper-sm max-[640px]:grid-cols-1"
              hoverLift
            >
              <motion.div
                className="grid max-[640px]:max-w-[90px] grid-cols-4 gap-[3px]"
                aria-hidden
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  show: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
                  },
                }}
              >
                {rule.strip.map((cell, i) => (
                  <motion.i
                    key={`${rule.title}-${i}`}
                    className={cellClass(cell)}
                    variants={{
                      hidden: { opacity: 0, scale: 0.4 },
                      show: {
                        opacity: 1,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 420,
                          damping: 18,
                        },
                      },
                    }}
                    whileHover={
                      reduce
                        ? undefined
                        : { scale: 1.2, transition: { duration: 0.12 } }
                    }
                  />
                ))}
              </motion.div>
              <div>
                <h3>{rule.title}</h3>
                <p className={cn(muted, "mt-2 text-[0.92rem]")}>
                  {rule.body}
                </p>
              </div>
            </MotionItem>
          ))}
        </div>

        <MotionItem>
          <div className="mt-5 flex items-center gap-3.5 font-mono text-[0.68rem] text-ink-50">
            <span className={cn(row, "gap-1.5")}>
              <i className={cn(legendSwatch, "bg-l4")} /> On
            </span>
            <span className={cn(row, "gap-1.5")}>
              <i
                className={cn(
                  legendSwatch,
                  "bg-[repeating-linear-gradient(45deg,var(--rule)_0_2px,transparent_2px_4px)]",
                )}
              />{" "}
              Rest
            </span>
            <span className={cn(row, "gap-1.5")}>
              <i className={cn(legendSwatch, "border-flame bg-flame-soft")} />{" "}
              Miss
            </span>
          </div>
        </MotionItem>
      </div>
    </MotionSection>
  );
}

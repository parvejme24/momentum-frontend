"use client";

import { motion, useReducedMotion } from "framer-motion";

import { MotionItem, MotionSection } from "@/components/home/motion";

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
  if (cell === "on") return "on";
  if (cell === "na") return "na";
  if (cell === "miss") return "miss";
  return "";
}

export function StreakRules() {
  const reduce = useReducedMotion();

  return (
    <MotionSection id="rules" className="section">
      <div className="wrap">
        <MotionItem>
          <p className="eyebrow" style={{ color: "var(--overprint)" }}>
            Streak rules
          </p>
          <h2 style={{ marginTop: 12 }}>Clear rules. No soft counting.</h2>
        </MotionItem>

        <div style={{ marginTop: 40, display: "grid", gap: 12 }}>
          {RULES.map((rule) => (
            <MotionItem
              key={rule.title}
              as="article"
              className="rule-card"
              hoverLift
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <motion.div
                className="rule-demo"
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
                <p className="muted" style={{ marginTop: 8, fontSize: "0.92rem" }}>
                  {rule.body}
                </p>
              </div>
            </MotionItem>
          ))}
        </div>

        <MotionItem>
          <div className="heat-legend" style={{ marginTop: 20, gap: 14 }}>
            <span className="row" style={{ gap: 6 }}>
              <i style={{ background: "var(--l4)" }} /> On
            </span>
            <span className="row" style={{ gap: 6 }}>
              <i
                style={{
                  background:
                    "repeating-linear-gradient(45deg, var(--rule) 0 2px, transparent 2px 4px)",
                }}
              />{" "}
              Rest
            </span>
            <span className="row" style={{ gap: 6 }}>
              <i
                style={{
                  background: "var(--flame-soft)",
                  borderColor: "var(--flame)",
                }}
              />{" "}
              Miss
            </span>
          </div>
        </MotionItem>
      </div>
    </MotionSection>
  );
}

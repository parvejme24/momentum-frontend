"use client";

import { motion, useReducedMotion } from "framer-motion";

import { MotionItem, MotionSection, easeOut } from "@/components/home/motion";

const FEATURES = [
  {
    ico: "▦",
    title: "Four schedule types",
    body: "Daily, weekdays, custom days, or flexible counts. Pick the rhythm that matches the habit — not the other way around.",
  },
  {
    ico: "↻",
    title: "Streaks that understand rest",
    body: "Planned rest days don’t break the chain. Missed days do. The rules stay readable so you never argue with the counter.",
  },
  {
    ico: "◎",
    title: "Timezone reminders",
    body: "Nudges land in your day, not the server’s. Set once; “today” stays correct wherever you check in.",
  },
  {
    ico: "◫",
    title: "Laptop and phone",
    body: "The same logbook on both. Mark a square at the desk or on the train — the chain stays one.",
  },
  {
    ico: "#",
    title: "Honest 7 / 30 / 90 numbers",
    body: "Rates over the windows that matter. No vanity charts — just how often you showed up when it counted.",
  },
  {
    ico: "–",
    title: "Skip without guilt",
    body: "Skip marks the day intentionally. It’s recorded without pretending you were there.",
  },
] as const;

export function Features() {
  const reduce = useReducedMotion();

  return (
    <MotionSection id="features" className="section">
      <div className="wrap">
        <MotionItem>
          <p className="eyebrow">Features</p>
          <h2>Built like a logbook, not a dashboard.</h2>
        </MotionItem>

        <div className="grid-3 section-stack">
          {FEATURES.map((feature) => (
            <MotionItem
              key={feature.title}
              as="article"
              className="feat"
              hoverLift
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <motion.div
                className="feat-ico"
                aria-hidden
                whileHover={
                  reduce
                    ? undefined
                    : {
                        rotate: [-2, 2, 0],
                        scale: 1.06,
                        backgroundColor: "var(--blue)",
                        color: "var(--solid-white)",
                        transition: { duration: 0.35, ease: easeOut },
                      }
                }
              >
                {feature.ico}
              </motion.div>
              <h3>{feature.title}</h3>
              <p className="muted" style={{ marginTop: 10, fontSize: "0.92rem" }}>
                {feature.body}
              </p>
            </MotionItem>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

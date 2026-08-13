"use client";

import { MotionItem, MotionSection } from "@/components/home/motion";

const STEPS = [
  {
    code: "01/SET",
    title: "Tell it when",
    body: "Every day, weekdays, a custom cadence, or flexible targets. The schedule is the contract — the squares follow it.",
  },
  {
    code: "02/MARK",
    title: "One tap, done",
    body: "Open the day, mark the square. No rituals, no feeds. Just the logbook getting darker as you keep the promise.",
  },
  {
    code: "03/HOLD",
    title: "Watch the chain grow",
    body: "Streaks, rests, and honest rates sit beside the chain. You always know where you stand — and what breaks it.",
  },
] as const;

export function HowItWorks() {
  return (
    <MotionSection id="how" className="section">
      <div className="wrap">
        <MotionItem>
          <p className="eyebrow flame">How it works</p>
          <h2 style={{ marginTop: 12 }}>Three moves. Then the page fills itself.</h2>
        </MotionItem>

        <div className="grid-3" style={{ marginTop: 40 }}>
          {STEPS.map((step, index) => (
            <MotionItem
              key={step.code}
              as="article"
              className="step"
              hoverLift
              style={{
                padding: 22,
                background: "var(--paper-raised)",
                border: "var(--stroke)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)",
              }}
              transition={{ delay: index * 0.04 }}
            >
              <span className="step-n">{step.code}</span>
              <h3>{step.title}</h3>
              <p className="muted" style={{ marginTop: 10, fontSize: "0.95rem" }}>
                {step.body}
              </p>
            </MotionItem>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

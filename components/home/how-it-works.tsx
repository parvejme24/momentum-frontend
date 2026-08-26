"use client";

import { MotionItem, MotionSection } from "@/components/home/motion";
import { cn } from "@/lib/utils";
import { eyebrow, muted, section, wrap } from "@/lib/ui";

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
    <MotionSection id="how" className={section}>
      <div className={wrap}>
        <MotionItem>
          <p className={cn(eyebrow, "text-flame")}>How it works</p>
          <h2 className="mt-[var(--space-2)]">Three moves. Then the page fills itself.</h2>
        </MotionItem>

        <div className="mt-[var(--space-5)] grid grid-cols-1 gap-[var(--gap)] nav:grid-cols-3">
          {STEPS.map((step, index) => (
            <MotionItem
              key={step.code}
              as="article"
              className="relative rounded-lg border border-[var(--stroke)] bg-paper-raised p-[22px] pt-[22px] shadow-paper-sm before:absolute before:top-0 before:right-0 before:left-0 before:h-[3px] before:bg-ink before:content-['']"
              hoverLift
              transition={{ delay: index * 0.04 }}
            >
              <span className="mb-2.5 block font-mono text-[0.74rem] font-bold tracking-[0.1em] text-flame">
                {step.code}
              </span>
              <h3>{step.title}</h3>
              <p className={cn(muted, "mt-2.5 text-[0.95rem]")}>
                {step.body}
              </p>
            </MotionItem>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

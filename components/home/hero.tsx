"use client";

import { motion, useReducedMotion } from "framer-motion";

import { InkButton } from "@/components/home/ink-button";
import { DemoLink } from "@/components/home/demo-link";
import { easeOut, fadeUp, staggerContainer } from "@/components/home/motion";
import { YearHeatmap } from "@/components/home/year-heatmap";
import { cn } from "@/lib/utils";
import { btn, btnGhost, btnLg, eyebrow, hDisplay, lede, wrap } from "@/lib/ui";

const ghost =
  "relative isolate inline-block pr-[5px] pb-[5px] before:pointer-events-none before:absolute before:top-[5px] before:left-[5px] before:z-0 before:text-flame before:opacity-85 before:select-none before:content-[attr(data-ghost)] max-[640px]:before:top-[3px] max-[640px]:before:left-[3px]";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="pt-section pb-[var(--space-5)]"
      aria-labelledby="hero-title"
    >
      <motion.div
        className={cn(wrap, "flex flex-col gap-[var(--space-5)]")}
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <div className="flex max-w-[46rem] flex-col items-start gap-0">
          <motion.p className={cn(eyebrow, "m-0")} variants={reduce ? undefined : fadeUp}>
            A logbook for the days you showed up
          </motion.p>

          <motion.h1
            id="hero-title"
            className={cn(hDisplay, "relative z-1 mt-[var(--space-2)] mb-0 overflow-visible leading-[1.05] pb-0")}
            variants={reduce ? undefined : fadeUp}
          >
            <span className={ghost} data-ghost="Mark the day.">
              <span className="relative z-1 text-ink">Mark the day.</span>
            </span>
          </motion.h1>

          <motion.p
            className={cn(lede, "relative z-0 mt-[var(--space-2)] block max-w-[36rem]")}
            variants={reduce ? undefined : fadeUp}
          >
            Make consistency visible: one square per day, filled when you show
            up — on laptop or phone.
          </motion.p>

          <motion.div
            className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-2)] max-[640px]:w-full max-[640px]:flex-col max-[640px]:items-stretch"
            variants={reduce ? undefined : fadeUp}
          >
            <InkButton href="/register" size="lg" className="max-[640px]:w-full">
              Start tracking
            </InkButton>
            <DemoLink className={cn(btn, btnGhost, btnLg, "max-[640px]:w-full")}>
              Open the demo →
            </DemoLink>
          </motion.div>
        </div>

        <motion.div
          className="w-full min-w-0"
          variants={reduce ? undefined : fadeUp}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.08 }}
        >
          <YearHeatmap />
        </motion.div>
      </motion.div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";

import { InkButton } from "@/components/home/ink-button";
import { easeOut, fadeUp, staggerContainer } from "@/components/home/motion";
import { YearHeatmap } from "@/components/home/year-heatmap";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <motion.div
        className="wrap hero-inner"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <div className="hero-copy">
          <motion.p className="eyebrow" variants={reduce ? undefined : fadeUp}>
            A logbook for the days you showed up
          </motion.p>

          <motion.h1
            id="hero-title"
            className="hero-title h-display"
            variants={reduce ? undefined : fadeUp}
          >
            <span className="ghost" data-ghost="Mark the day.">
              <span className="ghost-ink">Mark the day.</span>
            </span>
          </motion.h1>

          <motion.p
            className="hero-lede lede"
            variants={reduce ? undefined : fadeUp}
          >
            Make consistency visible: one square per day, filled when you show
            up — on laptop or phone.
          </motion.p>

          <motion.div
            className="hero-cta"
            variants={reduce ? undefined : fadeUp}
          >
            <InkButton href="/register" size="lg">
              Start tracking
            </InkButton>
            <InkButton href="#demo" variant="ghost" size="lg">
              Open the demo →
            </InkButton>
          </motion.div>
        </div>

        <motion.div
          className="hero-demo"
          variants={reduce ? undefined : fadeUp}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.08 }}
        >
          <YearHeatmap />
        </motion.div>
      </motion.div>
    </section>
  );
}

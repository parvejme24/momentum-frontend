"use client";

import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { BrandLink } from "@/components/home/brand-mark";
import { InkButton } from "@/components/home/ink-button";
import { fadeUp, staggerContainer } from "@/components/home/motion";
import { BlankChain } from "@/components/not-found/blank-chain";

export function NotFoundPage() {
  const reduce = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <div className="not-found">
        <header className="not-found-bar">
          <div className="wrap">
            <BrandLink size="lg" />
            <InkButton href="/dashboard" variant="ghost" size="sm">
              Back to today
            </InkButton>
          </div>
        </header>

        <main className="not-found-main">
          <motion.div
            className="wrap-narrow not-found-inner"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={reduce ? undefined : staggerContainer}
          >
            <motion.p
              className="eyebrow flame"
              variants={reduce ? undefined : fadeUp}
            >
              Error 404
            </motion.p>

            <motion.h1
              className="not-found-title h-display"
              variants={reduce ? undefined : fadeUp}
            >
              <span className="ghost" data-ghost="Blank day.">
                <span className="ghost-ink">Blank day.</span>
              </span>
            </motion.h1>

            <motion.p
              className="lede not-found-lede"
              variants={reduce ? undefined : fadeUp}
            >
              This page doesn’t exist — nothing was logged here. Habits and
              marked days are exactly where they were left.
            </motion.p>

            <motion.div
              className="not-found-motif"
              variants={reduce ? undefined : fadeUp}
            >
              <BlankChain />
            </motion.div>

            <motion.div
              className="not-found-cta"
              variants={reduce ? undefined : fadeUp}
            >
              <InkButton href="/dashboard" size="lg">
                Go to today
              </InkButton>
              <InkButton href="/" variant="ghost" size="lg">
                Back to the homepage
              </InkButton>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}
